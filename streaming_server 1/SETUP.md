# Quick Setup & Team Deployment Guide

This guide provides step-by-step instructions for team members to deploy, configure, run, and validate the **RTSP Streaming Gateway** on a new machine (Linux, macOS, or Windows with WSL).

---

## 📋 1. Prerequisites

### System Dependency: FFmpeg
The streaming server requires FFmpeg installed on the host system.

- **Ubuntu / Debian**:
  ```bash
  sudo apt update && sudo apt install -y ffmpeg
  ```
- **RHEL / CentOS / Rocky Linux**:
  ```bash
  sudo dnf install -y epel-release && sudo dnf install -y ffmpeg
  ```
- **macOS (Homebrew)**:
  ```bash
  brew install ffmpeg
  ```
- **Verify installation**:
  ```bash
  ffmpeg -version
  ```

---

## 🐍 2. Setting up Python & Virtual Environment

Python 3.9 to 3.12 is recommended.

### Option A: Standard Python `venv` (Recommended for team deployment)
```bash
# 1. Navigate to the project root directory
cd streaming_server

# 2. Create a clean virtual environment
python3 -m venv venv

# 3. Activate the virtual environment
source venv/bin/activate

# 4. Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Option B: Conda Environment
```bash
# 1. Create and activate a conda environment
conda create -n streaming_server python=3.10 -y
conda activate streaming_server

# 2. Install dependencies
pip install -r requirements.txt
```

---

## ⚙️ 3. Configuring Cameras (`config.json`)

Edit `config.json` to specify your camera feeds:

```json
{
    "cameras": {
        "connection_details": {
            "12.12.12.12": "input_videos/fight4.mp4",
            "192.168.1.101": "rtsp://admin:password@192.168.1.101:554/stream1",
            "192.168.1.102": "rtsp://admin:password@192.168.1.102:554/stream1"
        }
    },
    "video_stream": {
        "width": 1280,
        "height": 720,
        "fps": 25,
        "jpeg_quality": 85,
        "sleep_interval_after_each_frame_of_recorded_videos": 0.04,
        "connection_retry": true
    },
    "application": {
        "app_host": "0.0.0.0",
        "app_port": "5004"
    }
}
```

- **`12.12.12.12`**: Out-of-the-box offline mock feed (`fight4.mp4`). Use this to test immediately without a physical camera!
- **`app_host`**: `"0.0.0.0"` allows access from localhost and remote machines on your network.
- **`app_port`**: Port number (default `5004`).

---

## ▶️ 4. Running the Server

Make sure your virtual environment is activated (`source venv/bin/activate`), then run:

```bash
python src/app.py
```

You should see log output similar to:
```
[INFO] [App] Starting Streaming Gateway server on 0.0.0.0:5004
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5004
```

---

## 🧪 5. Validation & Testing Commands

Open a new terminal window to test and validate:

### Test 1: Automated Validation Script
Run the included verification script:
```bash
python validate_stream.py
```
This script checks FFmpeg, verifies `config.json`, tests the status endpoint, and verifies frame reception.

### Test 2: Check Gateway Status (Diagnostics API)
```bash
curl -X GET "http://127.0.0.1:5004/status"
```
Response will list all cameras and frame health:
```json
{
  "cameras": {
    "12.12.12.12": {
      "has_frame": true,
      "seconds_since_last_frame": 0.04,
      "thread_alive": true,
      "url": "input_videos/fight4.mp4"
    }
  }
}
```

### Test 3: View Stream in Web Browser
Open your browser and navigate to:
```
http://localhost:5004/stream?ip=12.12.12.12
```
You will immediately see the continuous video stream in your browser.

### Test 4: Single Snapshot Endpoint (Base64 JPEG)
```bash
curl -s "http://127.0.0.1:5004/get_image?ip=12.12.12.12" | head -c 100
```

---

## 🚀 6. Production Deployment (Background Service)

### Option A: Using PM2 (Node Process Manager)
```bash
# Install PM2 if not installed
npm install -g pm2

# Start server using the virtualenv python
pm2 start src/app.py --name "streaming-gateway" --interpreter $(pwd)/venv/bin/python

# View logs
pm2 logs streaming-gateway

# Set to auto-start on system reboot
pm2 startup
pm2 save
```

### Option B: Using systemd Service (Linux)
Create `/etc/systemd/system/streaming-gateway.service`:
```ini
[Unit]
Description=RTSP Streaming Gateway Server
After=network.target

[Service]
User=vamshi
WorkingDirectory=/path/to/streaming_server
ExecStart=/path/to/streaming_server/venv/bin/python src/app.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```
Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable streaming-gateway
sudo systemctl start streaming-gateway
sudo systemctl status streaming-gateway
```

---

## 🔍 Troubleshooting

| Issue | Solution |
| :--- | :--- |
| `ffmpeg: command not found` | Install FFmpeg via `sudo apt install ffmpeg`. |
| Port 5004 already in use | Change `app_port` in `config.json` to another port (e.g. `5005`). |
| Stream stalls or freezes | Gateway has an automatic watchdog (6s timeout) that auto-restarts the stream over TCP without dropping client sockets. |
| Camera credentials special characters | If your RTSP password contains `@` or `:`, URL-encode them (e.g., `@` becomes `%40`). |
