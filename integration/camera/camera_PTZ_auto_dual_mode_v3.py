import json
import math
import requests
import time
import threading

from kafka import KafkaConsumer

# ---------------- CONFIG ----------------
KAFKA_BROKER  = '192.168.2.136:9092'
RADAR_TOPIC   = 'radar_processed'
CONTROL_TOPIC = 'camera_ptz_control'    # One-way IN from camera_server_v3.py
CAMERA_SERVER_URL = 'http://192.168.2.136:8000/ptz1'

# DUAL MODE CONFIGURATION:
# "GPS"     → Use radar's lat/lon + camera GPS for global geometry. No parallax issue.
# "AZIMUTH" → Use radar's r (range) + theta (azimuth). Parallax correction applied (v3 fix).
CALCULATION_MODE = "AZIMUTH"  # Options: "GPS" or "AZIMUTH"

# Camera Physical Location (measure on test day with GPS app)
CAMERA_LAT, CAMERA_LON, CAMERA_HEIGHT = 22.1303168, 89.0565320, 13

# Home position: fixed gimbal angles the camera parks at when idle/track-lost.
HOME_PAN  = 0.0    # degrees — camera physical zero mark / boresight direction
HOME_TILT = 0.0    # degrees — camera level (horizon)

# --- SEPARATE CALIBRATION OFFSETS ---
PAN_OFFSET  = 9.0   # Degrees. Correct for camera mount direction vs geographic North.
TILT_OFFSET = 9.0   # Degrees. Correct for camera mount tilt.
# ------------------------------------

TARGET_HEIGHT    = 2     # meters above sea level (assumed for boats/vessels)
SYSTEM_LATENCY   = 0.6   # seconds. Total lag from radar measurement to camera movement.
WATCHDOG_TIMEOUT = 5.0   # seconds. Time before assuming target lost.
ENABLE_AUTO_ZOOM = True  # Toggle to False if zoom fails; pan/tilt will keep working

# ---- v3 FIX: RADAR-TO-CAMERA PARALLAX OFFSET ----
# Physical offset from RADAR to CAMERA position (in meters).
# Measure on site: stand at radar, walk to camera, note East/North displacement.
# +DX = camera is East  of radar (in meters)
# +DY = camera is North of radar (in meters)
# If radar and camera are co-located (same pole), set both to 0.0
RADAR_CAM_DX = 0.0   # East offset in meters  (adjust on test day)
RADAR_CAM_DY = 0.0   # North offset in meters (adjust on test day)
# --------------------------------------------------


# ---------------- GLOBAL STATE ----------------
active_track_id    = None
last_seen_time     = 0
is_homed           = True
state_lock         = threading.Lock()
slew_once_mode     = False
current_zoom_state = "stop"

print("Started...")


# ---------------- MATH HELPERS ----------------

