const turf = require("@turf/turf");
const { str, num, ident, numList } = require("../utils/sqlSafe"); // SQL-injection safe values
const request = require("request");
const env = require("../config/env");
const db = require("../controllers/db");
const log = require("./../utils/log");
const response = require("../controllers/response");
const mapsContr = require("./map");
const { isValidTrackId, ZERO_ID_SQL_REGEX, logSkipped } = require("../utils/trackId");
const trackStore = require("../service/trackStore");
let isAutoManualMode = "";
const alarms_queue = [];

// Retrieve all data from the database.
exports.alarmInfo = async (req, res, next) => {
  try {
    console.log("alarm info")
    const customQuery = `
        SELECT alarms.*, alarm_events.*, alarm_tail.uid, alarm_tail.tail, alarm_tail.track_length, alarm_tail.status
        FROM alarms
        JOIN (SELECT DISTINCT ON (alarm_id) * FROM alarm_events ORDER BY alarm_id, timeofevent DESC) alarm_events 
        ON alarm_events.alarm_id = alarms.alarm_id and alarm_events.event_type != 2
        LEFT JOIN (SELECT DISTINCT ON (alarm_id) * FROM alarm_tail) alarm_tail 
        ON alarm_tail.alarm_id = alarms.alarm_id and alarm_tail.status = true
        WHERE COALESCE(alarms.alarm_id::text, '') !~ ${str(ZERO_ID_SQL_REGEX)}
        `;
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Alarm Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Alarm Info Success",
          });
          res
            .status(200)
            .send({ error: false, data: results, statusCode: 200 });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Alarm Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Alarm Info Success",
          });
          res
            .status(200)
            .send({ error: false, data: results, statusCode: 200 });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Alarm Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message,
        });
        res
          .status(400)
          .send({ error: true, message: error.message, statusCode: 400 });
      }
    );
  } catch (err) {
    console.log(err);
    res.errorCode = 500;
    res.errorInfo = {
      error: true,
      status: "failed",
      message: err.message || "Error occurred.. Please try later.",
    };
    log.createLog({
      type: "error",
      root_module: "MCCS",
      sub_module: "Alarm Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "Alarm Info Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Retrieve all data from the database.
exports.alarmTailInfo = async (req, res, next) => {
  try {
    const customQuery = `
        SELECT alarms.*, alarm_tail.*
        FROM alarms
        JOIN (
            SELECT DISTINCT ON (alarm_id) *
            FROM alarm_tail
        ) alarm_tail ON alarm_tail.alarm_id = alarms.alarm_id
        `;
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Alarm Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Alarm Tail Info Success",
          });
          res
            .status(200)
            .send({ error: false, data: results, statusCode: 200 });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Alarm Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Alarm Tail Info Success",
          });
          res
            .status(200)
            .send({ error: false, data: results, statusCode: 200 });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Alarm Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message,
        });
        res
          .status(400)
          .send({ error: true, message: error.message, statusCode: 400 });
      }
    );
  } catch (err) {
    console.log(err);
    res.errorCode = 500;
    res.errorInfo = {
      error: true,
      status: "failed",
      message: err.message || "Error occurred.. Please try later.",
    };
    log.createLog({
      type: "error",
      root_module: "MCCS",
      sub_module: "Alarm Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "Alarm Tail Info Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};
/** Alarm Acknowledge  */
exports.acknowledgeClearAlarm = async (req, res, next) => {
  if (
    !req.body.clear_all &&
    (!req.body.alarm_id ||
      req.body.acknowledged_cleared === null ||
      req.body.acknowledged_cleared === undefined)
  ) {
    // Handling Logs
    res.errorCode = 400;
    res.errorInfo = {
      error: true,
      status: "failed",
      message: "Please provide valid input",
    };
    next(res);
    return;
  }

  try {
    if (req.body.clear_all && req.body.cleared_alarms.length > 0) {
      let values = req.body.cleared_alarms
        .map((item, key) => {
          return {
            alarm_id: item.alarm_id,
            event_type: 2,
            timeofevent: new Date().toISOString(),
            location:
              "SRID=4326;POINT(" +
              item.location.coordinates[0] +
              " " +
              item.location.coordinates[1] +
              ")",
          };
        })
        .map((item) =>
          Object.keys(item).map((key) => {
            return item[key] == null || item[key] == ""
              ? "null"
              : `${str(item[key])}`;
          })
        )
        .map((_) => `(${_})`)
        .join(",");

      let alarm_ids = req.body.cleared_alarms
        .map((item, key) => {
          return {
            alarm_id: item.alarm_id,
          };
        })
        .map((item) =>
          Object.keys(item).map((key) => {
            return item[key] == null || item[key] == ""
              ? "null"
              : `${str(item[key])}`;
          })
        );

      const customQuery = `insert into alarm_events(alarm_id, event_type, timeofevent, location) values ${values}`;
      db.createWithQuery(customQuery).then(
        (results) => {
          if (results && results.length) {
            mapsContr.clearAllEarlyWarnings();
            const alarm_tail_query = `update alarm_tail set status = false where alarm_id in (${alarm_ids})`;
            db.updateWithQuery(alarm_tail_query).then((result) => { });
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Alarm Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "Alarm Acknowledge Success",
            });
            res
              .status(200)
              .send({ error: false, data: results, statusCode: 200 });
          } else {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Alarm Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "Alarm Acknowledge Success",
            });
            res
              .status(204)
              .send({ error: false, data: results, statusCode: 204 });
          }
        },
        (error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "Alarm Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message,
          });
          res
            .status(400)
            .send({ error: true, message: error.message, statusCode: 400 });
        }
      );
    } else {
      // const customQuery = "update alarm_events set event_type=" + req.body.acknowledged_cleared + ", timeofevent=now() where alarm_id='" + req.body.alarm_id + "'";
      const customQuery = `insert into alarm_events(alarm_id, event_type, timeofevent, location) values(${str(req.body.alarm_id)}, ${num(req.body.acknowledged_cleared)}, now(), ST_GeomFromText('POINT(${num(req.body.location.coordinates[0])} ${num(req.body.location.coordinates[1])})', 4326))`;
      await db.createWithQuery(customQuery).then(
        (results) => {
          if (results && results.length) {
            if (req.body.acknowledged_cleared === 2) {
              mapsContr.clearEarlyWarning(req.body.alarm_id);
            }
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Alarm Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "Alarm Acknowledge Succcess",
            });
            res
              .status(200)
              .send({ error: false, data: results, statusCode: 200 });
          } else {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Alarm Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "Alarm Acknowledge Succcess",
            });
            res
              .status(204)
              .send({ error: false, data: results, statusCode: 204 });
          }
        },
        (error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "Alarm Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message,
          });
          res
            .status(400)
            .send({ error: true, message: error.message, statusCode: 400 });
        }
      );
    }
  } catch (err) {
    // Handling Logs
    res.errorCode = 500;
    res.errorInfo = {
      error: true,
      status: "failed",
      message: err.message || "Error occurred.. Please try later.",
    };
    log.createLog({
      type: "error",
      root_module: "MCCS",
      sub_module: "Alarm Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "Alarm Acknowledge Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

/** Clear Intrusion Tracks  */
exports.clearIntrusionTracks = async (req, res, next) => {
  try {
    if (req.body.intrusion_tracks.length > 0) {
      let alarm_ids = req.body.intrusion_tracks.map((item, key) => {
        return {
          alarm_id: item.alarm_id,
          track_length: (item.track_length > 0) ? item.track_length : 0
        }
      })
        .map(item => Object.keys(item).map(key => { return (typeof item[key] == "number") ? item[key] : (item[key] == null || item[key] == '') ? 'null' : `${str(item[key])}` }))
        .map((_) => `(${_})`).join(","); // alarm_ids (12345,10),(13456,8),(1234567,13)

      const customQuery = `update alarm_tail at set track_length=tmp.track_length 
                                 from (values ${alarm_ids}) as tmp (alarm_id,track_length) 
                                 where at.alarm_id = cast(tmp.alarm_id as varchar)`;
      db.createWithQuery(customQuery).then(
        (results) => {
          if (results && results.length) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Alarm Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "Clear IntrusionTracks Succcess",
            });
            res
              .status(200)
              .send({ error: false, data: results, statusCode: 200 });
          } else {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Alarm Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "Clear IntrusionTracks Succcess",
            });
            res
              .status(200)
              .send({ error: false, data: results, statusCode: 200 });
          }
        },
        (error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "Alarm Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message,
          });
          res
            .status(400)
            .send({ error: true, message: error.message, statusCode: 400 });
        }
      );
    } else {
      log.createLog({
        type: "error",
        root_module: "MCCS",
        sub_module: "Alarm Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: "Tracks info required",
      });
      res
        .status(400)
        .send({
          error: true,
          message: "Tracks info required",
          statusCode: 400,
        });
    }
  } catch (err) {
    // Handling Logs
    res.errorCode = 500;
    res.errorInfo = {
      error: true,
      status: "failed",
      message: err.message || "Error occurred.. Please try later.",
    };
    log.createLog({
      type: "error",
      root_module: "MCCS",
      sub_module: "Alarm Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: "Clear IntrusionTracks Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

exports.createUpdateAlarm = async (req, res, next) => {
  try {
    this.createUpdateAlarms(req, res, next);
  } catch (err) {
    // Handling Logs
    res.errorCode = 500;
    res.errorInfo = {
      error: true,
      status: "failed",
      message: err.message || "Error occurred.. Please try later.",
    };
    log.createLog({
      type: "error",
      root_module: "MCCS",
      sub_module: "Alarm Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "Create UpdateAlarm Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Retrieve all alarm events the database.
exports.getAlarmTimelineEvents = async (req, res, next) => {
  try {
    let customQuery = `SELECT a.alarm_id, a.id, a.alarmmsg_time, a.alarm_type, a.event_id, a.camera_id,
                        a.location, a.sensors_triggered, a.object_identified, a.zone_id, a.alarm_priority,
                        ae.event_type, ae.timeofevent, ae.location as event_location
                        FROM alarms a INNER JOIN alarm_events ae ON a.alarm_id = ae.alarm_id 
                        group by a.alarm_id, ae.alarm_id, ae.event_type, ae.timeofevent, ae.location`;

    if (req.query.filterName === "filter") {
      const filterDate = {
        alarmId: req.query.alarm_id,
        zoneId: req.query.zone_id,
        startDate: req.query.startDate ? req.query.startDate : "",
        endDate: req.query.endDate ? req.query.endDate : ""
      };
      if (filterDate.zoneId && !filterDate.alarmId) {
        customQuery = `SELECT a.alarm_id, a.id, a.alarmmsg_time, a.alarm_type, a.event_id, a.camera_id,
                            a.location, a.sensors_triggered, a.object_identified, a.zone_id, a.alarm_priority,
                            ae.event_type, ae.timeofevent, ae.location as event_location
                            FROM alarms a INNER JOIN alarm_events ae ON a.alarm_id = ae.alarm_id 
                            WHERE a.zone_id = ${str(filterDate.zoneId)}
                            group by a.alarm_id, ae.alarm_id, ae.event_type, ae.timeofevent, ae.location`;

        if (filterDate.startDate && filterDate.endDate) {
          customQuery = `SELECT a.alarm_id, a.id, a.alarmmsg_time, a.alarm_type, a.event_id, a.camera_id,
                                a.location, a.sensors_triggered, a.object_identified, a.zone_id, a.alarm_priority,
                                ae.event_type, ae.timeofevent, ae.location as event_location
                                FROM alarms a INNER JOIN alarm_events ae ON a.alarm_id = ae.alarm_id 
                                WHERE a.zone_id = ${str(filterDate.zoneId)} and 
                                (cast(a.alarmmsg_time as date) BETWEEN ${str(req.query.startDate)} AND ${str(req.query.endDate)})
                                group by a.alarm_id, ae.alarm_id, ae.event_type, ae.timeofevent, ae.location`;
        }
      } else if (!filterDate.zoneId && !filterDate.alarmId) {
        customQuery = `SELECT a.alarm_id, a.id, a.alarmmsg_time, a.alarm_type, a.event_id, a.camera_id,
                            a.location, a.sensors_triggered, a.object_identified, a.zone_id, a.alarm_priority,
                            ae.event_type, ae.timeofevent, ae.location as event_location
                            FROM alarms a INNER JOIN alarm_events ae ON a.alarm_id = ae.alarm_id 
                            group by a.alarm_id, ae.alarm_id, ae.event_type, ae.timeofevent, ae.location`;

        if (filterDate.startDate && filterDate.endDate) {
          customQuery = `SELECT a.alarm_id, a.id, a.alarmmsg_time, a.alarm_type, a.event_id, a.camera_id,
                                a.location, a.sensors_triggered, a.object_identified, a.zone_id, a.alarm_priority,
                                ae.event_type, ae.timeofevent, ae.location as event_location
                                FROM alarms a INNER JOIN alarm_events ae ON a.alarm_id = ae.alarm_id 
                                WHERE (cast(a.alarmmsg_time as date) BETWEEN ${str(req.query.startDate)} AND ${str(req.query.endDate)})
                                group by a.alarm_id, ae.alarm_id, ae.event_type, ae.timeofevent, ae.location`;
        }
      } else if (
        (!filterDate.zoneId && filterDate.alarmId) ||
        (filterDate.zoneId && filterDate.alarmId)
      ) {
        customQuery = `SELECT a.alarm_id, a.id, a.alarmmsg_time, a.alarm_type, a.event_id, a.camera_id,
                            a.location, a.sensors_triggered, a.object_identified, a.zone_id, a.alarm_priority,
                            ae.event_type, ae.timeofevent, ae.location as event_location
                            FROM alarms a INNER JOIN alarm_events ae ON a.alarm_id = ae.alarm_id 
                            WHERE a.alarm_id = ${str(filterDate.alarmId)}
                            group by a.alarm_id, ae.alarm_id, ae.event_type, ae.timeofevent, ae.location`;
        if (filterDate.startDate && filterDate.endDate) {
          customQuery = `SELECT a.alarm_id, a.id, a.alarmmsg_time, a.alarm_type, a.event_id, a.camera_id,
                                a.location, a.sensors_triggered, a.object_identified, a.zone_id, a.alarm_priority,
                                ae.event_type, ae.timeofevent, ae.location as event_location
                                FROM alarms a INNER JOIN alarm_events ae ON a.alarm_id = ae.alarm_id 
                                WHERE a.alarm_id = ${str(filterDate.alarmId)} 
                                and (cast(a.alarmmsg_time as date) BETWEEN ${str(req.query.startDate)} AND ${str(req.query.endDate)})
                                group by a.alarm_id, ae.alarm_id, ae.event_type, ae.timeofevent, ae.location`;
        }
      }
    }
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Alarm Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetAlarmTimelineEvents Success",
          });
          res
            .status(200)
            .send({ error: false, data: results, statusCode: 200 });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Alarm Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetAlarmTimelineEvents Success",
          });
          res
            .status(204)
            .send({ error: false, data: results, statusCode: 204 });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Alarm Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message,
        });
        res
          .status(400)
          .send({ error: true, message: error.message, statusCode: 400 });
      }
    );
  } catch (err) {
    res.errorCode = 500;
    res.errorInfo = {
      error: true,
      status: "failed",
      message: err.message || "Error occurred.. Please try later.",
    };
    log.createLog({
      type: "error",
      root_module: "MCCS",
      sub_module: "Alarm Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "GetAlarmTimelineEvents Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

exports.updateModeStatus = (req, res, next) => {
  isAutoManualMode = req.body.mode;
  log.createLog({
    type: "info",
    root_module: "MCCS",
    sub_module: "Alarm Service",
    method: new Error().stack.split("\n")[1].trim(),
    log_message: "UpdateModeStatus Success",
  });
  res.send({ error: false, message: "Successfully updated" });
};

exports.getModeStatus = (req, res, next) => {
  log.createLog({
    type: "info",
    root_module: "MCCS",
    sub_module: "Alarm Service",
    method: new Error().stack.split("\n")[1].trim(),
    log_message: "GetModeStatus Success",
  });
  res.send({ mode: isAutoManualMode });
};

exports.findDistanceInIFF = (req, res, next) => {
  const data = [
    {
      alarmLatLong: [
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 4],
      ],
      iff: [
        {
          latLong: [1, 2],
        },
      ],
    },
    {
      alarmLatLong: [
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 4],
      ],
      iff: [
        {
          latLong: [2, 2],
        },
      ],
    },
  ];

  // Find Distance
  const output = [];
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data.length; j++) {
      const line = turf.lineString(data[j].alarmLatLong);
      const point = turf.point(data[i].iff[0].latLong);

      if (turf.booleanWithin(point, line)) {
        if (
          turf.pointToLineDistance(point, line, { units: "miles" }) <=
          env.iffThreshold
        ) {
          output.push(data[i]);
        }
      }
    }
  }
  log.createLog({
    type: "info",
    root_module: "MCCS",
    sub_module: "Alarm Service",
    method: new Error().stack.split("\n")[1].trim(),
    log_message: "FindDistanceInIFF Success",
  });
  res.send({ error: false, status: true, data: output });
};

