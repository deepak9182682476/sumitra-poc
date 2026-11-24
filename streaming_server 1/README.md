# RTSP Streaming Gateway & Multiplexing Server

A lightweight, high-performance streaming gateway designed to ingest RTSP camera feeds and local video files, buffer and decode them locally, and multiplex them to multiple downstream consumers (web dashboards, AI inference pipelines, computer vision models) without putting load on edge cameras.

---

## 🚀 Why Use This Gateway?

Physical IP cameras and edge sensors have constrained CPUs, weak network chips, and strict concurrent connection limits (usually 2–4 clients maximum). Connecting multiple consumers directly to a camera can cause packet loss, stuttering, or camera reboots.

**This server acts as a proxy:**
1. **Single Ingestion**: Connects to each camera only once.
2. **Multiple Egress**: Distributes the stream to $N$ concurrent clients via standard HTTP (MJPEG, Server-Sent Events, or JSON snapshots).
3. **Seamless Offline Simulation**: Can stream recorded `.mp4` video files from `input_videos/` on continuous loop as mock cameras.
4. **Resilient Auto-Healing**: If a camera network hiccup occurs, the server automatically reconnects over TCP. The client's HTTP stream **never closes**, so web browsers and AI models **never need a page refresh (F5)**!

---

## 🛠️ System Architecture

```
[ IP Camera 1 ] ──(1 RTSP/TCP)──┐
[ IP Camera 2 ] ──(1 RTSP/TCP)──┼──> [ Streaming Gateway Server ] ──> HTTP Clients:
[ Mock File   ] ──(OpenCV Loop)─┘    ├── Ingest Pipeline (FFmpeg TCP)   ├── /stream (MJPEG <img>)
                                     ├── Atomic Memory Cache (Frame)    ├── /b64stream (SSE Base64)
                                     └── Auto-Healing Watchdog          ├── /get_image (Snapshot)
                                                                        └── /status (Diagnostics)
```

### Key Reliability Enhancements
- **RTSP over TCP**: Enforces `rtsp_transport tcp` to eliminate UDP packet loss, green corruption artifacts, and pipe stalls.
- **Persistent HTTP Pipeline**: Transient camera dropouts do not kill downstream HTTP client connections; downstream clients hold the connection while the backend reconnects.
- **Active Timestamp Watchdog**: Monitors real frame arrival timestamps. If no frame arrives for >6 seconds, the old FFmpeg process is cleanly terminated and restarted with exponential backoff.
- **Zero-Latency Drop-Oldest Queue**: Outdated frames are discarded to prevent buffer bloat and maintain real-time low latency.
- **Mock Video Auto-Rewind**: Recorded video files loop back to frame 0 automatically upon reaching EOF.

---

## 📦 Prerequisites & Installation

### 1. System Dependencies
FFmpeg is required for RTSP stream demuxing:
```bash
sudo apt update && sudo apt install -y ffmpeg
```

### 2. Python Environment
This project is configured to use the `devel` Conda environment:
```bash
# Activate the conda environment
conda activate devel

# Install python dependencies
pip install -r requirements.txt
```

---

## ⚙️ Configuration (`config.json`)

The server configuration is located in `config.json`:

```json
{
    "cameras": {
        "connection_details": {
            "12.12.12.12": "input_videos/fight4.mp4",
            "192.168.2.71": "rtsp://user:password@192.168.2.71:554/h264Preview_01_main",
            "192.168.2.72": "rtsp://192.168.2.72:9001/video"
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

- **`connection_details`**: Maps an identifier/IP (e.g. `192.168.2.71` or `12.12.12.12`) to an RTSP URL or relative video path.
- **`width` & `height`**: Target streaming resolution. Defaults to `1280x720` (720p HD). For higher capability machines, set to `1920x1080` (1080p Full HD).
- **`fps`**: Target output framerate (default `25`).
- **`jpeg_quality`**: Output JPEG compression quality (1-100, default `85` for crisp clarity).
- **`app_host`**: Set to `"0.0.0.0"` to accept connections from localhost, LAN, or VPN interfaces.
- **`app_port`**: Server listening port (default `5004`).

---

## ▶️ Running the Server

Run from the root directory:

```bash
/home/vamshi/miniconda3/envs/devel/bin/python src/app.py
```

Or using activated conda:
```bash
conda activate devel
python3 src/app.py
```

### Running with PM2 (Optional Background Service)
```bash
pm2 start src/app.py --name "streaming-gateway" --interpreter /home/vamshi/miniconda3/envs/devel/bin/python
```

---

## 🌐 API Endpoints & Usage Examples

### 1. MJPEG Video Stream
- **URL**: `GET /stream?ip=<camera_ip>`
- **Content-Type**: `multipart/x-mixed-replace; boundary=frame`
- **Use Case**: Direct HTML display or computer vision client consumption.

#### HTML Embed:
```html
<img src="http://127.0.0.1:5004/stream?ip=12.12.12.12" width="640" height="480" />
```

#### Python / OpenCV Consumer:
```python
import cv2

cap = cv2.VideoCapture("http://127.0.0.1:5004/stream?ip=12.12.12.12")
while True:
    ret, frame = cap.read()
    if ret:
        cv2.imshow("Stream", frame)
        if cv2.waitKey(1) == ord('q'):
            break
cap.release()
cv2.destroyAllWindows()
```

---

### 2. Base64 Server-Sent Events (SSE) Stream
- **URL**: `GET /b64stream?ip=<camera_ip>`
- **Content-Type**: `text/event-stream`
- **Payload**: `data:image/jpeg;base64,<base64_string>\n\n`
- **Use Case**: Web frontends (React / Vue / Angular / HTML5 Canvas).

#### JavaScript Example:
```javascript
const evtSource = new EventSource("http://127.0.0.1:5004/b64stream?ip=12.12.12.12");

evtSource.onmessage = function(event) {
    const base64Data = event.data; // e.g. "data:image/jpeg;base64,..."
    document.getElementById("canvasOrImg").src = base64Data;
};

evtSource.onerror = function(err) {
    console.error("SSE stream error:", err);
};
```

---

### 3. Single Frame Snapshot
- **URL**: `GET /get_image?ip=<camera_ip>`
- **Content-Type**: `application/json`
- **Use Case**: On-demand snapshots for AI inference, OCR, or thumbnail generation.

#### cURL Request:
```bash
curl -X GET "http://127.0.0.1:5004/get_image?ip=12.12.12.12"
```

#### JSON Response:
```json
{
  "data": "data:image/jpg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
  "width": 640,
  "height": 480
}
```

---

### 4. Health & Diagnostics
- **URL**: `GET /status`
- **Content-Type**: `application/json`
- **Use Case**: Inspecting active threads, frame freshness, and camera status.

#### cURL Request:
```bash
curl -X GET "http://127.0.0.1:5004/status"
```

#### JSON Response:
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

---

## 📁 Repository Structure

```
streaming_server/
├── config.json            # Active camera configuration and app settings
├── requirements.txt       # Python dependencies
├── req.txt                # Alias pointing to requirements.txt
├── README.md              # Documentation and API references
├── input_videos/          # Test/mock video files
│   └── fight4.mp4
├── src/
│   ├── app.py             # Main Flask application & endpoints
│   └── connection.py      # Resilient stream supervisor, FFmpeg & OpenCV engine
└── test_api/              # Auxiliary REST API for remote camera config management
    ├── app.py
    ├── config.json
    └── start.sh
```