def calculate_ptz_from_gps(t_lat, t_lon):
    """GPS-based bearing from camera to target. No parallax issue."""
    lat1, lon1 = math.radians(CAMERA_LAT), math.radians(CAMERA_LON)
    lat2, lon2 = math.radians(t_lat), math.radians(t_lon)
    d_lon = lon2 - lon1

    x = math.sin(d_lon) * math.cos(lat2)
    y = math.cos(lat1) * math.sin(lat2) - (math.sin(lat1) * math.cos(lat2) * math.cos(d_lon))
    raw_pan   = math.degrees(math.atan2(x, y))
    final_pan = (raw_pan + PAN_OFFSET + 360) % 360

    a    = math.sin((lat2-lat1)/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(d_lon/2)**2
    dist = 6371000 * (2 * math.atan2(math.sqrt(a), math.sqrt(1-a)))
    raw_tilt   = math.degrees(math.atan2(TARGET_HEIGHT - CAMERA_HEIGHT, dist))
    final_tilt = raw_tilt + TILT_OFFSET

    return round(final_pan, 2), round(final_tilt, 2)


def calculate_ptz_gps_predictive(track):
    """GPS-based predictive bearing using velocity-compensated position."""
    t_lat  = track.get('latitude', 0.0)
    t_lon  = track.get('longitude', 0.0)
    vel_vx = track.get('vel_vx', 0.0)
    vel_vy = track.get('vel_vy', 0.0)

    delta_lat = (vel_vy * SYSTEM_LATENCY) / 111000.0
    delta_lon = (vel_vx * SYSTEM_LATENCY) / (111000.0 * math.cos(math.radians(t_lat)))
    pred_lat = t_lat + delta_lat
    pred_lon = t_lon + delta_lon

    lat1, lon1 = math.radians(CAMERA_LAT), math.radians(CAMERA_LON)
    lat2, lon2 = math.radians(pred_lat), math.radians(pred_lon)
    d_lon = lon2 - lon1

    x = math.sin(d_lon) * math.cos(lat2)
    y = math.cos(lat1) * math.sin(lat2) - (math.sin(lat1) * math.cos(lat2) * math.cos(d_lon))
    raw_pan   = math.degrees(math.atan2(x, y))
    final_pan = (raw_pan + PAN_OFFSET + 360) % 360

    a    = math.sin((lat2-lat1)/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(d_lon/2)**2
    dist = 6371000 * (2 * math.atan2(math.sqrt(a), math.sqrt(1-a)))
    raw_tilt   = math.degrees(math.atan2(TARGET_HEIGHT - CAMERA_HEIGHT, dist))
    final_tilt = raw_tilt + TILT_OFFSET

    return round(final_pan, 2), round(final_tilt, 2), dist


def calculate_ptz_from_radar(track):
    print("Track: ",track)
    """
    v3 FIX: Computes Pan/Tilt from radar polar (r, theta) or Cartesian (x, y),
    with proper camera-radar parallax correction applied.

    The radar measures target position relative to THE RADAR.
    The camera needs to point relative to THE CAMERA.
    If they are physically separated, this offset (RADAR_CAM_DX, RADAR_CAM_DY)
    must be subtracted from the radar-centric target position before computing the angle.

    Coordinate system (radar-centric):
      +X = East
      +Y = North
      Azimuth = 0 at North, increases clockwise (like a compass bearing)
    """
    r_km    = track.get('range')
    azi_deg = track.get('azimuth')
    vel_vx  = track.get('vel_vx', 0.0)
    vel_vy  = track.get('vel_vy', 0.0)
    # print("data_From_radar", r_km, azi_deg, vel_vx, vel_vy )

    if r_km is not None and azi_deg is not None:
        # ---- POLAR PATH (r, theta) ----
        dist_radar = r_km * 1000.0  # km → meters

        # Step 1: Convert polar (radar frame) to Cartesian (radar frame)
        # Azimuth convention: 0=North, 90=East → sin for East, cos for North
        tx_radar = dist_radar * math.sin(math.radians(azi_deg))   # East component
        ty_radar = dist_radar * math.cos(math.radians(azi_deg))   # North component

        # Step 2: Apply velocity prediction (move target to where it will be)
        tx_pred = tx_radar + (vel_vx * SYSTEM_LATENCY)
        ty_pred = ty_radar + (vel_vy * SYSTEM_LATENCY)

        # Step 3: v3 FIX — Translate to CAMERA frame by subtracting camera-radar offset
        # If camera is DX meters East and DY meters North of radar:
        #   target appears at (tx_pred - DX, ty_pred - DY) from the camera
        tx_cam = tx_pred - RADAR_CAM_DX
        ty_cam = ty_pred - RADAR_CAM_DY

        print(f"[PARALLAX] Radar→Target: ({tx_radar:.1f}E, {ty_radar:.1f}N)m | "
              f"Cam offset: ({RADAR_CAM_DX}E, {RADAR_CAM_DY}N)m | "
              f"Cam→Target: ({tx_cam:.1f}E, {ty_cam:.1f}N)m")

    else:
        # ---- CARTESIAN FALLBACK (pos_x, pos_y) ----
        # pos_x, pos_y are already in radar-centric Cartesian
        tx_pred = track.get('pos_x', 0.0) + (vel_vx * SYSTEM_LATENCY)
        ty_pred = track.get('pos_y', 0.0) + (vel_vy * SYSTEM_LATENCY)

        # v3 FIX — Apply camera-radar offset to Cartesian fallback too
        tx_cam = tx_pred - RADAR_CAM_DX
        ty_cam = ty_pred - RADAR_CAM_DY

    # Step 4: Compute bearing and distance from camera to target
    dist_cam = math.sqrt(tx_cam**2 + ty_cam**2)
    if dist_cam < 0.1:
        dist_cam = 0.1   # Guard against division by zero if co-located

    # atan2(East, North) gives clockwise bearing from North = compass bearing
    raw_pan   = math.degrees(math.atan2(tx_cam, ty_cam))
    final_pan = (raw_pan + PAN_OFFSET + 360) % 360
    print("final_pan",final_pan)

    # Step 5: Compute tilt using camera-to-target distance
    raw_tilt   = math.degrees(math.atan2(TARGET_HEIGHT - CAMERA_HEIGHT, dist_cam))
    final_tilt = raw_tilt + TILT_OFFSET
    print("final_tilt", final_tilt)


    return round(final_pan, 2), round(final_tilt, 2), round(dist_cam, 1)


# ---------------- COMMAND SENDER ----------------

last_sent_time_cmd = 0.0
last_sent_pan      = None
last_sent_tilt     = None

def send_camera_cmd(p, t, mode_label, z=None, is_special=False):
    global last_sent_time_cmd, last_sent_pan, last_sent_tilt

    current_time = time.time()
    is_special   = is_special or (z is not None) or (mode_label in ["REVERT-HOME", "STOP-TRACKING"])

    if not is_special:
        if (current_time - last_sent_time_cmd) < 0.4:
            return
        if last_sent_pan is not None and last_sent_tilt is not None:
            pan_diff  = abs((p - last_sent_pan + 180) % 360 - 180)
            tilt_diff = abs(t - last_sent_tilt)
            if pan_diff < 0.5 and tilt_diff < 0.5:
                return

    zoom_str = f", Zoom={z}" if z else ""
    print(f"[{mode_label}] CALC: Pan={p}, Tilt={t}{zoom_str}")

    payload = {"pan": p, "tilt": t, "zoom": z, "track_id": None}
    try:
        requests.post(CAMERA_SERVER_URL, json=payload, timeout=0.5)
        last_sent_time_cmd = current_time
        last_sent_pan      = p
        last_sent_tilt     = t
    except Exception as e:
        print(f"Camera Link Error: {e}")


# ---------------- THREADS ----------------

def watchdog_timer():
    global active_track_id, is_homed
    while True:
        time.sleep(1)
        with state_lock:
            if active_track_id is not None and not is_homed:
                if (time.time() - last_seen_time) > WATCHDOG_TIMEOUT:
                    print(f"\n[WATCHDOG] Track {active_track_id} lost. Snapping Home (Pan={HOME_PAN}, Tilt={HOME_TILT})...")
                    send_camera_cmd(HOME_PAN, HOME_TILT, "REVERT-HOME", z="stop")
                    active_track_id = None
                    is_homed        = True


def kafka_listener():
    global active_track_id, last_seen_time, is_homed, current_zoom_state, last_sent_pan, last_sent_tilt, slew_once_mode

    consumer = KafkaConsumer(
        RADAR_TOPIC, CONTROL_TOPIC,
        bootstrap_servers=[KAFKA_BROKER],
        auto_offset_reset='latest',
        group_id='ptz_daemon_v3',
        value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )

    print("=" * 60)
    print(f"  camera_PTZ_auto_dual_mode_v3.py (Mode: {CALCULATION_MODE})")
    print(f"  Control topic  : {CONTROL_TOPIC}  (one-way IN)")
    print(f"  Radar topic    : {RADAR_TOPIC}")
    print(f"  Kafka broker   : {KAFKA_BROKER}")
    print(f"  Parallax DX,DY : {RADAR_CAM_DX}m E, {RADAR_CAM_DY}m N")
    print("=" * 60)
    print("  Waiting for control commands and radar tracks...")

    for message in consumer:
        data = message.value

        # ---- CONTROL MESSAGES ----
        if message.topic == CONTROL_TOPIC:
            print(f"\n[INCOMING CONTROL] Body: {data}")
            with state_lock:
                req_tid = data.get('track_id')
                status  = data.get('status', 'tracking')

                if req_tid is None or str(req_tid).strip().lower() in ["", "none", "0", "null"]:
                    active_track_id = None
                    slew_once_mode  = False
                    print("[STATUS] Tracking cancelled. Gimbal idle.")
                    if not is_homed:
                        is_homed = True
                        send_camera_cmd(HOME_PAN, HOME_TILT, "STOP-TRACKING", z="stop")
                    else:
                        print("[STATUS] Gimbal already home. Command skipped.")
                else:
                    active_track_id = req_tid
                    is_homed        = False
                    last_seen_time  = time.time()
                    if status == "slew_once":
                        slew_once_mode = True
                        print(f"[STATUS] Slew-Once Lock-on Target: {active_track_id}")
                    else:
                        slew_once_mode = False
                        print(f"[STATUS] Continuous Tracking Target: {active_track_id}")

        # ---- RADAR TRACK DATA ----
        elif message.topic == RADAR_TOPIC:
            track = data.get('track', {})
            # print("Track: ", track)
            tid   = track.get('id')

            is_active    = False
            is_slew_once = False
            with state_lock:
                if active_track_id is not None and tid == active_track_id:
                    is_active    = True
                    is_slew_once = slew_once_mode

            if is_active:
                if CALCULATION_MODE == "GPS":
                    t_lat = track.get('latitude', 0.0)
                    t_lon = track.get('longitude', 0.0)
                    if t_lat != 0.0 and t_lon != 0.0:
                        pan, tilt, dist = calculate_ptz_gps_predictive(track)
                    else:
                        print("[WARNING] GPS mode selected but target GPS missing. Falling back to Azimuth...")
                        pan, tilt, dist = calculate_ptz_from_radar(track)
                else:
                    pan, tilt, dist = calculate_ptz_from_radar(track)

                if is_slew_once:
                    send_camera_cmd(pan, tilt, "SLEW-ONCE", z="stop", is_special=True)
                    with state_lock:
                        active_track_id = None
                        slew_once_mode  = False
                        is_homed        = False
                    print(f"[STATUS] Slew-Once to Target {tid} complete. Position held.")
                else:
                    zoom_cmd = None
                    if ENABLE_AUTO_ZOOM:
                        if dist > 1500.0:
                            target_zoom = "in"
                        elif dist < 500.0:
                            target_zoom = "out"
                        else:
                            target_zoom = "stop"

                        if target_zoom != current_zoom_state:
                            current_zoom_state = target_zoom
                            zoom_cmd           = target_zoom

                    send_camera_cmd(pan, tilt, "TRACKING", z=zoom_cmd)
                    with state_lock:
                        last_seen_time = time.time()
                        is_homed       = False


# ---------------- START ----------------
if __name__ == "__main__":
    # threading.Thread(target=watchdog_timer, daemon=True).start()
    try:
        kafka_listener()
    except KeyboardInterrupt:
        print("\nExiting...")
