import json
import threading
from flask import Flask, Response, request
from flask_cors import CORS
from connection import Connection
import time

# Load configuration
config_path = 'config.json'
with open(config_path) as config_buffer:
    config = json.load(config_buffer)

connections_info = {}  # Key - Camera_IP | Value - Connection Object
threads_info = {}  # To store threads to ensure only one per camera
app = Flask(__name__)
CORS(app, support_credentials=True)

# Function to start streaming for a specific camera
def start_camera_stream(camera_ip, camera_url, sleep_interval, connection_retry):
    if camera_ip not in connections_info:
        print(f"Starting stream for Camera IP: {camera_ip} | Camera URL: {camera_url}\n")
        connection = Connection(camera_ip, camera_url)
        connections_info[camera_ip] = connection

        # Start a new thread for the camera's video stream
        thread = threading.Thread(
            target=connection.video_stream,
            args=(sleep_interval, connection_retry),
            daemon=True  # Daemonize the thread so it closes when the app shuts down
        )
        threads_info[camera_ip] = thread
        thread.start()
    elif not threads_info[camera_ip].is_alive():
        print(f"Restarting thread for Camera IP: {camera_ip}")
        thread = threading.Thread(
            target=connections_info[camera_ip].video_stream,
            args=(sleep_interval, connection_retry),
            daemon=True
        )
        threads_info[camera_ip] = thread
        thread.start()
    else:
        print(f"Camera IP {camera_ip} is already streaming.\n")

# Base64 Stream Endpoint
@app.route("/b64stream")
def b64_stream():
    ip = request.args.get("ip")
    print(f"\nRequest: {request}, Payload: {request.args}")  # Debug log
    if ip in config["cameras"]["connection_details"]:
        if ip not in connections_info:
            camera_url = config["cameras"]["connection_details"][ip]
            sleep_interval = config["video_stream"]["sleep_interval_after_each_frame_of_recorded_videos"]
            connection_retry = config["video_stream"]["connection_retry"]
            start_camera_stream(ip, camera_url, sleep_interval, connection_retry)
        
        return Response(
            connections_info[ip].get_b64stream(),
            mimetype="text/event-stream"
        )
    return Response(status=404)

# Video Stream Endpoint
@app.route("/stream")
def stream():
    ip = request.args.get("ip")
    print(f"\nRequest: {request}, Payload: {request.args}")  # Debug log
    if ip in config["cameras"]["connection_details"]:
        if ip not in connections_info:
            camera_url = config["cameras"]["connection_details"][ip]
            sleep_interval = config["video_stream"]["sleep_interval_after_each_frame_of_recorded_videos"]
            connection_retry = config["video_stream"]["connection_retry"]
            start_camera_stream(ip, camera_url, sleep_interval, connection_retry)

        return Response(
            connections_info[ip].get_stream(),
            mimetype="multipart/x-mixed-replace; boundary=frame"
        )
    return Response(status=404)

# @app.route("/get_image")
# def get_image():
#     ip = request.args.get("ip")
#     print(f"\nRequest: {request}, Payload: {request.args}")  # Debug log
#     if ip in connections_info:
#         print("Checking step .......................................................")
#         h, w, data = connections_info[ip].get_image()
#         return Response(
#             json.dumps({"data": "data:image/jpg;base64, " + data, "width": w, "height": h}),
#             content_type="application/json"
#         )
#     return Response(status=404)


@app.route("/get_image")
def get_image():
    ip = request.args.get("ip")
    if ip in config["cameras"]["connection_details"]:
        if ip not in connections_info:
            camera_url = config["cameras"]["connection_details"][ip]
            sleep_interval = config["video_stream"]["sleep_interval_after_each_frame_of_recorded_videos"]
            connection_retry = config["video_stream"]["connection_retry"]
            start_camera_stream(ip, camera_url, sleep_interval, connection_retry)
            # Wait a tiny bit to let first frame be captured
            time.sleep(0.1)
        
        h, w, data = connections_info[ip].get_image()
        return Response(
            json.dumps({"data": "data:image/jpg;base64, " + data, "width": w, "height": h}),
            content_type="application/json"
        )
    return Response(status=404)


if __name__ == "__main__":
    app_host = config['application']['app_host']
    app_port = config['application']['app_port']
    app.run(host=app_host, port=app_port, debug=True, threaded=True, use_reloader=False)
