import cv2
import base64
import time


class Connection:

    def __init__(self, ip, rtsp_url):

        self.frame = None
        self.h = 0
        self.w = 0

        self.ip = ip
        self.rtsp_url = rtsp_url
        self.skip_frame_interval = 10

    # Home
    def get_b64stream(self):

        while True:
            h, w, data = self.get_image()
            if data is not None:
                yield "data: {}\n\n".format("data:image/jpg;base64, " + data)

    # Videos
    def get_stream(self):

        while True:
            if self.frame is not None:
                ret, buffer = cv2.imencode('.jpg', self.frame)
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

    # Camera Settings
    def get_image(self):

        if self.frame is not None:
            ret, buffer = cv2.imencode('.jpg', self.frame)
            return self.h, self.w, base64.b64encode(buffer).decode()
        else:
            return 0, 0, ""

    def video_stream(self, sleep_interval, connection_retry):

        vid = cv2.VideoCapture(self.rtsp_url, cv2.CAP_FFMPEG)
        self.w = int(vid.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.h = int(vid.get(cv2.CAP_PROP_FRAME_HEIGHT))
        frame_count = 0 
        while True:
            success, frame = vid.read()
            if success:
                frame_count += 1
                if frame_count % self.skip_frame_interval == 0:  
                    self.frame = frame
                    if self.rtsp_url[0:4] != "rtsp" and self.rtsp_url[0:3] != "rtp":
                        print("frame")
                        # Applies only for recorded videos
                        time.sleep(sleep_interval)
            else:
                vid.release()

                if connection_retry:
                    vid = cv2.VideoCapture(self.rtsp_url, cv2.CAP_FFMPEG)
                    time.sleep(0.1)
                else:
                    break
