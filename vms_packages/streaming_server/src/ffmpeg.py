import base64
import subprocess
import numpy as np
import cv2
import threading
from queue import Queue
import time

class Connection:
    def __init__(self, ip, rtsp_url):
        self.frame_queue = Queue(maxsize=100)  # Increased queue size for buffering
        self.h = 240  # Height for processing; adjust as needed
        self.w = 320  # Width for processing; adjust as needed
        self.ip = ip
        self.rtsp_url = rtsp_url
        self.running = True

    def get_b64stream(self):
        while self.running:
            data = self.get_image()
            if data:
                yield f"data: image/jpg;base64,{data}\n\n"

    def get_image(self):
        if not self.frame_queue.empty():
            frame = self.frame_queue.get()
            success, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 85])  # Adjust quality
            if success:
                return base64.b64encode(buffer).decode()
        return None

    def video_stream(self):
        command = [
            'ffmpeg',
            '-rtsp_transport', 'tcp',  # Use TCP for a reliable connection
            '-i', self.rtsp_url,
            '-r', '25',  # Adjust to match the camera's output
            '-preset', 'ultrafast',  # Fast processing; may experiment with 'superfast'
            '-tune', 'zerolatency',  # Minimize latency
            '-b:v', '1500k',  # Increase for better quality
            '-bufsize', '3000k',  # Adapt based on network conditions
            '-f', 'image2pipe',
            '-pix_fmt', 'bgr24',
            '-vcodec', 'rawvideo',
            '-'
        ]

        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, bufsize=10**7)
        threading.Thread(target=self.read_frames, args=(process,), daemon=True).start()

    def read_frames(self, process):
        while self.running:
            raw_frame = process.stdout.read(self.w * self.h * 3)

            # Verify that we received a full frame
            if len(raw_frame) != self.w * self.h * 3:
                print("Frame incomplete. Attempting to reconnect...")
                break

            # Convert raw frame data to an image
            frame = np.frombuffer(raw_frame, np.uint8).reshape((self.h, self.w, 3))

            # Manage the frame queue
            if self.frame_queue.full():
                self.frame_queue.get()  # Discard the oldest frame
            self.frame_queue.put(frame)  # Add the new frame

            time.sleep(0.001)  # Fine-tune sleep time for optimal performance

        process.stdout.close()
        process.wait()
        print("FFmpeg process completed.")

    def stop_stream(self):
        self.running = False

