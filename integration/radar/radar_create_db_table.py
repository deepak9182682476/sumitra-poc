import psycopg2

from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# --- CONFIG ---
DB_NAME = "radar_db"
DB_CONFIG = {
    "user": "postgres",
    "password": "postgres",
    "host": "localhost",
    "port": "5432"
}

def create_schema():
    conn = None
    try:
        # Create Database
        conn = psycopg2.connect(dbname='postgres', **DB_CONFIG)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{DB_NAME}'")
        if not cur.fetchone():
            cur.execute(f"CREATE DATABASE {DB_NAME}")
            print(f"[*] Database '{DB_NAME}' created.")
        cur.close()
        conn.close()

        # Create Table
        conn = psycopg2.connect(dbname=DB_NAME, **DB_CONFIG)
        cur = conn.cursor()
        cur.execute("DROP TABLE IF EXISTS nrics_radar_tracks2;") 
        
        cur.execute("""
            CREATE TABLE nrics_radar_tracks2 (
            id SERIAL PRIMARY KEY,
            
            -- Header Information (W1-W7)
            start_qualifier TEXT,
            msg_id INTEGER,               
            msg_day INTEGER,             
            msg_month INTEGER,           
            msg_year INTEGER,            
            radar_time_ms BIGINT,        

            -- Track Identity (W8-W10)
            track_id INTEGER,            
            track_status INTEGER,        
            track_hmp INTEGER,           

            -- Track Kinematics & Statistical Deviations (W11-W30)
            latitude DOUBLE PRECISION,   
            longitude DOUBLE PRECISION,  
            pos_x REAL, pos_y REAL,                  
            vel_vx REAL, vel_vy REAL,                 
            sigma_x REAL, sigma_y REAL,                
            sigma_vx REAL, sigma_vy REAL,               

            -- Radar Calculations (W31-W46)
            range REAL, azimuth REAL,                
            velocity REAL, heading REAL,                
            dcpa REAL, tcpa REAL,                   
            bcr REAL, bct REAL,                    

            -- Plot Detections (W47-W65)
            guard_zone_flag INTEGER,     
            
            -- FIXED: Decomposed Plot Metadata fields (W48-49)
            plot_break_criteria INTEGER,  -- Bits b31-b30 
            plot_detections INTEGER,      -- Bits b29-b16 
            plot_cluster_id INTEGER,      -- Bits b15-b0 [cite: 41]
            
            plot_azi REAL,               
            plot_range REAL,             
            plot_strength BIGINT,         
            plot_filter_attr BIGINT,      
            plot_latitude DOUBLE PRECISION,  
            plot_longitude DOUBLE PRECISION, 
                    
            raw_packet BYTEA,

            captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        """)
        conn.commit()
        cur.execute("CREATE INDEX IF NOT EXISTS idx_radar_id_time ON nrics_radar_tracks2 (track_id, captured_at);")
        print("[*] Table 'nrics_radar_tracks2' created with COMPLETE W1-W65 SIDD columns.")

    except Exception as e:
        print(f"[!] Setup Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    create_schema()
