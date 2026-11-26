// Alarm action log for the Track History dashboard ("Alarm Log" button):
// for every alarm with activity in the time range -> when it was raised, acknowledged and cleared (cancelled).
// Read only. Times come from the alarm_events table that Acknowledge / Clear already write (event_type 1 / 2).
const db = require("./db");
const { str } = require("../utils/sqlSafe");
const { ZERO_ID_SQL_REGEX } = require("../utils/trackId");

exports.actionLog = async (req, res) => {
  const to = req.query.to ? new Date(String(req.query.to)) : new Date();
  const from = req.query.from ? new Date(String(req.query.from)) : new Date(to.getTime() - 7 * 864e5);
  if (isNaN(from.getTime()) || isNaN(to.getTime()) || from > to) {
    return res.status(400).send({ error: true, message: "from / to must be valid times, from before to", statusCode: 400 });
  }
  const query = `
    SELECT a.alarm_id, a.id AS alarm_no, a.event_id AS track_id, a.zone_id,
           -- times as epoch milliseconds: the columns hold UTC times without a time zone, and returning them as
           -- dates made them read as local time (5h30 early in India). EXTRACT(EPOCH) reads them as UTC.
           (EXTRACT(EPOCH FROM a.alarmmsg_time) * 1000)::float8 AS alarmmsg_ms,
           (EXTRACT(EPOCH FROM MIN(ae.timeofevent) FILTER (WHERE ae.event_type = 0)) * 1000)::float8 AS raised_ms,
           (EXTRACT(EPOCH FROM MIN(ae.timeofevent) FILTER (WHERE ae.event_type = 1)) * 1000)::float8 AS acknowledged_ms,
           (EXTRACT(EPOCH FROM MIN(ae.timeofevent) FILTER (WHERE ae.event_type = 2)) * 1000)::float8 AS cleared_ms,
           (EXTRACT(EPOCH FROM MAX(ae.timeofevent)) * 1000)::float8 AS last_event_ms
    FROM alarms a
    JOIN alarm_events ae ON ae.alarm_id = a.alarm_id
    WHERE a.alarm_id IN (
            SELECT DISTINCT alarm_id FROM alarm_events
            WHERE timeofevent >= ${str(from.toISOString())}::timestamptz AND timeofevent <= ${str(to.toISOString())}::timestamptz)
      AND COALESCE(a.alarm_id::text, '') !~ ${str(ZERO_ID_SQL_REGEX)}
    GROUP BY a.alarm_id, a.id, a.event_id, a.zone_id, a.alarmmsg_time
    ORDER BY MAX(ae.timeofevent) DESC
    LIMIT 2000`;
  try {
    const rows = await db.selectWithQuery(query);
    // the DB helper returns the error (it does not throw) when the query fails or the database is down
    if (rows !== undefined && rows !== null && !Array.isArray(rows)) throw new Error((rows && rows.message) || String(rows));
    res.status(200).send({ error: false, from: from.toISOString(), to: to.toISOString(), data: rows || [], statusCode: 200 });
  } catch (err) {
    console.error("[alarm action log]", err && err.message);
    res.status(500).send({ error: true, message: (err && err.message) || "Could not read the alarm log", statusCode: 500 });
  }
};
