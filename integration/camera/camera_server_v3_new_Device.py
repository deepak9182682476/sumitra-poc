import socket
import struct
import random
import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from kafka import KafkaProducer


# ---------------- CONFIG ----------------
CAMERA_IP = "192.168.2.71"
UDP_PORT = 5000
KAFKA_BROKER = "192.168.2.136:9092"

# ---- TOPIC SPLIT (v2 change) ----
# CONTROL_TOPIC: One-way commands from UI → background daemon.
#                camera_server.py PUBLISHES here.
#                camera_PTZ_auto_dual_mode.py READS from here.
CONTROL_TOPIC = "camera_ptz_control"   # << NEW dedicated topic

# STATUS_TOPIC:  One-way status updates from daemon → camera_server.
#                camera_PTZ_auto_dual_mode.py PUBLISHES here.
#                camera_server.py does NOT read from this.
# (This topic is reserved for future monitoring dashboards)
STATUS_TOPIC   = "camera_ptz_status"   # << reserved, not used yet

TILT_MIN = -45
TILT_MAX = 45

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    producer = KafkaProducer(
        bootstrap_servers=[KAFKA_BROKER],
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )
    print(f"[v2] Kafka producer connected to {KAFKA_BROKER}")
except Exception as e:
    print(f"Warning: Kafka not connected. {e}")
    producer = None


# ---------------- HARDWARE HELPERS ----------------

def checksum(data):
    return sum(data) % 256

def encode_angle(deg):
    # According to ICD page 61/62 (TNB-AVGS50-SICD_IDDv2.pdf),
    # Goto Angular Position expects millidegrees (deg * 1000) in signed i32 range [-360000, 360000].
    # FIX: Use proper two's complement signed int32 (">i"), NOT custom sign-bit encoding.
    # Previous code ("|= 0x80000000") was wrong: -45000 millideg → 0x8000AFC8 (wrong)
    # Correct two's complement: -45000 → 0xFFFF5038
    milli = int(deg * 1000)
    milli = max(-360000, min(360000, milli))   # Clamp to ICD-specified range
    return struct.pack(">i", milli)             # lowercase 'i' = signed int32 two's complement

def build_packet(device_id, command_code, payload=b'', command_type=b'W'):
    header = b'\xE0'
    seq = struct.pack(">H", random.randint(0, 65535))
    device_number = b'\x00'
    length = struct.pack("B", 1 + 2 + len(payload))
    body = (
        struct.pack("B", device_id) +
        device_number +
        length +
        command_type +
        struct.pack(">H", command_code) +
        payload
    )
    cs = struct.pack("B", checksum(body))
    return header + seq + body + cs + b'\xFF\xFE'

def send_udp(packet):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.settimeout(0.3)
            sock.sendto(packet, (CAMERA_IP, UDP_PORT))
            try:
                sock.recvfrom(1024)
            except socket.timeout:
                pass
    except Exception as e:
        print("Network error:", e)


# ---------------- REQUEST MODELS ----------------

class PTZRequest(BaseModel):
    # pan: float | None = None
    # tilt: float | None = None
    # zoom: str | float | int | None = None   # "in", "out", "stop" or numeric
    track_id: int | str | None = None

class PTZRequest1(BaseModel):
    pan: float | None = None
    tilt: float | None = None
    zoom: str | float | int | None = None   # "in", "out", "stop" or numeric
    track_id: int | str | None = None

class TrackerRequest(BaseModel):
    # mode options: "manual_lock", "auto_start", "auto_stop", "cancel"
    mode: str
    track_id: int | str | None = None


# ---------------- API ENDPOINTS ----------------

@app.post("/tracker")
async def control_tracker(req: TrackerRequest):
    """
    Dedicated endpoint for UI control buttons (Lock, Auto-Track, Stop).
    This is the ONLY endpoint that publishes to Kafka CONTROL_TOPIC.
    Target Device: 0x0B (Video Tracker hardware)

    v2 Change: Uses 'camera_ptz_control' topic (not 'camera_ptz_auto')
               to prevent cross-listening feedback loops.
    """
    mode = req.mode.lower()

    if req.track_id is not None:
        track_str = str(req.track_id).strip().lower()
        if track_str in ["", "none", "0", "null"]:
            if producer:
                producer.send(CONTROL_TOPIC, {"track_id": None, "status": "idle"})
            return {"status": "continuous_tracking_stopped"}
        else:
            if producer:
                producer.send(CONTROL_TOPIC, {"track_id": req.track_id, "status": "tracking"})
            lock_packet = build_packet(0x0B, 0x010E, b'')
            send_udp(lock_packet)
            return {"status": "continuous_tracking_initiated", "track_id": req.track_id}

    if mode == "manual_lock":
        packet = build_packet(0x0B, 0x010E, b'')
        send_udp(packet)
        return {"status": "hardware_lock_triggered"}

    elif mode == "auto_start":
        packet = build_packet(0x0B, 0x0109, struct.pack("B", 0))
        send_udp(packet)
        return {"status": "auto_acquisition_enabled"}

    elif mode == "auto_stop":
        packet = build_packet(0x0B, 0x0109, struct.pack("B", 1))
        send_udp(packet)
        return {"status": "auto_acquisition_disabled"}

    elif mode == "cancel":
        packet = build_packet(0x0B, 0x010F, b'')
        send_udp(packet)
        # Halt the background tracking script via Kafka control message
        if producer:
            producer.send(CONTROL_TOPIC, {"track_id": None, "status": "idle"})
        return {"status": "tracking_cancelled"}

    return {"error": "invalid mode"}

