import socket
import json
import threading
import time

from flask import Flask, Response, request, jsonify
from kafka import KafkaConsumer
from flask_cors import CORS  

app = Flask(__name__)
CORS(app) 

# ---------------- CONFIG ----------------
DRONE_IP = "192.168.30.83"
DRONE_PORT = 3251
KAFKA_BROKER = "192.168.30.52:9092"
# KAFKA_TOPIC = "radar_processe"  # previous version (typo)
KAFKA_TOPIC = "radar_processed"

TRACK_TIMEOUT_SECONDS = 10 # buffer

radar_tracks = {}
radar_lock = threading.Lock()

def send_udp_message(message):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.sendto(message.encode(), (DRONE_IP, DRONE_PORT))
        return True
    except Exception as e:
        print("UDP Error:", e)
        return False

def kafka_radar_consumer():
    consumer = KafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=KAFKA_BROKER,
        auto_offset_reset='latest',
        enable_auto_commit=True,
        value_deserializer=lambda x: json.loads(x.decode('utf-8'))
    )

    print("Radar consumer started...")

    for message in consumer:
        try:
            data = message.value
            track = data.get("track")
            if not track:
                continue

            track_id = track.get("id")
            lat = track.get("latitude")
            lon = track.get("longitude")

            if track_id is None or lat is None or lon is None:
                continue

            with radar_lock:
                radar_tracks[track_id] = {
                    "lat": lat,
                    "lon": lon,
                    "timestamp": time.time()
                }
        except Exception as e:
            print("Kafka error:", e)
            
# ---------------- FLY API ----------------
@app.route("/fly_track", methods=["POST", "GET"])
def fly():
    print("\n" + "="*40)
    print("NEW REQUEST RECEIVED: /fly")
    
    print(f"Method: {request.method}")
    print(f"URL Args: {request.args.to_dict()}")
    
    # lat = float(request.args.get("lat", default=22.1303168))
    lat = float(request.args.get("lat", default=22.1356333333))

    # lng = float(request.args.get("lng", default=89.0565320))
    lng = float(request.args.get("lng", default=89.0579166667))

    source = "Default/Manual"
    
    body = request.get_json(silent=True) or {}
    print(f"Received JSON Body: {body}")
    
    track_id = body.get("track_id")

    if track_id is not None:
        print(f"Searching for Track ID: {track_id}")
        with radar_lock:
            track_data = radar_tracks.get(track_id)
        
        if track_data:
            age = time.time() - track_data["timestamp"]
            if age <= TRACK_TIMEOUT_SECONDS:
                lat = track_data["lat"]
                lng = track_data["lon"]
                source = f"Radar (Track {track_id})"
                print(f"SUCCESS: Found fresh radar data ({int(age)}s old).")
            else:
                print(f"STALE: Track {track_id} is {int(age)}s old. Using defaults.")
        else:
            print(f"NOT FOUND: Track {track_id} not in memory. Using defaults.")

    uav_payload = {
        'DroneId': 'SDE52',
        'Command': 'Fly',
        'Value1': lat,
        'Value2': lng,
        'Value3': 50
    }
    
    print(f"FINAL DECISION -> Source: {source}")
    print(f"SENDING TO UAV: {uav_payload}")
    print("="*40 + "\n")

    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
        s.sendto(str(uav_payload).encode(), (DRONE_IP, DRONE_PORT))

    return jsonify({
        "status": "success",
        "source": source,
        "lat": lat,
        "lon": lng,
        "uav_sent": uav_payload
    })

# ---------------- RTL API ----------------
@app.route("/rtl", methods=["GET"])
def rtl():
    print("\n" + "!"*40)
    print("COMMAND RECEIVED: RTL (Return to Launch)")
    success = send_udp_message("RTL")
    print(f"UDP Sent Success: {success}")
    print("!"*40 + "\n")
    
    if success:
        return Response("RTL command sent", status=200)
    else:
        return Response("Failed to send RTL command", status=500)

if __name__ == "__main__":
    kafka_thread = threading.Thread(target=kafka_radar_consumer, daemon=True)
    kafka_thread.start()

    app.run(host="0.0.0.0", port=7999, debug=True)
