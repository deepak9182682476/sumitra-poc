// Track History API (used by the Track History dashboard on the map page)
//   GET /api/tracks/summary?from=<ISO>&to=<ISO>&track_id=<id>&limit=<n>   one row per track sighting
//   GET /api/tracks/points?track_id=<id>&from=<ISO>&to=<ISO>             every saved position of that sighting
const store = require("../service/trackStore");

function parseDate(v, fallback) {
  if (!v) return fallback;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

exports.summary = async (req, res) => {
  const to = parseDate(req.query.to, new Date());
  const from = parseDate(req.query.from, new Date(Date.now() - 24 * 3600 * 1000));
  if (!from || !to) return res.status(400).send({ error: true, message: "from / to must be valid dates" });
  if (from > to) return res.status(400).send({ error: true, message: "from must be before to" });
  try {
    const rows = await store.summary({ from: from.toISOString(), to: to.toISOString(), trackId: req.query.track_id || null, limit: req.query.limit });
    res.send({ error: false, from: from.toISOString(), to: to.toISOString(), gap_seconds: store.GAP_SECONDS, tracks: rows });
  } catch (err) {
    console.log("Track history summary error:", err.message);
    res.status(500).send({ error: true, message: "Could not read track history" });
  }
};

exports.points = async (req, res) => {
  if (!req.query.track_id) return res.status(400).send({ error: true, message: "track_id is required" });
  const to = parseDate(req.query.to, new Date());
  const from = parseDate(req.query.from, new Date(0));
  if (!from || !to) return res.status(400).send({ error: true, message: "from / to must be valid dates" });
  try {
    const rows = await store.points({ trackId: req.query.track_id, from: from.toISOString(), to: to.toISOString() });
    res.send({ error: false, track_id: String(req.query.track_id), points: rows });
  } catch (err) {
    console.log("Track history points error:", err.message);
    res.status(500).send({ error: true, message: "Could not read track points" });
  }
};
