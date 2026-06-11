import socket
import struct
import time
import math

from datetime import datetime

# --- CONFIG ---
# MCAST_GRP = '227.0.0.1'  # previous version
MCAST_GRP = '227.0.0.2'
MCAST_PORT = 6061

def create_sidd_packet(tid, lat, lon, heading):
    now = datetime.utcnow()
    
    # 1. Header (W1-W7)
    w1_start = 0x1111
    w2_id_day = (0x62 << 8) | (now.day & 0xFF)   # Msg ID 62H | Day
    w3_month = (now.month << 8) | 0x00           # Month | Reserved
    w4_year = now.year                           # Word 4: Year
    
    # W5-W6: 32-bit UTC milliseconds
    time_ms = int((now.hour * 3600 + now.minute * 60 + now.second) * 1000 + (now.microsecond / 1000))
    w7_len = 58 

    # 2. Plot Metadata (W48-W49)
    # b31-30: Criteria (0), b29-16: Detections (12), b15-0: Cluster ID (tid)
    plot_meta = (0 << 30) | (12 << 16) | (tid & 0xFFFF)

    # 3. Format String (Little-Endian '<')
    # H=u16, I=u32, f=float32
    # W1-4(HHHH), W5-6(I), W7(H), W8-10(HHH), W11-46(18f), W47(H), W48-49(I), W50-65(8f)
    fmt = '<HHHH I H HHH 18f H I 8f'
    
    # Simulated Physics
    velocity = 10.5
    range_val = 1200.0

    return struct.pack(fmt,
        # Header (W1-W7)
        w1_start, w2_id_day, w3_month, w4_year, time_ms, w7_len,
        # Track Info (W8-W47)
        tid, 1, 100,           # ID, Status, HMP
        lat, lon,              # Kinematics
        0.0, 0.0, 0.0, 0.0,    # Pos/Vel
        0.5, 0.5, 0.1, 0.1,    # Sigmas
        range_val, heading, velocity, heading, # Rng, Azi, Vel, Head
        0.0, 0.0, 0.0, 0.0,    # DCPA, TCPA, BCR, BCT
        # Plot Info (W47-W65)
        1,                     # GZ Flag
        plot_meta,             # Metadata
        heading, range_val,    # Plot Azi/Rng
        1200, 1,               # Strength/Filter
        0.5, 1.0,              # Extensions
        lat + 0.0001, lon + 0.0001 # Plot Lat/Lon
    )

def main():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    sock.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 2)

    base_lat, base_lon = 21.9000, 88.9000
    
    print(f"[*] Aligned Simulator Streaming to {MCAST_GRP}:{MCAST_PORT}...")
    
    try:
        step = 0
        while True:
            # Move tracks slightly
            offset = step * 0.0002
            
            # Track 105
            p1 = create_sidd_packet(105, base_lat + offset, base_lon + offset, 45.0)
            sock.sendto(p1, (MCAST_GRP, MCAST_PORT))
            
            # Track 109
            p2 = create_sidd_packet(109, base_lat - offset, base_lon + 0.005, 180.0)
            sock.sendto(p2, (MCAST_GRP, MCAST_PORT))
            
            print(f"Cycle {step} sent | T105: {base_lat+offset:.4f} | T109: {base_lat-offset:.4f}")
            step += 1
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\nStopping Simulation.")

if __name__ == "__main__":
    main()