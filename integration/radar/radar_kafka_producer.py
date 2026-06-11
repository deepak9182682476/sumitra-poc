import socket
import struct
import json
import time
import logging
import threading

from collections import deque
from confluent_kafka import Producer

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger("RadarProcessor")

SEND_FREQUENCY_HZ = 1
data_buffer = deque()

# --- CONFIG ---
# KAFKA_BOOTSTRAP = '192.168.30.52:9092'
#KAFKA_BOOTSTRAP = '192.168.2.136:9092'
KAFKA_BOOTSTRAP = '127.0.0.1:9092'
TOPIC_RAW = 'radar_raw'
TOPIC_PROCESSED = 'radar_processed'
# STATIC_IP = "192.168.30.52"  # previous — loopback only, misses simulator on eth0/wlan0
#STATIC_IP = "192.168.2.136"      # join multicast on all interfaces
STATIC_IP = "127.0.0.1"
MCAST_GRP = '227.0.0.2'
MCAST_PORT = 6061

def kafka_worker():
    try:
        producer = Producer({'bootstrap.servers': KAFKA_BOOTSTRAP})
        logger.info(f"Kafka Worker started. Target Rate: {SEND_FREQUENCY_HZ}Hz")
    except Exception as e:
        logger.error(f"Failed to initialize Kafka Producer: {e}")
        return

    while True:
        if data_buffer:
            raw_bytes, data = data_buffer.popleft()
            
            try:
                logger.debug(f"Sending Track ID: {data['track']['id']} to Kafka")
                
                producer.produce(TOPIC_RAW, value=raw_bytes)
                producer.produce(TOPIC_PROCESSED, value=json.dumps(data))
                producer.flush() 
                
                time.sleep(1.0 / SEND_FREQUENCY_HZ)
            except Exception as e:
                logger.error(f"Kafka Production Error: {e}")
        else:
            time.sleep(0.1) 

def process_sidd_packet(raw_bytes):
    """Decodes binary SIDD packet into a Python dictionary."""
    if len(raw_bytes) < 130:
        logger.warning(f"Received undersized packet: {len(raw_bytes)} bytes")
        return None

    def get_u16(word_idx):
        offset = (word_idx - 1) * 2
        return struct.unpack('<H', raw_bytes[offset : offset + 2])[0]

    def get_u32(word_idx):
        offset = (word_idx - 1) * 2
        return struct.unpack('<I', raw_bytes[offset : offset + 4])[0]

    def get_f32(word_idx):
        offset = (word_idx - 1) * 2
        return struct.unpack('<f', raw_bytes[offset : offset + 4])[0]

    w2 = get_u16(2)
    w3 = get_u16(3)
    day, month, year = w2 & 0x00FF, (w3 >> 8) & 0xFF, get_u16(4)
    time_ms = get_u32(5)
    metadata_raw = get_u32(48)

    processed_data = {
        "header": {
            "start_qualifier": get_u16(1),   
            "msg_id": w2 >> 8,                  
            "date": f"{day:02d}-{month:02d}-{year:04d}",
            "time_utc_ms": time_ms,
            "msg_len": get_u16(7) 
        },
        "track": {
            "id": get_u16(8),
            "status": get_u16(9),
            "hmp": get_u16(10),
            "latitude": round(get_f32(11), 6),
            "longitude": round(get_f32(13), 6),
            "pos_x": round(get_f32(15), 2),
            "pos_y": round(get_f32(17), 2),
            "vel_vx": round(get_f32(19), 2),
            "vel_vy": round(get_f32(21), 2),    

            "sigma_x": round(get_f32(23), 2),
            "sigma_y": round(get_f32(25), 2),
            "sigma_vx": round(get_f32(27), 2),
            "sigma_vy": round(get_f32(29), 2),

            #"range": round(get_f32(31), 2),
            "range": round(get_f32(31) / 1000.0, 3),
            "azimuth": round(get_f32(33), 2),
            "velocity": round(get_f32(35), 2), 
            "heading": round(get_f32(37), 2),
            "dcpa": round(get_f32(39), 2),
            "tcpa": round(get_f32(41), 2),

            "bcr": round(get_f32(43), 2),
            "bct": round(get_f32(45), 2)
        },
        "plot": {
            "guard_zone": get_u16(47), # W47 
            "break_criteria": (metadata_raw >> 30) & 0x03, # b31-b30 
            "detections": (metadata_raw >> 16) & 0x3FFF,   # b29-b16 
            "cluster_id": metadata_raw & 0xFFFF,           # b15-b0 
            "plot_azi": round(get_f32(50), 2),
            "plot_rng": round(get_f32(52), 2),
            "plot_strength": get_u32(54),
            "plot_filter": get_u32(56), # Plot_Filter is W56-57 
            "plot_lat": round(get_f32(62), 6),
            "plot_lon": round(get_f32(64), 6)
        },
        "ingest_time": time.time()
    }
    return processed_data

def main():
    logger.info("Initializing NRICS SIDD Processor...")

    worker_thread = threading.Thread(target=kafka_worker, daemon=True)
    worker_thread.start()

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(('', MCAST_PORT))

    try:
        mreq = struct.pack("4s4s", socket.inet_aton(MCAST_GRP), socket.inet_aton(STATIC_IP))
        sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)
        logger.info(f"Connected to Multicast {MCAST_GRP} on {STATIC_IP}:{MCAST_PORT}")
    except OSError as e:
        logger.critical(f"Network Join Failed: {e}")
        return

    last_status_time = time.time()
    print("last_status", last_status_time)
    packets_received = 0

    try:
        # print("first check point")
        while True:
            # print("second_Check_point")
            raw_bytes, addr = sock.recvfrom(2048)
            # print("raw_bytes", raw_bytes)
            # print("len of dtaa received", len(raw_bytes))
            

            if len(raw_bytes) >= 130 and raw_bytes[0:2] == b'\x11\x11':
                try:
                    data = process_sidd_packet(raw_bytes)
                    if data:
                        data_buffer.append((raw_bytes, data))
                        packets_received += 1
                        
                        if time.time() - last_status_time > 5:
                            q_len = len(data_buffer)
                            level = logging.WARNING if q_len > 50 else logging.INFO
                            logger.log(level, f"STATUS: Received={packets_received} | Queue={q_len} (Lagging if high)")
                            last_status_time = time.time()
                            
                except Exception as e:
                    logger.error(f"Parsing Exception: {e}")
    
    except KeyboardInterrupt:
        logger.info("Shutdown signal received. Closing...")

if __name__ == "__main__":
    main()
