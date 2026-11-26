// SDE Spotter UAV - UDP/JSON link to the SDE Ground Control Station (GCS),
// as defined in "Spotter Control Command Interface" (SDE-ICD-SPT-001).
//
// A browser cannot send UDP, so the C2 UI calls this backend over HTTP (/api/uav/...)
// and this module sends exactly one ICD JSON message per UDP datagram:
//
//   C2 command port            3252  {"command":"MOVE_FORWARD"} ... {"command":"PLD_Camera_ZOOMIN"}
//   Detection and target port  5252  {"type":"SET_DETECTION","enabled":true}
//                                    {"type":"SELECT_TARGET","x":640,"y":360,"video_width":1280,"video_height":720}
//                                    {"type":"STOP_TRACKING","x":0,"y":0,"video_width":1280,"video_height":720}
//   Detection / target ACK     3257  (listened on here) DETECTION_STATUS_ACK / TRACK_STATUS_ACK
//   Telemetry                  3250  (listened on here) {"DroneId":"$SDETELE","latitude":..,"longitude":..,...}
//
// The ICD does not fix the GCS IP address, so it is set in .env (UAV_GCS_IP). Ports can be changed in .env too.
// ICD section 8: while tracking is active, UAV movement commands are not transmitted (camera commands still are).

const dgram = require("dgram");

const cfg = {
  gcsIp: process.env.UAV_GCS_IP || "192.168.144.33",
  commandPort: +(process.env.UAV_CMD_PORT || 3252),
  targetPort: +(process.env.UAV_TARGET_PORT || 5252),
  ackPort: +(process.env.UAV_ACK_PORT || 3257),
  telemetryPort: +(process.env.UAV_TELEMETRY_PORT || 3250),
  listenAck: (process.env.UAV_LISTEN_ACK || "on") !== "off",
  listenTelemetry: (process.env.UAV_LISTEN_TELEMETRY || "on") !== "off",
  videoWidth: +(process.env.UAV_VIDEO_WIDTH || 1280),
  videoHeight: +(process.env.UAV_VIDEO_HEIGHT || 720),
};

// Command values exactly as in ICD sections 5.1 / 9 (case-sensitive)
const CAMERA_COMMANDS = ["PLD_Camera_UP", "PLD_Camera_DOWN", "PLD_Camera_ZOOMIN", "PLD_Camera_ZOOMOUT"];
const MOVE_COMMANDS = ["MOVE_FORWARD", "MOVE_BACKWARD", "MOVE_RIGHT", "MOVE_LEFT", "YAW_LEFT", "YAW_RIGHT"];
const ALL_COMMANDS = CAMERA_COMMANDS.concat(MOVE_COMMANDS);

const state = {
  detection: null,        // "ON" / "OFF" from DETECTION_STATUS_ACK (null = no ACK yet)
  detectionRequested: null,
  tracking: null,         // "ON" / "OFF" from TRACK_STATUS_ACK
  trackingRequested: false, // true from SELECT_TARGET until STOP_TRACKING or an OFF ACK
  lastTarget: null,       // last SELECT_TARGET sent
  lastAck: null,          // { message, at }
  telemetry: null,        // last telemetry message
  telemetryAt: null,
  lastSent: null,         // { port, message, at }
  errors: [],
};

let sender = null;
function socket() {
  if (!sender) {
    sender = dgram.createSocket(cfg.gcsIp.includes(":") ? "udp6" : "udp4");
    sender.on("error", (e) => note("send socket: " + e.message));
  }
  return sender;
}

function note(msg) {
  state.errors.unshift({ message: msg, at: new Date().toISOString() });
  state.errors.length = Math.min(state.errors.length, 10);
  console.error("[UAV ICD] " + msg);
}

// One JSON object per datagram (ICD section 7)
function send(port, obj) {
  const text = JSON.stringify(obj);
  return new Promise((resolve) => {
    socket().send(Buffer.from(text), port, cfg.gcsIp, (err) => {
      if (err) {
        note(`UDP send to ${cfg.gcsIp}:${port} failed: ${err.message}`);
        return resolve({ ok: false, error: err.message, sent: text });
      }
      state.lastSent = { port, message: text, at: new Date().toISOString() };
      console.log(`[UAV ICD] -> ${cfg.gcsIp}:${port} ${text}`);
      resolve({ ok: true, sent: text, to: `${cfg.gcsIp}:${port}` });
    });
  });
}

function trackingActive() {
  return state.tracking === "ON" || state.trackingRequested;
}

