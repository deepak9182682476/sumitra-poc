import json
import logging
import os
import signal
import sys
import threading
import time
from flask import Flask, Response, request, jsonify
from flask_cors import CORS
from connection import Connection

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] [App] %(message)s'
)
logger = logging.getLogger("App")

# Resolve path to config.json reliably
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
config_path = os.path.join(BASE_DIR, 'config.json')
if not os.path.exists(config_path):
    config_path = 'config.json'

with open(config_path) as config_buffer:
    config = json.load(config_buffer)

connections_info = {}   # Key: camera_ip -> Connection object
threads_info = {}       # Key: camera_ip -> Thread object
stream_lock = threading.Lock()

app = Flask(__name__)
CORS(app, supports_credentials=True)


def ensure_camera_stream(camera_ip):
    """
    Thread-safe stream manager: ensures a Connection and supervisor thread
    are running for the requested camera IP. Restarts automatically if dead.
    """
    cam_details = config.get("cameras", {}).get("connection_details", {})
    if camera_ip not in cam_details:
        return False

    camera_url = cam_details[camera_ip]
    stream_cfg = config.get("video_stream", {})
    sleep_interval = stream_cfg.get(
        "sleep_interval_after_each_frame_of_recorded_videos", 0.04
    )
    connection_retry = stream_cfg.get("connection_retry", True)
    width = stream_cfg.get("width", 1280)
    height = stream_cfg.get("height", 720)
    fps = stream_cfg.get("fps", 25)
    jpeg_quality = stream_cfg.get("jpeg_quality", 85)

    with stream_lock:
        conn = connections_info.get(camera_ip)
        if conn is None:
            logger.info(f"Initializing stream for Camera IP: {camera_ip} -> {camera_url} ({width}x{height} @ {fps}fps)")
            conn = Connection(
                ip=camera_ip,
                rtsp_url=camera_url,
                width=width,
                height=height,
                fps=fps,
                jpeg_quality=jpeg_quality
            )
            connections_info[camera_ip] = conn

        t = threads_info.get(camera_ip)
        if t is None or not t.is_alive():
            logger.info(f"Starting/Restarting video supervisor thread for Camera IP: {camera_ip}")
            t = threading.Thread(
                target=conn.video_stream,
                args=(sleep_interval, connection_retry),
                name=f"supervisor-{camera_ip}",
                daemon=True
            )
            threads_info[camera_ip] = t
            t.start()

    return True


# -----------------------------------------------------------------------------
# Streaming Endpoints
# -----------------------------------------------------------------------------
@app.route("/stream")
def stream():
    """
    Multipart MJPEG Video Stream endpoint.
    Usage: <img src="http://<host>:<port>/stream?ip=<camera_ip>" />
    """
    ip = request.args.get("ip")
    if not ip or not ensure_camera_stream(ip):
        return Response("Camera IP not found or not configured", status=404)

    return Response(
        connections_info[ip].get_stream(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )


@app.route("/b64stream")
def b64_stream():
    """
    Server-Sent Events (SSE) Base64 Stream endpoint.
    Usage: EventSource("http://<host>:<port>/b64stream?ip=<camera_ip>")
    """
    ip = request.args.get("ip")
    if not ip or not ensure_camera_stream(ip):
        return Response("Camera IP not found or not configured", status=404)

    return Response(
        connections_info[ip].get_b64stream(),
        mimetype="text/event-stream"
    )


@app.route("/get_image")
def get_image():
    """
    Single snapshot endpoint. Returns {data: 'data:image/jpg;base64,...', width, height}.
    """
    ip = request.args.get("ip")
    if not ip or not ensure_camera_stream(ip):
        return Response(jsonify({"error": "Camera IP not found"}), status=404)

    # If stream was just created, wait briefly for first frame
    conn = connections_info[ip]
    wait_start = time.time()
    while conn.frame is None and (time.time() - wait_start < 2.0):
        time.sleep(0.1)

    h, w, data = conn.get_image()
    if data:
        return Response(
            json.dumps({"data": "data:image/jpg;base64, " + data, "width": w, "height": h}),
            content_type="application/json"
        )
    return Response(
        json.dumps({"error": "No frame available yet from camera", "data": "", "width": 0, "height": 0}),
        status=503,
        content_type="application/json"
    )


@app.route("/status")
def status():
    """Diagnostic endpoint to inspect health of all camera streams."""
    cams = config.get("cameras", {}).get("connection_details", {})
    now = time.time()
    stats = {}

    with stream_lock:
        for ip, url in cams.items():
            conn = connections_info.get(ip)
            t = threads_info.get(ip)
            is_active = t.is_alive() if t else False
            last_frame = (now - conn.last_frame_time) if (conn and conn.last_frame_time > 0) else None

            stats[ip] = {
                "url": url,
                "thread_alive": is_active,
                "has_frame": conn.frame is not None if conn else False,
                "seconds_since_last_frame": round(last_frame, 1) if last_frame is not None else "never"
            }

    return jsonify({"cameras": stats})


# -----------------------------------------------------------------------------
# Graceful Shutdown
# -----------------------------------------------------------------------------
def shutdown_handler(signum, frame):
    logger.info("Shutdown signal received. Stopping all camera connections...")
    with stream_lock:
        for ip, conn in connections_info.items():
            conn.stop()
    sys.exit(0)

signal.signal(signal.SIGINT, shutdown_handler)
signal.signal(signal.SIGTERM, shutdown_handler)


# -----------------------------------------------------------------------------
# Entry Point
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    app_host = config.get('application', {}).get('app_host', '0.0.0.0')
    app_port = int(config.get('application', {}).get('app_port', 5004))

    # Safety check on binding host
    try:
        import socket
        test_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        test_sock.bind((app_host, app_port))
        test_sock.close()
    except Exception as e:
        logger.warning(f"Could not bind to configured host '{app_host}': {e}. Falling back to '0.0.0.0'.")
        app_host = '0.0.0.0'

    logger.info(f"Starting Streaming Gateway server on {app_host}:{app_port}")
    app.run(host=app_host, port=app_port, debug=False, threaded=True, use_reloader=False)
