#!/usr/bin/env python3
"""
Streaming Gateway Validation & Diagnostics Script
Run this script to verify your deployment environment and test streaming endpoints.
"""

import json
import os
import shutil
import sys
import time
import urllib.request
import urllib.error

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"

def log_pass(msg):
    print(f"{GREEN}[PASS]{RESET} {msg}")

def log_fail(msg):
    print(f"{RED}[FAIL]{RESET} {msg}")

def log_warn(msg):
    print(f"{YELLOW}[WARN]{RESET} {msg}")

def check_system():
    print("\n--- 1. Checking System Dependencies ---")
    ffmpeg_path = shutil.which("ffmpeg")
    if ffmpeg_path:
        log_pass(f"FFmpeg binary found: {ffmpeg_path}")
    else:
        log_fail("FFmpeg is NOT found in PATH. Please install FFmpeg (e.g. 'sudo apt install ffmpeg').")
        return False

    # Check python imports
    try:
        import importlib.metadata
        import flask
        import flask_cors
        import cv2
        import numpy
        flask_ver = importlib.metadata.version("flask")
        log_pass(f"Python dependencies installed (OpenCV: {cv2.__version__}, Flask: {flask_ver})")
    except Exception as e:
        log_fail(f"Missing Python package: {e}. Run 'pip install -r requirements.txt'")
        return False

    return True

def check_config():
    print("\n--- 2. Checking Configuration ---")
    config_file = "config.json"
    if not os.path.exists(config_file):
        log_fail(f"{config_file} not found in current directory.")
        return False

    try:
        with open(config_file) as f:
            cfg = json.load(f)
        cams = cfg.get("cameras", {}).get("connection_details", {})
        log_pass(f"Config loaded successfully. Found {len(cams)} configured camera(s):")
        for ip, url in cams.items():
            print(f"       - IP: {ip} -> {url}")
        return cfg
    except Exception as e:
        log_fail(f"Failed to parse {config_file}: {e}")
        return False

def check_live_server(cfg):
    print("\n--- 3. Testing Streaming Gateway Endpoints ---")
    host = cfg.get("application", {}).get("app_host", "0.0.0.0")
    if host == "0.0.0.0":
        host = "127.0.0.1"
    port = cfg.get("application", {}).get("app_port", 5004)
    base_url = f"http://{host}:{port}"

    # 1. Status endpoint
    status_url = f"{base_url}/status"
    try:
        req = urllib.request.urlopen(status_url, timeout=3.0)
        data = json.loads(req.read().decode())
        log_pass(f"Server is RUNNING on {base_url}! /status endpoint responded 200 OK.")
    except Exception as e:
        log_warn(f"Server is NOT currently running on {base_url} ({e}).")
        print("       -> Start the server with: python src/app.py")
        print("       -> Running standalone engine self-test instead...")
        run_standalone_test()
        return

    # 2. Test mock stream
    test_ip = "12.12.12.12"
    if test_ip in cfg.get("cameras", {}).get("connection_details", {}):
        print(f"\nTesting camera endpoint for '{test_ip}'...")

        # Test snapshot
        try:
            img_url = f"{base_url}/get_image?ip={test_ip}"
            img_req = urllib.request.urlopen(img_url, timeout=5.0)
            img_data = json.loads(img_req.read().decode())
            if img_data.get("data"):
                log_pass(f"GET /get_image?ip={test_ip} returned valid frame ({img_data.get('width')}x{img_data.get('height')}).")
            else:
                log_warn("GET /get_image returned empty frame.")
        except Exception as e:
            log_fail(f"Failed GET /get_image: {e}")

        # Test MJPEG stream
        try:
            stream_url = f"{base_url}/stream?ip={test_ip}"
            stream_req = urllib.request.urlopen(stream_url, timeout=5.0)
            chunk = stream_req.read(2048)
            if b"--frame" in chunk:
                log_pass(f"GET /stream?ip={test_ip} is streaming MJPEG chunks successfully.")
            else:
                log_warn("Did not receive multipart frame boundary in first chunk.")
        except Exception as e:
            log_fail(f"Failed GET /stream: {e}")

def run_standalone_test():
    print("\n--- Standalone Ingestion Engine Self-Test ---")
    sys.path.append("src")
    try:
        from connection import Connection
        mock_file = "input_videos/fight4.mp4"
        if not os.path.exists(mock_file):
            log_warn(f"Mock video {mock_file} not found; skipping offline engine test.")
            return

        conn = Connection("12.12.12.12", mock_file, width=640, height=480)
        import threading
        t = threading.Thread(target=conn.video_stream, args=(0.02, False), daemon=True)
        t.start()
        time.sleep(1.0)

        h, w, b64 = conn.get_image()
        if b64:
            log_pass(f"Engine decoded frame from {mock_file} successfully ({w}x{h}).")
        else:
            log_fail("Engine failed to decode initial frame.")
        conn.stop()
        t.join(timeout=2.0)
    except Exception as e:
        log_fail(f"Standalone self-test exception: {e}")

def main():
    print("=" * 60)
    print("      RTSP Streaming Gateway Deployment Validator")
    print("=" * 60)

    if not check_system():
        print(f"\n{RED}Validation failed on system dependencies.{RESET}")
        sys.exit(1)

    cfg = check_config()
    if not cfg:
        print(f"\n{RED}Validation failed on configuration.{RESET}")
        sys.exit(1)

    check_live_server(cfg)

    print("\n" + "=" * 60)
    print(f"{GREEN}✓ Validation completed successfully!{RESET}")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    main()