function sendCommand(command) {
  if (!ALL_COMMANDS.includes(command)) {
    return Promise.resolve({ ok: false, status: 400, error: "Unknown command", supported: ALL_COMMANDS });
  }
  if (MOVE_COMMANDS.includes(command) && trackingActive()) {
    // ICD section 8 / 10: movement commands are not transmitted while tracking is enabled
    return Promise.resolve({ ok: false, status: 409, error: "Tracking is active: UAV movement commands are not sent (ICD section 8). Stop tracking first." });
  }
  return send(cfg.commandPort, { command });
}

function setDetection(enabled) {
  state.detectionRequested = enabled ? "ON" : "OFF";
  return send(cfg.targetPort, { type: "SET_DETECTION", enabled: !!enabled });
}

function checkPixel(x, y, w, h) {
  const ints = [x, y, w, h].every((v) => Number.isInteger(v));
  if (!ints) return "x, y, video_width and video_height must be whole numbers";
  if (w <= 0 || h <= 0) return "video_width and video_height must be above 0";
  if (x < 0 || y < 0 || x >= w || y >= h) return `x must be 0..${w - 1} and y 0..${h - 1}`;
  return null;
}

function selectTarget(x, y, w, h) {
  w = w == null ? cfg.videoWidth : w;
  h = h == null ? cfg.videoHeight : h;
  const bad = checkPixel(x, y, w, h);
  if (bad) return Promise.resolve({ ok: false, status: 400, error: bad });
  const msg = { type: "SELECT_TARGET", x, y, video_width: w, video_height: h };
  state.trackingRequested = true;
  state.lastTarget = Object.assign({ at: new Date().toISOString() }, msg);
  return send(cfg.targetPort, msg);
}

function stopTracking() {
  state.trackingRequested = false;
  return send(cfg.targetPort, { type: "STOP_TRACKING", x: 0, y: 0, video_width: cfg.videoWidth, video_height: cfg.videoHeight });
}

function handleAck(text) {
  let m;
  try { m = JSON.parse(text); } catch (e) { return note("ACK is not JSON: " + String(text).slice(0, 120)); }
  state.lastAck = { message: m, at: new Date().toISOString() };
  if (m.type === "DETECTION_STATUS_ACK" && (m.status === "ON" || m.status === "OFF")) state.detection = m.status;
  if (m.type === "TRACK_STATUS_ACK" && (m.status === "ON" || m.status === "OFF")) {
    state.tracking = m.status;
    if (m.status === "OFF") state.trackingRequested = false;
  }
  console.log("[UAV ICD] <- ACK " + text);
}

function handleTelemetry(text) {
  try {
    const t = JSON.parse(text);
    if (typeof t.latitude === "number" && typeof t.longitude === "number") {
      state.telemetry = t;
      state.telemetryAt = new Date().toISOString();
    }
  } catch (e) { /* ignore non-JSON telemetry */ }
}

function listen(port, onText, label) {
  const s = dgram.createSocket({ type: "udp4", reuseAddr: true });
  s.on("message", (buf) => onText(buf.toString("utf8")));
  s.on("error", (e) => { note(`cannot listen for ${label} on UDP ${port}: ${e.message}`); try { s.close(); } catch (x) { } });
  s.bind(port, () => console.log(`[UAV ICD] listening for ${label} on UDP ${port}`));
  return s;
}

let started = false;
function start() {
  if (started) return;
  started = true;
  if (cfg.listenAck) listen(cfg.ackPort, handleAck, "detection/target ACKs");
  if (cfg.listenTelemetry) listen(cfg.telemetryPort, handleTelemetry, "telemetry");
  console.log(`[UAV ICD] GCS ${cfg.gcsIp}: commands ${cfg.commandPort}, detection/target ${cfg.targetPort}`);
}

function status() {
  return {
    gcs: cfg.gcsIp,
    ports: { command: cfg.commandPort, target: cfg.targetPort, ack: cfg.ackPort, telemetry: cfg.telemetryPort },
    video: { width: cfg.videoWidth, height: cfg.videoHeight },
    detection: state.detection,
    detectionRequested: state.detectionRequested,
    tracking: state.tracking,
    trackingActive: trackingActive(),
    lastTarget: state.lastTarget,
    lastAck: state.lastAck,
    telemetry: state.telemetry,
    telemetryAt: state.telemetryAt,
    lastSent: state.lastSent,
    errors: state.errors,
  };
}

module.exports = { start, sendCommand, setDetection, selectTarget, stopTracking, status, CAMERA_COMMANDS, MOVE_COMMANDS, cfg, _handleAck: handleAck };
