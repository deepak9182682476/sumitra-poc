// Radar track history: stores every radar position (one row per radar message) in table track_points,
// and builds per-track summaries for the Track History dashboard.
// The table is created automatically on first use. Rows older than TRACK_RETENTION_DAYS (default 90) are deleted daily.
// NOTE: ../models is required lazily (inside q). models/index.js loads service/topic.js -> controllers/map.js -> this file,
// so a top-level require here would get an unfinished (empty) object.
const { isValidTrackId, ZERO_ID_SQL_REGEX } = require("../utils/trackId"); // ID 0 is never stored or listed
function sequelize() {
  const db = require("../models");
  return db && db.sequelize;
}

let ready = null;
let warned = false;

// always returns a promise (never throws), so a database problem can't crash the server
function q(sql, replacements, select) {
  try {
    const sq = sequelize();
    if (!sq) return Promise.reject(new Error("database not ready"));
    const opts = { replacements: replacements || {} };
    if (select) opts.type = sq.QueryTypes.SELECT;
    return Promise.resolve(sq.query(sql, opts));
  } catch (err) {
    return Promise.reject(err);
  }
}

function ensureTable() {
  if (!ready) {
    ready = q(`CREATE TABLE IF NOT EXISTS track_points (
                 id         BIGSERIAL PRIMARY KEY,
                 track_id   TEXT NOT NULL,
                 ts         TIMESTAMPTZ NOT NULL DEFAULT now(),
                 latitude   DOUBLE PRECISION NOT NULL,
                 longitude  DOUBLE PRECISION NOT NULL,
                 range_km   DOUBLE PRECISION,
                 azimuth    DOUBLE PRECISION,
                 speed      DOUBLE PRECISION,
                 heading    DOUBLE PRECISION,
                 source     TEXT,
                 raw        JSONB
               )`)
      .then(() => q(`CREATE INDEX IF NOT EXISTS track_points_track_ts ON track_points (track_id, ts)`))
      .then(() => q(`CREATE INDEX IF NOT EXISTS track_points_ts ON track_points (ts)`))
      .catch((err) => { ready = null; throw err; });
  }
  return ready;
}

function num(v) {
  const n = Number(v);
  return v === null || v === undefined || v === "" || isNaN(n) ? null : n;
}

// p: { track_id, latitude, longitude, range_km?, azimuth?, speed?, heading?, source?, raw? }
// Never throws: a storage problem must not stop alarms / tracks on the screen.
function savePoint(p) {
  const lat = num(p && p.latitude), lon = num(p && p.longitude);
  if (!p || !isValidTrackId(p.track_id) || lat === null || lon === null) return Promise.resolve(false); // ID 0 is never stored
  return ensureTable()
    .then(() => q(
      `INSERT INTO track_points (track_id, latitude, longitude, range_km, azimuth, speed, heading, source, raw)
       VALUES (:track_id, :lat, :lon, :range_km, :azimuth, :speed, :heading, :source, CAST(:raw AS JSONB))`,
      {
        track_id: String(p.track_id), lat, lon,
        range_km: num(p.range_km), azimuth: num(p.azimuth), speed: num(p.speed), heading: num(p.heading),
        source: p.source || null,
        raw: p.raw ? JSON.stringify(p.raw) : null,
      }))
    .then(() => true)
    .catch((err) => {
      if (!warned) { console.log("Track history: could not save point -", err.message); warned = true; }
      return false;
    });
}

// A "track" in the dashboard = one continuous sighting of a track id.
// If the same id has no point for GAP_SECONDS it starts a new track (radars re-use ids).
const GAP_SECONDS = 300;

