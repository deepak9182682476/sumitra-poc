// SDE Spotter UAV control (ICD SDE-ICD-SPT-001): the UI calls these, the backend sends UDP/JSON to the SDE GCS.
const router = require("express").Router();
const icd = require("../service/uavIcd");
icd.start();

function reply(res, r) {
  if (r.ok) return res.json({ status: "sent", sent: r.sent, to: r.to });
  return res.status(r.status || 502).json({ status: "error", message: r.error, supported: r.supported });
}
const int = (v) => (typeof v === "number" ? v : typeof v === "string" && /^-?\d+$/.test(v.trim()) ? parseInt(v, 10) : NaN);

// {"command":"MOVE_FORWARD"} etc. (ICD 5.1)
router.post("/command", async (req, res) => {
  const command = req.body && req.body.command;
  reply(res, await icd.sendCommand(typeof command === "string" ? command : ""));
});

// {"enabled": true|false} -> SET_DETECTION (ICD 6.1)
router.post("/detection", async (req, res) => {
  const enabled = req.body && req.body.enabled;
  if (typeof enabled !== "boolean") return res.status(400).json({ status: "error", message: "enabled must be true or false" });
  reply(res, await icd.setDetection(enabled));
});

// {"x":640,"y":360,"video_width":1280,"video_height":720} -> SELECT_TARGET (ICD 6.2)
router.post("/select-target", async (req, res) => {
  const b = req.body || {};
  const w = b.video_width == null ? undefined : int(b.video_width);
  const h = b.video_height == null ? undefined : int(b.video_height);
  reply(res, await icd.selectTarget(int(b.x), int(b.y), w, h));
});

// STOP_TRACKING (ICD 6.3)
router.post("/stop-tracking", async (req, res) => reply(res, await icd.stopTracking()));

// detection / tracking ACK state, last telemetry, last message sent
router.get("/status", (req, res) => res.json(icd.status()));

module.exports = router;