@app.post("/ptz1")
async def control_ptz1(req: PTZRequest1):

    print(f"\n[API PTZ v2] ptzzzz control: {req.model_dump()}")
    results = {}
    if req.pan is not None:
        print("req_pan is......",req.pan)
        # print("encoded_angle", encode_angle(req.pan))
        send_udp(build_packet(0x10, 0x0009, encode_angle(req.pan)))
        results["pan"] = req.pan

    # -------- TILT --------
    if req.tilt is not None:
        print("req_tilt......",req.tilt)
        clamped = max(TILT_MIN, min(TILT_MAX, req.tilt))
        print("encoded_tilt", encode_angle(clamped) )
        send_udp(build_packet(0x11, 0x0009, encode_angle(clamped)))
        results["tilt"] = clamped

@app.post("/ptz")
async def control_ptz(req: PTZRequest):
    """
    Hardware PTZ command endpoint.
    Sends angles and zoom commands directly to camera via UDP.

    v2 Change: This endpoint NEVER publishes to Kafka.
               It is a pure hardware command relay.
               If track_id is provided, it only publishes ONE
               slew_once command to CONTROL_TOPIC, not 'camera_ptz_auto'.
    """
    print(f"\n[API PTZ v2] Received: {req.model_dump()}")
    results = {}

    # -------- TRACK_ID (Slew-Once trigger) --------
    if req.track_id is not None:
        print("checkpoint1")
        track_str = str(req.track_id).strip().lower()
        if track_str in ["", "none", "0", "null"]:
            # Stop command — publish only ONE cancel to control topic
            if producer:
                producer.send(CONTROL_TOPIC, {"track_id": None, "status": "idle"})
            return {"status": "tracking_stopped"}
        else:
            print("Checkpoint2")
            if producer:
                # Slew-once: point to this target's current position, then stop
                msg = {"track_id": req.track_id, "status": "slew_once"}
                producer.send(CONTROL_TOPIC, msg)
                print(f"[API PTZ v2] Published slew_once to '{CONTROL_TOPIC}': {msg}")

            # Send hardware lock packet to assist visual confirmation
            # lock_packet = build_packet(0x0B, 0x010E, b'')
            # send_udp(lock_packet)
                # if req.pan is not None:
                #     print("req_pan is......",req.pan)
                #     # print("encoded_angle", encode_angle(req.pan))
                #     send_udp(build_packet(0x10, 0x0009, encode_angle(req.pan)))
                #     results["pan"] = req.pan

                # # -------- TILT --------
                # if req.tilt is not None:
                #     print("req_tilt......",req.tilt)
                #     clamped = max(TILT_MIN, min(TILT_MAX, req.tilt))
                #     print("encoded_tilt", encode_angle(clamped) )
                #     send_udp(build_packet(0x11, 0x0009, encode_angle(clamped)))
                #     results["tilt"] = clamped
            return {"status": "slew_once_initiated", "track_id": req.track_id}

    # -------- PAN --------
    print("Moving to pan")
    if req.pan is not None:
        
        send_udp(build_packet(0x10, 0x0009, encode_angle(req.pan)))
        print("pan_done")
        results["pan"] = req.pan

    # -------- TILT --------
    if req.tilt is not None:
        clamped = max(TILT_MIN, min(TILT_MAX, req.tilt))
        send_udp(build_packet(0x11, 0x0009, encode_angle(clamped)))
        print("tilt done")
        results["tilt"] = clamped

    # -------- ZOOM --------
    # if req.zoom is not None:
    #     if isinstance(req.zoom, (int, float)):
    #         # Absolute zoom scaling command
    #         send_udp(build_packet(0x12, 0x0009, encode_angle(float(req.zoom))))
    #         results["zoom"] = float(req.zoom)
    #     else:
    #         action = str(req.zoom).lower()
    #         target_devices = [0x01, 0x02]
    #         ZOOM_STEPS = 6

    #         if action == "in":
    #             payload = struct.pack("B", 1)
    #             for dev_id in target_devices:
    #                 for _ in range(ZOOM_STEPS):
    #                     send_udp(build_packet(dev_id, 0x010A, payload))
    #         elif action == "out":
    #             payload = struct.pack("B", 0)
    #             for dev_id in target_devices:
    #                 for _ in range(ZOOM_STEPS):
    #                     send_udp(build_packet(dev_id, 0x010A, payload))
    #         elif action == "stop":
    #             halt_payload = struct.pack(">I", 4)
    #             send_udp(build_packet(0x10, 0x0018, halt_payload))
    #             send_udp(build_packet(0x11, 0x0018, halt_payload))
    #             # Cancel hardware tracker lock (no Kafka publish here)
    #             send_udp(build_packet(0x0B, 0x010F, b''))

    #         results["zoom"] = action

    return results


if __name__ == "__main__":
    import uvicorn
    print("=" * 55)
    print("  camera_server_v3.py  — Feedback-Loop-Free")
    print("  (Same as v2 — parallax fix is in daemon files)")
    print(f"  Control Topic : {CONTROL_TOPIC}")
    print(f"  Status Topic  : {STATUS_TOPIC}  (reserved)")
    print(f"  Camera UDP    : {CAMERA_IP}:{UDP_PORT}")
    print("=" * 55)
    uvicorn.run(app, host="0.0.0.0", port=8000)
