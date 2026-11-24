// Track ID rule (same as server/app/utils/trackId.js):
// a track ID of 0 (also "0", "00", 0.0) or an empty ID is not a real target.
// Such tracks/alarms are never shown, never used for camera or drone commands.
export function isValidTrackId(id: any): boolean {
  if (id === undefined || id === null) return false;
  const s = String(id).trim();
  if (s === "" || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") return false;
  if (/^[+-]?\d+(\.\d+)?$/.test(s) && Number(s) === 0) return false;
  return true;
}

// The track / alarm ID carried by a WebSocket message, whatever its category (null if it has none)
export function pushTrackId(msg: any): any {
  if (!msg) return null;
  const g = msg.gJson && msg.gJson.properties;
  if (msg.category === "alarm") {
    if (msg.alarmData && msg.alarmData.alarm_id !== undefined) return msg.alarmData.alarm_id;
    return msg.alarm_id !== undefined ? msg.alarm_id : msg.id;
  }
  if (msg.category === "radar_tracks" || msg.category === "map") {
    if (g) return g.id !== undefined ? g.id : (g.alarm_id !== undefined ? g.alarm_id : g.track_id);
    return msg.id;
  }
  return null; // other categories (uav_status, drone_telemetry, ...) have no track ID
}

// true = drop this message (it is about track ID 0)
export function isZeroTrackPush(msg: any): boolean {
  if (!msg || ["alarm", "radar_tracks", "map"].indexOf(msg.category) < 0) return false;
  return !isValidTrackId(pushTrackId(msg));
}

// The radar track ID of an alarm (for camera / drone commands): event_id, else alarm_id without "@<time>".
// Returns null when there is no valid numeric track ID (incl. 0).
export function radarTrackIdOf(alarm: any): number {
  if (!alarm) return null;
  const raw = alarm.event_id !== undefined && alarm.event_id !== null && String(alarm.event_id).trim() !== "" ? alarm.event_id : alarm.alarm_id;
  const n = parseInt(String(raw).split("@")[0], 10);
  return !isNaN(n) && isValidTrackId(n) ? n : null;
}