exports.findWithinThreshold = (req, res, next) => {
  const point1 = [76.53959529789988, 14.390935849079591];
  const point2 = [76.53645158861788, 14.387097877362908];
  isWithinThreshold(point1, point2);
  res.send({ error: false, status: true, statusCode: 200 });
};

function isWithinThreshold(point1, point2) {
  var from = turf.point(point1);
  var to = turf.point(point2);

  let isWithin = false;
  var options = { units: "kilometers" };
  var km_distance = turf.distance(from, to, options);
  var distance = km_distance * 1000;

  if (distance <= env.iffThreshold) {
    isWithin = true;
  }

  return isWithin;
}

exports.createUpdateAlarms = (req, res, next) => {
  try {
    res.status(200).send("received");
    log.createLog({
      type: "info",
      root_module: "MCCS",
      sub_module: "Alarm Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: "Create UpdateAlarms Received",
    });
    let alarmInfo = req.body;
    // Track ID 0 / empty: never create or update an alarm for it
    if (!alarmInfo || !isValidTrackId(alarmInfo.alarm_id)) {
      logSkipped("alarm create-update", alarmInfo ? alarmInfo.alarm_id : undefined);
      return;
    }
    alarmInfo.sensors_triggered = "Radar"
    alarmInfo.iff_data = (alarmInfo.iff_data == null || alarmInfo.iff_data == undefined) ? {} : alarmInfo.iff_data;

    console.log("----alarmInfo----", alarmInfo);

//    let customQuery = `select * from alarms where alarm_id = ${str(alarmInfo.alarm_id)}`;

    let customQuery = `
      SELECT a.*, ae.event_type 
      FROM alarms a 
      LEFT JOIN (
        SELECT DISTINCT ON (alarm_id) alarm_id, event_type, timeofevent 
        FROM alarm_events 
        ORDER BY alarm_id, timeofevent DESC
      ) ae ON a.alarm_id = ae.alarm_id 
      WHERE a.alarm_id = ${str(alarmInfo.alarm_id)}
    `;
    db.selectWithQuery(customQuery).then(
      (results) => {
        console.log(results);
        if (results && results.length == 0) {
          // means primary or early warning
          findZone(alarmInfo);//***inserting alarm
        } else {
          // Same track id already has an alarm. If this is a NEW target re-using the id (old alarm cleared,
          // or id not seen for a while) keep the old alarm under "<id>@<its start time>" and create a new one.
          newOccurrence(alarmInfo, results[0]).then((archivedId) => {
            if (archivedId) {
              findZone(alarmInfo); // new alarm for the new target
              return;
            }
            updateExistingAlarm(alarmInfo, results);
          });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Alarm Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error,
        });
        console.log(error);
      }
    );
  } catch (err) {
    log.createLog({
      type: "error",
      root_module: "MCCS",
      sub_module: "Alarm Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err,
    });
    console.log(err);
  }
};



