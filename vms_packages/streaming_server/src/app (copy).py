import json
import threading
from flask import Flask
from flask import Response, request
from connection import Connection
from flask_cors import CORS, cross_origin

config_path = 'config.json'
with open(config_path) as config_buffer:
    config = json.load(config_buffer)

connections_info = {}  # Key - Camera_IP | Value - Connection Object
app = Flask(__name__)
CORS(app, support_credentials=True)
image = None


# Home
@app.route("/b64stream")
@cross_origin(supports_credentials=True)
def b64_stream():

    print("\nRequest:", request)
    print("Payload:", request.args)
    return Response(
        connections_info[request.args.get("ip")].get_b64stream(),
        mimetype="text/event-stream"
    )


# Videos
@app.route("/stream")
@cross_origin(supports_credentials=True)
def stream():

    print("\nRequest:", request)
    print("Payload:", request.args)
    return Response(
        connections_info[request.args.get("ip")].get_stream(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )


# Camera Settings
@app.route("/get_image")
@cross_origin(supports_credentials=True)
def get_image():

    print("\nRequest:", request)
    print("Payload:", request.args)
    h, w, data = connections_info[request.args.get("ip")].get_image()
    return Response(
        json.dumps({"data": "data:image/jpg;base64, " +
                   data, "width": w, "height": h}),
        content_type="application/json"
    )


def start_streaming(cameras, sleep_interval, connection_retry):

    try:
        for camera_ip, camera_url in cameras.items():
            if camera_ip not in connections_info:
                print(f"Camera IP: {camera_ip} | Camera URL: {camera_url}\n")
                connection = Connection(camera_ip, camera_url)
                connections_info[camera_ip] = connection
                t = threading.Thread(
                    target=connection.video_stream, args=(sleep_interval, connection_retry,))
                t.start()

    except Exception as e:
        print(e)
        


if __name__ == "__main__":

    cameras = config["cameras"]["connection_details"]
    sleep_interval = config["video_stream"]["sleep_interval_after_each_frame_of_recorded_videos"]
    connection_retry = config["video_stream"]["connection_retry"]

    start_streaming(cameras, sleep_interval, connection_retry)
    # print("test..........")

    app_host = config['application']['app_host']
    app_port = config['application']['app_port']

    app.run(host=app_host, port=app_port, debug=True,
            threaded=True, use_reloader=False)
