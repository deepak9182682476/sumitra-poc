import socket
import struct
import time
import psycopg2
import psycopg2.extras

from datetime import datetime

# --- CONFIG ---
# MCAST_GRP = '227.0.0.1'  # previous version
MCAST_GRP = '227.0.0.2'
MCAST_PORT = 6061
DB_CONFIG = {
    "dbname": "radar_db",
    "user": "postgres",
    "password": "postgres",
    "host": "localhost"
}


def create_sidd_packet_from_db(row, override_tid=None):
    w1_start = 0x1111
    w2_id_day = (int(row.get('msg_id', 98)) << 8) | (int(row.get('msg_day', 1)) & 0xFF)
    w3_month = (int(row.get('msg_month', 1)) << 8) | 0x00
    w4_year = int(row.get('msg_year', 2026))
    time_ms = int(row.get('radar_time_ms', 0))

    track_id = override_tid if override_tid is not None else int(row.get('track_id', 0))
    dets = int(row.get('plot_detections', 1))
    plot_meta = (0 << 30) | (dets << 16) | (track_id & 0xFFFF)

    fmt = '<HHHH I H HHH 18f H I 8f'

    lat = float(row.get('latitude', 0.0))
    lon = float(row.get('longitude', 0.0))
    px, py = float(row.get('pos_x', 0.0)), float(row.get('pos_y', 0.0))
    vx, vy = float(row.get('vel_vx', 0.0)), float(row.get('vel_vy', 0.0))
    speed = float(row.get('velocity', 0.0))
    head = float(row.get('heading', 0.0))
    strength = float(row.get('plot_strength', 1200.0))

    return struct.pack(fmt,
        w1_start, w2_id_day, w3_month, w4_year, time_ms, 58,
        track_id, 1, 100, lat, lon, px, py, vx, vy,
        0.5, 0.5, 0.1, 0.1, 1200.0, head, speed, head,
        0.0, 0.0, 0.0, 0.0, 1, plot_meta,
        head, 1200.0, strength, 1.0, 0.5, 1.0, lat + 0.0001, lon + 0.0001
    )


def main():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)

    STATIC_IP = "192.168.0.108"
    try:
        sock.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_IF, socket.inet_aton(STATIC_IP))
    except OSError:
        print(f"[!] Warning: Cannot assign {STATIC_IP} as multicast interface. Falling back to default (0.0.0.0).")
        sock.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_IF, socket.inet_aton("0.0.0.0"))

    sock.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_LOOP, 1)
    sock.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 2)

    conn = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

        print("\n" + "="*50)
        print(" TRACK DISCOVERY: ANALYZING DATABASE ".center(50, " "))
        print("="*50)

        # Dynamically discover the active table
        table_name = "nrics_radar_tracks2"
        try:
            cur.execute("SELECT COUNT(*) FROM nrics_radar_tracks2")
            cnt = cur.fetchone()[0]
            if cnt == 0:
                table_name = "nrics_radar_tracks1"
        except Exception:
            conn.rollback()
            table_name = "nrics_radar_tracks1"

        print(f"[*] Replaying from table: {table_name}")

        cur.execute(f"""
            SELECT track_id, 
                   COUNT(*) as point_count, 
                   MIN(captured_at) as start_time, 
                   MAX(captured_at) as end_time 
            FROM {table_name}
            GROUP BY track_id 
            ORDER BY point_count DESC
        """)

        summary = cur.fetchall()

        if not summary:
            print("[!] No tracks found in the database.")
            return

        print(f"{'Track ID':<10} | {'Points':<10} | {'Duration'}")
        print("-" * 50)
        for s in summary:
            duration = s['end_time'] - s['start_time']
            print(f"{s['track_id']:<10} | {s['point_count']:<10} | {duration}")
        print("="*50)

        val = input(
            "\nEnter Track IDs to replay (comma separated) or press Enter for best track: "
        ).strip()

        if val:
            active_ids = [int(x.strip()) for x in val.split(",")]
        else:
            active_ids = [summary[0]['track_id']]

        randomize = input("Randomize Track IDs for replay? (y/n, default n): ").strip().lower() == 'y'
        id_mapping = {}
        if randomize:
            import random
            for tid in active_ids:
                random_id = random.randint(100, 999)
                while random_id in id_mapping.values():
                    random_id = random.randint(100, 999)
                id_mapping[tid] = random_id
                print(f"[*] Mapping Track ID {tid} ➜ Randomized ID {random_id}")
        else:
            id_mapping = {tid: tid for tid in active_ids}

        try:
            freq = float(input("Enter replay frequency (Hz, default 1): ") or 1)
            if freq <= 0:
                freq = 1
        except ValueError:
            freq = 1

        interval = 1.0 / freq

        print(f"\n[*] Starting REPLAY for Tracks {active_ids} at {freq} Hz")
        print("[*] Press Ctrl+C to stop.\n")

        track_data = {}

        for tid in active_ids:
            cur.execute(f"""
                SELECT * FROM {table_name}
                WHERE track_id = %s
                ORDER BY captured_at ASC
            """, (tid,))
            rows = cur.fetchall()
            if rows:
                track_data[tid] = rows
            else:
                print(f"[!] No data found for Track {tid}")

        index_map = {tid: 0 for tid in track_data.keys()}

        while True:
            for tid, rows in track_data.items():
                row = rows[index_map[tid]]

                override_id = id_mapping.get(tid, tid)
                packet = create_sidd_packet_from_db(row, override_tid=override_id)
                sock.sendto(packet, (MCAST_GRP, MCAST_PORT))

                if override_id != tid:
                    print(
                        f"TX Original ID: {tid} ➜ Mapped ID: {override_id} | "
                        f"Lat: {row['latitude']:.5f} | "
                        f"Lon: {row['longitude']:.5f}"
                    )
                else:
                    print(
                        f"TX ID: {row['track_id']} | "
                        f"Lat: {row['latitude']:.5f} | "
                        f"Lon: {row['longitude']:.5f}"
                    )

                index_map[tid] = (index_map[tid] + 1) % len(rows)

            time.sleep(interval)

    except KeyboardInterrupt:
        print("\n\n[!] Simulation stopped by user.")
    except Exception as e:
        print(f"\n[!] Error: {e}")
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    main()