// Existing alarm of the same target: update it (previous behaviour)
function updateExistingAlarm(alarmInfo, results) {
      if (results[0] && results[0].alarmmsg_time) alarmInfo.alarmmsg_time = results[0].alarmmsg_time; // card shows its start time
      if (alarmInfo.alarm_type != 2) {
        alarmInfo.iff_data = (alarmInfo.iff_data == null || alarmInfo.iff_data == undefined) ? {} : alarmInfo.iff_data;
        let query = `UPDATE alarms SET record_flag=${num(alarmInfo.record_flag)},alarm_type=${num(alarmInfo.alarm_type)} WHERE alarm_id=${str(alarmInfo.alarm_id)}`;
        db.updateWithQuery(query).then(
          (update_response) => {
            if (results[0].alarm_type != alarmInfo.alarm_type || results[0].event_type == 2 || results[0].event_type == null) {
              alarmInfo.id = results[0].id; // pushing id of alarm into alarmInfo
              // means confirmatory or reactivating cleared alarm
              updateAlarmEvents(alarmInfo, results[0].zone_id);
            }
            if (alarmInfo.alarm_type == 1 && alarmInfo.record_flag == 1) {
              // means primary or confirmatory with record flag change
              // table_ext _alarm insert query has to be here
              let tbl_ext_alarm_create = `INSERT INTO tbl_external_alarm(start_time, end_time, clip_status, ftp_server_ip, ftp_filename) 
              VALUES(${new Date(results[0].alarmmsg_time).getTime()}, ${new Date().getTime()}, 'AVAILABLE', '195.67.15.3', ${str(env.videos_url + alarmInfo.alarm_id + "_raw.mp4")})`;
              // console.log("---tbl_ext_alarm---", tbl_ext_alarm_create);
              db.createWithQuery(tbl_ext_alarm_create).then((data) => {
                console.log(data);
              });
            }
          },
          (err) => {
            console.log("error ", err);
            log.createLog({
              type: "error",
              root_module: "MCCS",
              sub_module: "Alarm Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: err || "Create UpdateAlarms Error",
            });
          }
        );
        //there is no else added for new alarm after clear all on map
      } else {
        // For early warning (alarm_type === 2), reactivate if cleared or if type changed
        if (results[0].alarm_type != alarmInfo.alarm_type || results[0].event_type == 2 || results[0].event_type == null) {
          alarmInfo.id = results[0].id;
          updateAlarmEvents(alarmInfo, results[0].zone_id);
        }
      }
}