function summary({ from, to, trackId, limit }) {
  const lim = Math.max(1, Math.min(2000, parseInt(limit, 10) || 500));
  return ensureTable().then(() => q(
    `WITH p AS (
        SELECT track_id, ts, latitude, longitude, range_km, speed,
               lag(ts)        OVER w AS prev_ts,
               lag(latitude)  OVER w AS prev_lat,
               lag(longitude) OVER w AS prev_lon
        FROM track_points
        WHERE ts >= :from AND ts <= :to ${trackId ? "AND track_id = :trackId" : ""}
          AND track_id !~ :zeroRe
        WINDOW w AS (PARTITION BY track_id ORDER BY ts)
     ), s AS (
        SELECT *,
               CASE WHEN prev_ts IS NULL OR ts - prev_ts > make_interval(secs => :gap) THEN 1 ELSE 0 END AS new_s
        FROM p
     ), s2 AS (
        SELECT *,
               SUM(new_s) OVER (PARTITION BY track_id ORDER BY ts) AS session,
               CASE WHEN new_s = 1 THEN 0 ELSE
                 2 * 6371000 * asin(sqrt(
                   power(sin(radians(latitude - prev_lat) / 2), 2) +
                   cos(radians(prev_lat)) * cos(radians(latitude)) * power(sin(radians(longitude - prev_lon) / 2), 2)))
               END AS step_m
        FROM s
     ), t AS (
        SELECT track_id, session,
               MIN(ts) AS first_seen, MAX(ts) AS last_seen, COUNT(*) AS points,
               (array_agg(latitude  ORDER BY ts ASC))[1]  AS start_lat,
               (array_agg(longitude ORDER BY ts ASC))[1]  AS start_lon,
               (array_agg(latitude  ORDER BY ts DESC))[1] AS end_lat,
               (array_agg(longitude ORDER BY ts DESC))[1] AS end_lon,
               SUM(step_m) AS distance_m,
               MAX(speed) AS max_speed, AVG(speed) AS avg_speed,
               MIN(range_km) AS min_range_km, MAX(range_km) AS max_range_km
        FROM s2
        GROUP BY track_id, session
     )
     SELECT t.track_id, t.first_seen, t.last_seen,
            EXTRACT(EPOCH FROM (t.last_seen - t.first_seen))::float AS duration_s,
            t.points::int AS points, t.start_lat, t.start_lon, t.end_lat, t.end_lon,
            ROUND(t.distance_m::numeric, 1)::float AS distance_m,
            t.max_speed, t.avg_speed, t.min_range_km, t.max_range_km,
            (t.last_seen > now() - interval '15 seconds') AS active
     FROM t
     ORDER BY t.first_seen DESC
     LIMIT :lim`,
    { from, to, trackId: trackId ? String(trackId) : null, gap: GAP_SECONDS, lim, zeroRe: ZERO_ID_SQL_REGEX }, true));
}

function points({ trackId, from, to }) {
  return ensureTable().then(() => q(
    `SELECT ts, latitude, longitude, range_km, azimuth, speed, heading, source
     FROM track_points
     WHERE track_id = :trackId AND track_id !~ :zeroRe AND ts >= :from AND ts <= :to
     ORDER BY ts ASC
     LIMIT 20000`,
    { trackId: String(trackId), from, to, zeroRe: ZERO_ID_SQL_REGEX }, true));
}

function purgeOld(days) {
  const d = Math.max(1, parseInt(days, 10) || 90);
  return ensureTable()
    .then(() => q(`DELETE FROM track_points WHERE ts < now() - make_interval(days => :d)`, { d }))
    .catch((err) => console.log("Track history: purge failed -", err.message));
}

let purgeTimer = null;
function startRetention() {
  if (purgeTimer) return;
  const days = process.env.TRACK_RETENTION_DAYS || 90;
  setTimeout(() => purgeOld(days), 60 * 1000);
  purgeTimer = setInterval(() => purgeOld(days), 24 * 3600 * 1000);
  if (purgeTimer.unref) purgeTimer.unref();
}

// Seconds since this track id was last seen, ignoring the last `skipSeconds` (the point being saved right now).
// null = never seen before (or the database is not reachable).
function secondsSinceLastSeen(trackId, skipSeconds = 2) {
  if (!isValidTrackId(trackId)) return Promise.resolve(null);
  return ensureTable()
    .then(() => q(
      `SELECT EXTRACT(EPOCH FROM (now() - max(ts)))::float AS s
       FROM track_points WHERE track_id = :id AND ts < now() - make_interval(secs => :skip)`,
      { id: String(trackId), skip: skipSeconds }, true))
    .then((r) => (r && r[0] && r[0].s !== null && r[0].s !== undefined ? Number(r[0].s) : null))
    .catch(() => null);
}

module.exports = { ensureTable, savePoint, summary, points, purgeOld, startRetention, secondsSinceLastSeen, GAP_SECONDS };
