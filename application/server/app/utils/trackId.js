// Track ID rule (used by Kafka, map, alarm and track history code):
// a track ID of 0 (also "0", "00", 0.0) or an empty ID is not a real target.
// Such tracks are never accepted, never shown in the UI and never written to the database.
function isValidTrackId(id) {
  if (id === undefined || id === null) return false;
  const s = String(id).trim();
  if (s === "" || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") return false;
  if (/^[+-]?\d+(\.\d+)?$/.test(s) && Number(s) === 0) return false;
  return true;
}

// For SQL: rows whose ID is zero or empty (same rule, used to hide old rows already in the DB)
const ZERO_ID_SQL_REGEX = "^\\s*([+-]?0+(\\.0+)?)?\\s*$";

let skipped = 0;
function logSkipped(where, id) {
  skipped++;
  if (skipped === 1 || skipped % 100 === 0) {
    console.log(`[track-id] ignored track with ID ${JSON.stringify(id)} (${where}) - ID 0 / empty is not accepted. Ignored so far: ${skipped}`);
  }
}

module.exports = { isValidTrackId, ZERO_ID_SQL_REGEX, logSkipped };
