import threading
import cv2
import base64
import subprocess
import numpy as np
import time
import logging
import gc
from queue import Queue, Full, Empty


class Connection:
    def __init__(self, ip, rtsp_url):
        self.frame = None
        self.h = 480
        self.w = 640
        self.ip = ip
        self.rtsp_url = rtsp_url
        self.running = True
        self.lock = threading.Lock()  # Thread-safe access to frames
        self.retries = 0  # Retry counter
        self.ffmpeg_process = None
        self.frame_queue = Queue(maxsize=20)  # Increased queue size for better buffering
        self.watchdog_interval = 5  # Watchdog checks every 5 seconds
        self.watchdog_timeout = 10  # Max time a thread can go without progress
        self.should_reconnect = False  # Flag for reconnecting
        self.reading_thread = None
        self.decoding_thread = None
        self.watchdog_thread = None

    # Base64 Stream
    def get_b64stream(self):
        while self.running:
            h, w, data = self.get_image()
            if data:
                yield f"data:image/jpeg;base64,{data}\n\n"

    # Video Stream
    def get_stream(self):
        while self.running:
            with self.lock:
                if self.frame is not None:
                    ret, buffer = cv2.imencode('.jpg', self.frame)
                    if ret:
                        yield (b'--frame\r\n'
                               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.01)  # Sleep to reduce CPU usage

    # Get Image in Base64
    def get_image(self):
        with self.lock:
            if self.frame is not None:
                # print ("frame........", self.frame)
                #high_res_frame = cv2.resize(self.frame, (1920, 1080), interpolation=cv2.INTER_LINEAR)
                ret, buffer = cv2.imencode('.jpg', self.frame)
                if ret:
                    return self.h, self.w, base64.b64encode(buffer).decode()
        return 0, 0, ""

    # FFmpeg process with robust error recovery
    def start_ffmpeg(self):
        # print ("Manoj........................")
        command = [
            'ffmpeg',
            '-rtsp_transport', 'udp',
            '-i', self.rtsp_url,
            '-b:v', '1500k',
            '-maxrate', '1500k',
            '-bufsize', '3000k',
            '-g', '20',
            '-preset', 'veryfast',
            '-tune', 'zerolatency',
            '-r', '20',
            '-s', '640x480',
            '-f', 'rawvideo',
            '-pix_fmt', 'bgr24',
            '-reconnect', '1',
            '-reconnect_at_eof', '1',
            '-reconnect_streamed', '1',
            '-reconnect_delay_max', '2',
            '-timeout', '5000000',
            '-'
        ]
        self.ffmpeg_process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        # Start a thread to log FFmpeg errors
        threading.Thread(target=self.log_ffmpeg_errors, daemon=True).start()

    def log_ffmpeg_errors(self):
        while self.running:
            error = self.ffmpeg_process.stderr.readline()
            if error:
                logging.error(f"FFmpeg error: {error.decode().strip()}")

    # Read frames from FFmpeg and put them in the queue
    def read_frames(self):
        while self.running:
            try:
                raw_frame = self.ffmpeg_process.stdout.read(self.w * self.h * 3)
                if len(raw_frame) == self.w * self.h * 3:
                    try:
                        if self.frame_queue.empty():
                            self.frame_queue.put(raw_frame)
                        # self.frame_queue.put(raw_frame, block=False)  # Non-blocking put
                        logging.info("Frame read and queued.")
                    except Full:
                        logging.warning("Frame queue full, dropping frame.")
                else:
                    logging.warning("Incomplete frame. Setting reconnect flag...")
                    self.should_reconnect = True
                    break  # Exit the loop to trigger reconnection
            except Exception as e:
                logging.error(f"Error reading frame: {e}")
                self.should_reconnect = True
                break  # Exit the loop to trigger reconnection

    # Decode frames from the queue
    def decode_frames(self):
        while self.running:
            try:
                raw_frame = self.frame_queue.get(timeout=1)  # Timeout on get to avoid hanging
                if raw_frame:
                    with self.lock:
                        self.frame = np.frombuffer(raw_frame, np.uint8).reshape((self.h, self.w, 3))
                        logging.info("Frame processed.")
                self.frame_queue.task_done()  # Mark frame as processed
            except Empty:
                continue  # No frame in queue, keep going
            except Exception as e:
                logging.error(f"Error decoding frame: {e}")

    # Watchdog thread to monitor health of frame reading and decoding
    def watchdog(self):
        last_frame_time = time.time()

        while self.running:
            current_time = time.time()

            with self.lock:
                if self.frame is not None:
                    last_frame_time = current_time  # Update the last frame time if we have a frame

            # If no frame has been processed within the timeout, restart the stream
            if current_time - last_frame_time > self.watchdog_timeout:
                logging.error("Watchdog: No frames processed within timeout. Restarting stream.")
                self.should_reconnect = True  # Set the flag for reconnection
                break  # Exit to restart the stream

            time.sleep(self.watchdog_interval)

    # Main video stream handler
    def video_stream(self, sleep_interval, connection_retry=True):
        while self.running:
            try:
                # Check if the URL is a recorded video file
                if self.rtsp_url.lower().endswith(('.mp4', '.mkv', '.avi', '.mov', '.wmv')):
                    logging.info(f"[{self.ip}] Starting playback of recorded video.")
                    # Use OpenCV VideoCapture for recorded videos
                    vid = cv2.VideoCapture(self.rtsp_url)
                    self.w = int(vid.get(cv2.CAP_PROP_FRAME_WIDTH))
                    self.h = int(vid.get(cv2.CAP_PROP_FRAME_HEIGHT))

                    while self.running:
                        success, frame = vid.read()
                        if not success:
                            logging.info(f"[{self.ip}] End of recorded video.")
                            break  # Exit the loop when the video ends
                        with self.lock:
                            self.frame = frame
                        time.sleep(sleep_interval)  # Control playback speed

                    vid.release()  # Release the video capture when done

                else:
                    logging.info(f"[{self.ip}] Starting FFmpeg for live stream.")
                    # Start FFmpeg process and set frame dimensions
                    self.start_ffmpeg()

                    # Start threads for reading and decoding frames
                    #reader_thread = threading.Thread(target=self.read_frames, daemon=True)
                    #decoder_thread = threading.Thread(target=self.decode_frames, daemon=True)
                    #watchdog_thread = threading.Thread(target=self.watchdog, daemon=True)

                    #reader_thread.start()
                    #decoder_thread.start()
                    #watchdog_thread.start()
                    
                    self.reading_thread = threading.Thread(target=self.read_frames, daemon=True)
                    self.decoding_thread = threading.Thread(target=self.decode_frames, daemon=True)
                    self.watchdog_thread = threading.Thread(target=self.watchdog, daemon=True)
                    
                    self.reading_thread.start()
                    self.decoding_thread.start()
                    self.watchdog_thread.start()

                    # Main loop to keep the connection alive
                    while self.running and self.ffmpeg_process.poll() is None:
                        time.sleep(sleep_interval)

                    # Ensure all threads complete
                    #reader_thread.join()
                    #decoder_thread.join()
                    #watchdog_thread.join()
                    
                    if self.reading_thread and self.reading_thread.is_alive():
                    	self.reading_thread.join()
                    if self.decoding_thread and self.decoding_thread.is_alive():
                    	self.decoding_thread.join()
                    if self.watchdog_thread and self.watchdog_thread.is_alive():
                    	self.watchdog_thread.join()

                    logging.info("FFmpeg process terminated.")

            except Exception as e:
                logging.error(f"Error in video stream: {e}")
                self.running = False

            # Retry connection logic with exponential backoff
            if connection_retry and self.should_reconnect:
                self.retries += 1
                retry_delay = min(2 ** self.retries, 10)  # Exponential backoff up to 10 seconds
                logging.info(f"Retrying connection: attempt {self.retries}, waiting {retry_delay}s")
                time.sleep(retry_delay)

                self.should_reconnect = False  # Reset reconnect flag

                if self.retries > 5:
                    logging.error("Max retries exceeded. Stopping stream.")
                    self.running = False

            # Restart the stream if it was stopped
            if not self.running:
                logging.info("Restarting the stream...")
                self.running = True
                self.retries = 0  # Reset retries on successful restart

    # Stop the stream and cleanup
    def stop(self):

        logging.info(f"[{self.ip}] Stopping stream...") 
        self.running = False

        if self.reading_thread is not None:  
            self.reading_thread.join()  
        if self.decoding_thread is not None:  
            self.decoding_thread.join()  
        if self.watchdog_thread is not None:  
            self.watchdog_thread.join()  

        if self.ffmpeg_process:
            self.ffmpeg_process.terminate()  # Terminate FFmpeg process
            self.ffmpeg_process.wait()  # Wait for process to fully terminate
            logging.info(f"[{self.ip}] FFmpeg process terminated.")

        with self.lock:
            self.frame = None
            self.h, self.w = 0, 0      

        self.cleanup()

    def cleanup(self):
        
        if self.frame_queue is not None:
            while not self.frame_queue.empty():  
                try:  
                    self.frame_queue.get_nowait()  # Remove all items in the queue  
                    self.frame_queue.task_done()  
                except Empty:  
                    break  
        
        del self.frame_queue  # Delete the frame queue  
        del self.ffmpeg_process  # Delete the FFmpeg process reference  
        gc.collect()  # Force garbage collection to free up memory  
        logging.info(f"[{self.ip}] Resources cleaned up.")

    # Add a method to release resources before switching cameras  
    def switch_camera(self, new_ip, new_rtsp_url):  
        """Switches to a new camera feed, releasing current resources."""  
        self.stop()  # Stop the current feed 
        self.cleanup() 
        self.ip = new_ip  
        self.rtsp_url = new_rtsp_url  
        self.start_ffmpeg()  # Start the new camera feed           
