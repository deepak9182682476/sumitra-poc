import base64
import gc
import logging
import os
import subprocess
import threading
import time
from queue import Empty, Full, Queue
import cv2
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] [Connection] %(message)s'
)
logger = logging.getLogger("Connection")


class Connection:
    def __init__(self, ip, rtsp_url, width=1280, height=720, fps=25, jpeg_quality=85):
        self.ip = str(ip)
        self.rtsp_url = str(rtsp_url)
        
        # Stream resolution and performance settings
        self.w = int(width)
        self.h = int(height)
        self.fps = int(fps)
        self.jpeg_quality = int(jpeg_quality)

        # State & lifecycle flags
        self.running = True              # Global lifecycle for this camera connection
        self._ingest_running = False     # Lifecycle of current ingestion session (FFmpeg / OpenCV)
        self.reconnect_event = threading.Event()
        
        # Frame storage & condition variable for zero-latency multi-client notification
        self.lock = threading.Lock()
        self.frame_condition = threading.Condition(self.lock)
        self.frame = None                # NumPy BGR array
        self.latest_jpeg = None          # Pre-encoded JPEG bytes (cached for all /stream clients)
        self.latest_b64 = None           # Pre-encoded Base64 string (cached for all /b64stream clients)
        self.frame_id = 0                # Monotonic frame counter

        # Watchdog & health tracking
        self.last_frame_time = 0.0
        self.watchdog_interval = 2.0     # Check every 2 seconds
        self.watchdog_timeout = 6.0      # Trigger reconnect if no frames for 6s
        
        # Queue & processes
        self.frame_queue = Queue(maxsize=3)  # Low buffer to enforce strict real-time streaming
        self.ffmpeg_process = None
        self.threads = []
        
        # Determine source type
        self.is_video_file = self.rtsp_url.lower().endswith(
            ('.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.m4v')
        )

    # -------------------------------------------------------------------------
    # Helper: Exact Byte Reader for Pipes (Handles High Resolutions)
    # -------------------------------------------------------------------------
    @staticmethod
    def _read_exact(pipe, num_bytes):
        """
        Reads exactly num_bytes from a pipe stream.
        Accumulates partial reads from OS pipe buffers (crucial for 720p/1080p).
        Returns None on EOF or broken pipe.
        """
        chunks = []
        bytes_read = 0
        while bytes_read < num_bytes:
            chunk = pipe.read(min(num_bytes - bytes_read, 262144))  # 256KB read chunk
            if not chunk:
                return None  # Stream closed or EOF
            chunks.append(chunk)
            bytes_read += len(chunk)
        return b''.join(chunks) if len(chunks) > 1 else chunks[0]

    # -------------------------------------------------------------------------
    # Ingestion Supervisor & Auto-Reconnect
    # -------------------------------------------------------------------------
    def video_stream(self, sleep_interval=0.04, connection_retry=True):
        """
        Supervisor thread that manages video ingestion.
        Automatically reconnects if the camera stream drops or freezes.
        """
        logger.info(
            f"[{self.ip}] Starting video supervisor for {self.rtsp_url} "
            f"({self.w}x{self.h} @ {self.fps}fps, Q={self.jpeg_quality})"
        )
        retries = 0

        while self.running:
            self.reconnect_event.clear()
            self._ingest_running = True

            try:
                if self.is_video_file:
                    self._play_recorded_video(sleep_interval)
                else:
                    self._run_ffmpeg_pipeline()
            except Exception as e:
                logger.error(f"[{self.ip}] Ingestion error: {e}", exc_info=True)
            finally:
                self._stop_ingest()

            if not self.running:
                break

            if not connection_retry:
                logger.info(f"[{self.ip}] connection_retry is False. Supervisor exiting.")
                break

            retries += 1
            # Exponential backoff capped at 5 seconds for rapid recovery
            backoff = min(2 ** min(retries, 4), 5)
            logger.warning(
                f"[{self.ip}] Stream disconnected or stalled. Reconnecting in {backoff}s (attempt {retries})..."
            )

            # Wait backoff time while listening for shutdown
            sleep_end = time.time() + backoff
            while self.running and time.time() < sleep_end:
                time.sleep(0.2)

            # Reset retry count if stream was healthy
            if self.last_frame_time > 0 and (time.time() - self.last_frame_time < 20):
                retries = 0

    # -------------------------------------------------------------------------
    # FFmpeg Ingestion Pipeline (RTSP / Network Streams)
    # -------------------------------------------------------------------------
    def _run_ffmpeg_pipeline(self):
        """
        Launches FFmpeg over TCP and manages reader, decoder, watchdog, and error logger.
        """
        is_rtsp = self.rtsp_url.lower().startswith(('rtsp://', 'rtsps://'))

        command = [
            'ffmpeg',
            '-hide_banner',
            '-loglevel', 'error',
        ]

        if is_rtsp:
            command.extend([
                '-rtsp_transport', 'tcp',    # TCP guarantees zero packet drops
                '-timeout', '5000000',       # 5s RTSP timeout (in microseconds)
                # '-stimeout', '5000000',      # Socket timeout
                '-reorder_queue_size', '0',  # Zero delay packet reordering
                '-buffer_size', '2048000',   # 2MB buffer for high-res streams
            ])

        command.extend([
            '-fflags', 'nobuffer',
            '-flags', 'low_delay',
            '-i', self.rtsp_url,
            '-an',                         # No audio
            '-sn',                         # No subtitles
            '-dn',                         # No data
            '-vf', f'scale={self.w}:{self.h}',
            '-r', str(self.fps),
            '-f', 'rawvideo',
            '-pix_fmt', 'bgr24',
            '-'
        ])

        logger.info(f"[{self.ip}] Spawning FFmpeg process (Target: {self.w}x{self.h} TCP)...")
        try:
            self.ffmpeg_process = subprocess.Popen(
                command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                bufsize=10**7
            )
        except Exception as e:
            logger.error(f"[{self.ip}] Failed to spawn FFmpeg: {e}")
            return

        # Start ingestion helper threads
        t_read = threading.Thread(target=self._thread_read_frames, daemon=True, name=f"read-{self.ip}")
        t_decode = threading.Thread(target=self._thread_decode_frames, daemon=True, name=f"decode-{self.ip}")
        t_watchdog = threading.Thread(target=self._thread_watchdog, daemon=True, name=f"watchdog-{self.ip}")
        t_err = threading.Thread(target=self._thread_log_errors, daemon=True, name=f"err-{self.ip}")

        self.threads = [t_read, t_decode, t_watchdog, t_err]
        for t in self.threads:
            t.start()

        # Supervision loop: monitors FFmpeg process status and reconnect events
        while self.running and self._ingest_running and not self.reconnect_event.is_set():
            if self.ffmpeg_process and self.ffmpeg_process.poll() is not None:
                rc = self.ffmpeg_process.returncode
                logger.warning(f"[{self.ip}] FFmpeg process exited (code {rc}). Reconnecting...")
                self.reconnect_event.set()
                break
            self.reconnect_event.wait(timeout=0.5)

    def _thread_read_frames(self):
        """Reads raw BGR frames from FFmpeg stdout into frame queue using exact reader."""
        frame_bytes = self.w * self.h * 3

        while self.running and self._ingest_running and not self.reconnect_event.is_set():
            try:
                if not self.ffmpeg_process or not self.ffmpeg_process.stdout:
                    break

                raw_frame = self._read_exact(self.ffmpeg_process.stdout, frame_bytes)
                if not raw_frame:
                    logger.warning(f"[{self.ip}] EOF or incomplete frame from FFmpeg. Reconnecting...")
                    self.reconnect_event.set()
                    break

                # Put into queue; discard oldest if full to maintain zero latency
                try:
                    self.frame_queue.put_nowait(raw_frame)
                except Full:
                    try:
                        self.frame_queue.get_nowait()
                    except Empty:
                        pass
                    try:
                        self.frame_queue.put_nowait(raw_frame)
                    except Full:
                        pass

            except Exception as e:
                logger.error(f"[{self.ip}] Exception reading FFmpeg stdout: {e}")
                self.reconnect_event.set()
                break

    def _thread_decode_frames(self):
        """
        Pulls raw bytes, decodes into NumPy array, pre-encodes JPEG/Base64 once,
        and broadcasts to all waiting HTTP clients using Condition variable.
        """
        while self.running and self._ingest_running and not self.reconnect_event.is_set():
            try:
                raw_frame = self.frame_queue.get(timeout=0.5)
            except Empty:
                continue

            try:
                arr = np.frombuffer(raw_frame, np.uint8).reshape((self.h, self.w, 3))
                # Pre-encode JPEG once for all connected clients
                ret, buffer = cv2.imencode('.jpg', arr, [int(cv2.IMWRITE_JPEG_QUALITY), self.jpeg_quality])
                if ret:
                    jpeg_bytes = buffer.tobytes()
                    b64_str = base64.b64encode(buffer).decode()

                    with self.frame_condition:
                        self.frame = arr
                        self.latest_jpeg = jpeg_bytes
                        self.latest_b64 = b64_str
                        self.frame_id += 1
                        self.last_frame_time = time.time()
                        # Wake up all waiting client streaming threads instantly
                        self.frame_condition.notify_all()
            except Exception as e:
                logger.error(f"[{self.ip}] Error decoding frame: {e}")

    def _thread_watchdog(self):
        """
        Monitors frame arrival timestamps.
        Triggers an immediate reconnect if frames stop arriving.
        """
        grace_period_end = time.time() + 10.0  # Initial 10s grace for connection handshake

        while self.running and self._ingest_running and not self.reconnect_event.is_set():
            time.sleep(self.watchdog_interval)
            now = time.time()

            if now < grace_period_end and self.last_frame_time == 0:
                continue

            if self.last_frame_time > 0 and (now - self.last_frame_time > self.watchdog_timeout):
                logger.warning(
                    f"[{self.ip}] Watchdog detected stalled stream (no frames for "
                    f"{now - self.last_frame_time:.1f}s). Triggering auto-reconnect..."
                )
                self.reconnect_event.set()
                break
            elif self.last_frame_time == 0 and now >= grace_period_end:
                logger.warning(f"[{self.ip}] Watchdog: No initial frames received within grace period. Reconnecting...")
                self.reconnect_event.set()
                break

    def _thread_log_errors(self):
        """Logs stderr from FFmpeg without spinning CPU when pipe closes."""
        while self.running and self._ingest_running:
            try:
                if not self.ffmpeg_process or not self.ffmpeg_process.stderr:
                    break
                line = self.ffmpeg_process.stderr.readline()
                if not line:
                    break
                msg = line.decode('utf-8', errors='replace').strip()
                if msg:
                    logger.debug(f"[{self.ip}] FFmpeg log: {msg}")
            except Exception:
                break

    def _stop_ingest(self):
        """Safely stops active FFmpeg process and its worker threads."""
        self._ingest_running = False
        self.reconnect_event.set()

        # Stop FFmpeg process
        if self.ffmpeg_process:
            try:
                if self.ffmpeg_process.poll() is None:
                    self.ffmpeg_process.terminate()
                    try:
                        self.ffmpeg_process.wait(timeout=1.5)
                    except subprocess.TimeoutExpired:
                        self.ffmpeg_process.kill()
                        self.ffmpeg_process.wait(timeout=1.0)
            except Exception as e:
                logger.debug(f"[{self.ip}] Error terminating FFmpeg: {e}")
            self.ffmpeg_process = None

        # Empty frame queue
        while not self.frame_queue.empty():
            try:
                self.frame_queue.get_nowait()
            except Empty:
                break

        # Join helper threads
        for t in self.threads:
            if t and t.is_alive() and t != threading.current_thread():
                t.join(timeout=1.0)
        self.threads = []

    # -------------------------------------------------------------------------
    # Recorded Video Playback (Mock Stream Loop)
    # -------------------------------------------------------------------------
    def _play_recorded_video(self, sleep_interval):
        """Plays recorded video file, continuously looping back to start on EOF."""
        logger.info(f"[{self.ip}] Playing recorded video mock: {self.rtsp_url}")
        vid = cv2.VideoCapture(self.rtsp_url)
        if not vid.isOpened():
            logger.error(f"[{self.ip}] Cannot open video file: {self.rtsp_url}")
            time.sleep(2.0)
            return

        # Use file dimensions or scale if specified
        source_w = int(vid.get(cv2.CAP_PROP_FRAME_WIDTH)) or self.w
        source_h = int(vid.get(cv2.CAP_PROP_FRAME_HEIGHT)) or self.h

        try:
            while self.running and self._ingest_running:
                success, frame = vid.read()
                if not success:
                    # Video finished! Loop seamlessly back to start
                    logger.info(f"[{self.ip}] Video EOF reached. Rewinding to start.")
                    vid.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    success, frame = vid.read()
                    if not success:
                        time.sleep(1.0)
                        break

                # Resize if target resolution differs from source
                if (source_w, source_h) != (self.w, self.h):
                    frame = cv2.resize(frame, (self.w, self.h), interpolation=cv2.INTER_LINEAR)

                # Pre-encode JPEG once
                ret, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), self.jpeg_quality])
                if ret:
                    jpeg_bytes = buffer.tobytes()
                    b64_str = base64.b64encode(buffer).decode()

                    with self.frame_condition:
                        self.frame = frame
                        self.latest_jpeg = jpeg_bytes
                        self.latest_b64 = b64_str
                        self.frame_id += 1
                        self.last_frame_time = time.time()
                        self.frame_condition.notify_all()

                time.sleep(sleep_interval)
        finally:
            vid.release()

    # -------------------------------------------------------------------------
    # Client Streaming Endpoints (High Concurrency, Zero Duplicate Encoding)
    # -------------------------------------------------------------------------
    def get_stream(self):
        """
        Yields multipart MJPEG stream to HTTP clients.
        MULTIPLEXED & HIGH-CONCURRENCY:
        - Uses pre-encoded JPEG cached in memory; does NOT re-encode for each client.
        - 1 client or 50 clients consume identical CPU.
        - Condition variable wakes client threads instantaneously on new frames.
        - RESILIENT: Does not close when camera reconnects.
        """
        last_sent_frame_id = -1

        while self.running:
            with self.frame_condition:
                # Wait until a fresh frame arrives or timeout for heartbeat
                if self.frame_id == last_sent_frame_id or self.latest_jpeg is None:
                    self.frame_condition.wait(timeout=0.1)

                jpeg_data = self.latest_jpeg
                current_id = self.frame_id

            if jpeg_data is not None:
                if current_id != last_sent_frame_id:
                    last_sent_frame_id = current_id
                    try:
                        yield (
                            b'--frame\r\n'
                            b'Content-Type: image/jpeg\r\n\r\n' + jpeg_data + b'\r\n'
                        )
                    except (GeneratorExit, BrokenPipeError, ConnectionResetError):
                        # Client disconnected or closed tab
                        break
            else:
                # Waiting for first frame
                time.sleep(0.05)

    def get_b64stream(self):
        """
        Yields Server-Sent Events (SSE) Base64 stream.
        MULTIPLEXED: Uses pre-encoded base64 string from cache.
        RESILIENT: Does not close when camera reconnects.
        """
        last_sent_frame_id = -1

        while self.running:
            with self.frame_condition:
                if self.frame_id == last_sent_frame_id or self.latest_b64 is None:
                    self.frame_condition.wait(timeout=0.1)

                b64_data = self.latest_b64
                current_id = self.frame_id

            if b64_data is not None:
                if current_id != last_sent_frame_id:
                    last_sent_frame_id = current_id
                    try:
                        yield f"data:image/jpeg;base64,{b64_data}\n\n"
                    except (GeneratorExit, BrokenPipeError, ConnectionResetError):
                        break
            else:
                time.sleep(0.05)

    def get_image(self):
        """Returns single snapshot in base64 instantly from cache: (height, width, base64_str)."""
        with self.lock:
            if self.frame is not None and self.latest_b64 is not None:
                return self.h, self.w, self.latest_b64
        return 0, 0, ""

    def stop(self):
        """Stops this camera stream permanently and cleans up all resources."""
        logger.info(f"[{self.ip}] Stopping camera connection...")
        self.running = False
        self._stop_ingest()
        with self.frame_condition:
            self.frame = None
            self.latest_jpeg = None
            self.latest_b64 = None
            self.frame_condition.notify_all()
        gc.collect()