// ---- One alarm per target, even when the radar re-uses a track id ----
// Returns the key the previous alarm was stored under (e.g. "12@20261110-062711"), or null = same target.
async function newOccurrence(alarmInfo, prev) {
  try {
    let reason = null;
    if (prev && prev.event_type == 2) reason = "its previous alarm was cleared";
    else if (alarmInfo.new_session) reason = `it was not seen for more than ${trackStore.GAP_SECONDS} s`;
    else {
      const s = await trackStore.secondsSinceLastSeen(alarmInfo.alarm_id);
      if (s !== null && s > trackStore.GAP_SECONDS) reason = `it was not seen for ${Math.round(s)} s`;
    }
    if (!reason) return null;
    const archivedId = await archiveAlarm(String(alarmInfo.alarm_id));
    if (archivedId) {
      console.log(`[alarm] track ${alarmInfo.alarm_id} again (${reason}): previous alarm kept as "${archivedId}", new alarm created`);
      sendArchivedToUI(String(alarmInfo.alarm_id), archivedId);
    }
    return archivedId;
  } catch (err) {
    console.log(`[alarm] could not keep the previous alarm of track ${alarmInfo.alarm_id} - updating it instead:`, err.message);
    return null;
  }
}

// Move alarm "<id>" (and its events, trail, videos, responses) to "<id>@<start time>", in one transaction.
async function archiveAlarm(alarmId) {
  const sequelize = require("../models").sequelize; // lazy: models/index.js requires this file's dependencies
  return sequelize.transaction(async (t) => {
    const o = (replacements) => ({ replacements, transaction: t, type: sequelize.QueryTypes.SELECT });
    const rows = await sequelize.query(
      `SELECT to_char(alarmmsg_time, 'YYYYMMDD-HH24MISS') AS st FROM alarms WHERE alarm_id = :id FOR UPDATE`, o({ id: alarmId }));
    if (!rows.length) return null;
    let key = `${alarmId}@${rows[0].st || "unknown"}`;
    const same = await sequelize.query(`SELECT count(*)::int AS n FROM alarms WHERE alarm_id = :k OR alarm_id LIKE :k2`, o({ k: key, k2: key + "-%" }));
    if (same[0].n > 0) key = `${key}-${same[0].n + 1}`; // two targets with this id starting in the same second
    const cols = await sequelize.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'alarms' AND column_name <> 'alarm_id' ORDER BY ordinal_position`, o({}));
    const list = cols.map((c) => '"' + c.column_name + '"').join(", ");
    await sequelize.query(`INSERT INTO alarms (alarm_id, ${list}) SELECT :key, ${list} FROM alarms WHERE alarm_id = :id`,
      { replacements: { key, id: alarmId }, transaction: t });
    // every table pointing at alarms.alarm_id (foreign keys) + the known alarm tables
    const fks = await sequelize.query(
      `SELECT c.conrelid::regclass::text AS tbl, a.attname AS col
       FROM pg_constraint c JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
       WHERE c.contype = 'f' AND c.confrelid = 'public.alarms'::regclass`, o({}));
    const targets = {};
    fks.forEach((f) => { targets[f.tbl + "|" + f.col] = f; });
    for (const tbl of ["alarm_events", "alarm_tail", "alarm_videos", "alarm_response"]) {
      const ex = await sequelize.query(`SELECT to_regclass(:t) IS NOT NULL AS ok`, o({ t: "public." + tbl }));
      if (ex[0].ok && !Object.keys(targets).some((k) => k.split("|")[0].replace(/^public\./, "") === tbl)) {
        targets[tbl + "|alarm_id"] = { tbl, col: "alarm_id" };
      }
    }
    for (const k of Object.keys(targets)) {
      const f = targets[k];
      await sequelize.query(`UPDATE ${f.tbl} SET "${f.col}" = :key WHERE "${f.col}" = :id`,
        { replacements: { key, id: alarmId }, transaction: t });
    }
    await sequelize.query(`DELETE FROM alarms WHERE alarm_id = :id`, { replacements: { id: alarmId }, transaction: t });
    return key;
  });
}

// Tell the UI: the alarm card "<oldId>" now belongs to "<archivedId>" (the old target)
function sendArchivedToUI(oldId, archivedId) {
  request({ uri: env.base_url + "/communication/to-ui", body: { category: "alarm_archived", old_id: oldId, archived_id: archivedId }, json: true },
    (err) => { if (err) console.log("alarm_archived to UI:", err.code || err); });
}

function findZone(alarmInfo){
          console.log()
          let customQuery = `select * from zone order by zone_id desc`;
          db.selectWithQuery(customQuery).then(
            (res) => {
              if (res && res.length) {
                isAlarmExistsInZone = findAlarmZone({
                  zonesLocation: res,
                  givenParam: alarmInfo,
                });
                let insertUpdateData = `INSERT INTO ALARMS(alarm_id, alarmmsg_time, alarm_type, event_id, camera_id, location, sensors_triggered, object_identified, pole_number, record_flag)
                            VALUES(${str(alarmInfo.alarm_id)}, now(), ${num(alarmInfo.alarm_type)}, ${str(alarmInfo.event_id)}, ${str(alarmInfo.camera_id)},
                                ST_GeomFromText('POINT(${num(alarmInfo.location[0])} ${num(alarmInfo.location[1])})', 4326), ARRAY[${str(alarmInfo.sensors_triggered)}], 'person', '15', 'false') RETURNING id, alarmmsg_time`;
                if (isAlarmExistsInZone) {
                  insertUpdateData = `INSERT INTO ALARMS(alarm_id, alarmmsg_time, alarm_type, event_id, camera_id, location, sensors_triggered, object_identified, pole_number, record_flag, zone_id)
                            VALUES(${str(alarmInfo.alarm_id)}, now(), ${num(alarmInfo.alarm_type)}, ${str(alarmInfo.event_id)}, ${str(alarmInfo.camera_id)},
                                ST_GeomFromText('POINT(${num(alarmInfo.location[0])} ${num(alarmInfo.location[1])})', 4326), ARRAY[${str(alarmInfo.sensors_triggered)}], 'person', '15', 'false', ${str(isAlarmExistsInZone.zone_id)}) RETURNING id, alarmmsg_time`;
                }
                db.createWithQuery(insertUpdateData).then((alarm_data) => {
                  alarmInfo.id = alarm_data[0][0].id;
                  alarmInfo.alarmmsg_time = alarm_data[0][0].alarmmsg_time; // start time: tells apart alarms with the same track id
                  //if (alarmInfo.alarm_type == 2) {  // *** check as alarms are !2
                    let alarmEventInsert = `INSERT INTO ALARM_EVENTS(alarm_id, event_type, timeofevent,location) values(${str(alarmInfo.alarm_id)}, 0,now(),ST_GeomFromText('POINT(${num(alarmInfo.location[0])} ${num(alarmInfo.location[1])})', 4326))`;
                    db.createWithQuery(alarmEventInsert).then((data) => {
                      console.log(data);
                    });
                    alarmInfo.event_type = 0;
                    if (isAlarmExistsInZone){
                       alarmInfo.zone_id = isAlarmExistsInZone.zone_id;
                    }
                    console.log("====before send to UI===", alarmInfo);
                    sendAlarmToUI(isAutoManualMode, alarmInfo);
                 // }
                });
              }
            },
            (error) => {
              log.createLog({
                type: "error",
                root_module: "MCCS",
                sub_module: "Alarm Service",
                method: new Error().stack.split("\n")[1].trim(),
                log_message: error,
              });
              console.log(error);
            }
          );
}

function updateAlarmEvents(alarmInfo, zoneId) {
  let alarmEventInsert = `INSERT INTO ALARM_EVENTS(alarm_id, event_type, timeofevent,location) values(${str(alarmInfo.alarm_id)}, 0,now(),ST_GeomFromText('POINT(${num(alarmInfo.location[0])} ${num(alarmInfo.location[1])})', 4326))`;
  db.createWithQuery(alarmEventInsert).then((data) => {
    let customQuery = `SELECT count(a.zone_id) FROM alarms a INNER JOIN alarm_events ae ON a.alarm_id = ae.alarm_id and 
        (ae.event_type = 0 or ae.event_type = 1) WHERE a.zone_id = ${str(zoneId)}`;
    db.selectWithQuery(customQuery).then((results) => {
      // console.log("count is ", results);
      if (results && results.length) {
        if (results && (1 < parseFloat(results[0].count) || parseFloat(results[0].count) > 1)) {
          isAutoManualMode = "manual";
        } else if (results && parseFloat(results[0].count) <= 1) {
          isAutoManualMode = "auto";
          // assignment request to UAV and UGV
          const data = {
            body: {
              alarm_id: results[0].alarm_id,
              zone_id: zoneId,
              type: "uav",
              mode: isAutoManualMode,
              id: results[0].alarm_id,
              alarm_data: {
                location: {
                  coordinates: [alarmInfo.location[1], alarmInfo.location[0]],
                },
              },
            },
          };
          response.assignToResponse(data, undefined, undefined);
        }
        alarmInfo.event_type = 0;
        alarmInfo.zone_id = zoneId;
        sendAlarmToUI(isAutoManualMode, alarmInfo);
      }
    });
  });
}

function sendAlarmToUI(mode, alarmInfo) {
  const options = {
    uri: env.base_url + "/communication/to-ui",
    body: {
      category: "alarm",
      mode: mode,
      alarmData: alarmInfo,
    },
    json: true,
  };
  // console.log(options);
  request(options, (err, res, body) => {
    if (err) {
      log.createLog({
        type: "error",
        root_module: "MCCS",
        sub_module: "Alarm Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: err,
      });
      console.log(err);
    }
  });
}

// Find One Zone Contain How Many Alarms
exports.findZonesAlarmLists = async (req, res, next) => {
  try {
    const query = "select * from alarms";
    await db.selectWithQuery(query).then(
      (results) => {
        const getZoneId = req.body.zone_id;
        const getResults = {};
        if (results && results.length) {
          const zoneIds = [];
          for (let l = 0; l < results.length; l++) {
            zoneIds.push(results[l].zone_id);
          }
          const filtered = zoneIds.filter(function (el) {
            return el != null;
          });
          const getDuplicateValues = filtered.filter(
            (e, i, a) => a.indexOf(e) !== i
          );

          for (let i = 0; i < results.length; i++) {
            if (
              getDuplicateValues.includes(results[i].zone_id) &&
              getZoneId === results[i].zone_id
            ) {
              if (getResults[results[i].zone_id]) {
                getResults[results[i].zone_id].alarmData.push(results[i]);
              } else {
                getResults[results[i].zone_id] = {
                  alarmData: [results[i]],
                  zoneData: results[i],
                };
              }
            }
          }

          const arrayOfZones = [];
          for (let j in getResults) {
            arrayOfZones.push(getResults[j]);
          }
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Alarm Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "FindZonesAlarmLists Success",
          });
          response.status(200).send({
            zone_lists: arrayOfZones,
          });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Alarm Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "FindZonesAlarmLists Success",
          });
          res.status(200).send({
            zone_lists: getResults,
          });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Alarm Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message,
        });
        res
          .status(400)
          .send({ error: true, message: error.message, statusCode: 400 });
      }
    );
  } catch (err) {
    // Handling Logs
    res.errorCode = 500;
    res.errorInfo = {
      error: true,
      status: "failed",
      message: err.message || "Error occurred.. Please try later.",
    };
    log.createLog({
      type: "error",
      root_module: "MCCS",
      sub_module: "Alarm Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "FindZonesAlarmLists Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Find Zone Id in Given Location
exports.findZoneInLocation = (param) => {
  findAlarmZone(param);
};

function findAlarmZone(param) {
  for (let i = 0; i < param.zonesLocation.length; i++) {
    const getZones = param.zonesLocation[i];
    getZones.geometry = {
      type: param.zonesLocation[i].zone_shape,
      coordinates: param.zonesLocation[i].zone_area.coordinates,
    };

    if (param.givenParam) {
      const pt = turf.point(param.givenParam.location);
      const poly = turf.polygon(param.zonesLocation[i].geometry.coordinates[0]);

      if (turf.booleanWithin(pt, poly)) {
        return param.zonesLocation[i];
      }
    }
  }
}

exports.setVideoEntryData = async (req, res, next) => {
  console.log('setVideoEntryData');

  req.body.ip = '10.66.40.61';

  processVideoEntryData(req.body);
  res.send("received");
};

function processVideoEntryData(data) {
  console.log('processVideoEntryData', data);

  let tbl_ext_alarm_create = `INSERT INTO tbl_external_alarm(start_time, end_time, clip_status, ftp_server_ip, ftp_filename, alarm_id) VALUES(${num(new Date(data.start_time).getTime())}, ${num(new Date().getTime())}, 'AVAILABLE', ${str(data.ip)}, ${str(env.videos_url + data.alarm_id + "_raw.mp4")}, ${str(data.alarm_id)})`;
  db.createWithQuery(tbl_ext_alarm_create).then((response) => {
    console.log(response);
  });
}

exports.saveAlarmVideoEntry = async (req, res, next) => {
  console.log('setAlarmVideoEntry');

  req.body.ip = '10.66.40.61';

  processAlarmVideoEntry(req.body);
  res.send("received");
};

function processAlarmVideoEntry(data) {
  console.log('processVideoEntryData', data);

  let values = data.map((item, key) => {
    return {
      alarm_id: item.alarm_id,
      camera_id: item.alarm_id,
      video_url: `/images/${item.alarm_id}`,
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      created_on: new Date().toISOString()
    };
  })
    .map((item) =>
      Object.keys(item).map((key) => {
        return item[key] == null || item[key] == ""
          ? "null"
          : `${str(item[key])}`;
      })
    )
    .map((_) => `(${_})`)
    .join(",");

  let alarm_videos_create = `INSERT INTO alarm_videos(alarm_id, camera_id, video_url, start_time, end_time, created_on) VALUES ${values}`;

  db.createWithQuery(alarm_videos_create).then((response) => {
    console.log(response);
  });
}

exports.saveAlarmTransactionEntry = async (req, res, next) => {
  console.log('saveAlarmTransactionEntry');

  req.body.ip = '10.66.40.61';

  processAlarmTransactionEntry(req.body);
  res.send("received");
};

function processAlarmTransactionEntry(data) {
  console.log('processAlarmTransactionEntry', data);

  var frames_data = [];
  while (frames_data.length < 30) {
    var rec = Math.floor(Math.random() * 100) + 1;
    if (frames_data.map(x => x.frameid).indexOf(rec) === -1) frames_data.push({ alarm_id: data.alarm_id, frameid: rec, obj_id: rec });
  }

  let values = frames_data.map((item, key) => {
    return {
      alarm_id: item.alarm_id,
      frameid: item.frameid,
      obj_id: item.obj_id,
      created_date: new Date().getTime(),
      is_deleted: false
    };
  })
    .map((item) =>
      Object.keys(item).map((key) => {
        return item[key] == null || item[key] == ""
          ? "null"
          : `${str(item[key])}`;
      })
    )
    .map((_) => `(${_})`)
    .join(",");

  let alarm_transaction_create = `INSERT INTO tbl_external_alarm_obj_transaction(alarm_id, frameid, obj_id, created_date, is_deleted) VALUES ${values}`;

  db.createWithQuery(alarm_transaction_create).then((response) => {
    console.log(response);
  });
}