const env = require("../config/env");
const { str, num, ident, numList } = require("../utils/sqlSafe"); // SQL-injection safe values
const db = require("../controllers/db");
const map = require("../controllers/map");
const request = require("request");
const multer = require("multer");
const fs = require("fs");
const CustomGeoJson = require("geojson");
const turf = require("@turf/turf");
const path = require("path");
const tcp_connect = require("./../../tcp.client");
const tcp_socket_command = require("./../../tcp.send-command");
const log = require("./../utils/log");
const ugvCurrentInfo = {};
var uavTrack_Data = {};
let assignment_rules = [];
let tracks = []
let interval = null;

function getAssignRules() {
  let query = `select array_to_string(assignments, ',') as assignments from assignment_rules order by 1 limit 1`;
  db.selectWithQuery(query)
    .then((results) => {
      if (results && results.length) {
        assignment_rules = results[0].assignments.split(",");
      }
    })
    .catch((error) => {
      log.createLog({
        type: "error",
        root_module: "MCCS",
        sub_module: "Response Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: error || "GetAssignRules Error",
      });
      console.log(error);
      assignment_rules = [];
    });
}

function executor() {
  setTimeout(function () {
    getAssignRules();
  }, 2000);
}

executor();

// const upload = multer({ dest: './kml file' }).single('file');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./rndf_files/");
  },
  filename: function (req, file, cb) {
    let ext = ".kml"; // set default extension (if any)
    // extension of the file name only (no folders), e.g. "area.kml" -> ".kml"
    if (path.extname(path.basename(file.originalname))) ext = path.extname(path.basename(file.originalname));
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage: storage }).single("file");

// Retrieve zoneWise data from the database.
exports.zoneWise = async (req, res, next) => {
  try {
    const customQuery = `SELECT z.zone_id as zoneid, z.zone_priority, z.zone_type, 
                         z.zone_area, z.current_status as zone_status, t.*
                         FROM (SELECT * FROM zone) z
                         INNER JOIN (
                                select ua.uav_id as id, 'uav' as type, ua.rth_location as location, 
                                ua.ip, ua.zone_id, ua.is_assigned, ua.current_status 
                                from uav ua inner join zone z ON ua.zone_id = z.zone_id
                                union all
                                select ug.ugv_id as id, 'ugv' as type, ug.base_location as location, ug.ip, 
                                ug.zone_id, ug.is_assigned, ug.current_status 
                                from ugv ug inner join zone z ON ug.zone_id = z.zone_id
                            ) t
                         ON t.zone_id = z.zone_id`;

    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          var result = [];
          if (results.length > 0) {
            results.forEach(
              (function (hash) {
                return function (a) {
                  if (!hash[a.zoneid]) {
                    hash[a.zoneid] = {
                      zoneid: a.zoneid,
                      zone_priority: a.zone_priority,
                      zone_type: a.zone_type,
                      zone_area: a.zone_area,
                      zone_status: a.zone_status,
                      uav_ugv_info: [],
                    };
                    result.push(hash[a.zoneid]);
                  }
                  hash[a.zoneid].uav_ugv_info.push({
                    id: a.id,
                    type: a.type,
                    location: a.location,
                    ip: a.ip,
                    zone_id: a.zone_id,
                    is_assigned: a.is_assigned,
                    current_status: a.current_status,
                  });
                };
              })(Object.create(null))
            );
          }
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "ZoneWise Success",
          });
          res.status(200).send({ error: false, data: result, statusCode: 200 });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "ZoneWise Success",
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
          sub_module: "Response Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "ZoneWise Error",
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
      sub_module: "Response Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "ZoneWise Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// get data from the database and prepare geojson.
exports.getGeoJson = async (req, res, next) => {
  try {
    const customQuery = `select json_build_object(
            'type', 'FeatureCollection',
            'features', json_agg(ST_AsGeoJSON(t.*)::json)
        ) as geojson
        from (
            SELECT * FROM ${ident(req.query.type)}
        ) as t`;
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetGeoJson Success",
          });
          res
            .status(200)
            .send({ error: false, data: results[0].geojson, statusCode: 200 });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetGeoJson Success",
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
          sub_module: "Response Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "GetGeoJson Error",
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
      sub_module: "Response Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "GetGeoJson Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Save/Update Patrol Flag
exports.savePatrolFlag = async (req, res, next) => {
  try {
    let values = req.body.ugv_ids.map((item) => { return `(${num(item)}, 0, true)`; });
    let customQuery = `
    update ugv as ugv set is_assigned  = new_val.is_assigned, is_in_patrol = new_val.is_in_patrol
    from ( values ${values} ) as new_val(ugv_id, is_assigned, is_in_patrol)
    where new_val.ugv_id = ugv.ugv_id`;
    await db.updateWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "SaveAssignmentRules Updated Successfully",
          });
          res.status(200).send({
            error: false,
            message: "Updated Successfully",
            statusCode: 200,
          });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "PatrolFlag Updated Successfully",
          });
          res.status(304).send({
            error: false,
            message: "Updated Successfully",
            statusCode: 304,
          });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Response Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "PatrolFlag Error",
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
      sub_module: "Response Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "PatrolFlag Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

exports.saveUGVManualRoute = async (req, res, next) => {
  try {
    let waypoints = req.body.waypoints.map((item) => { return `${str(item)}`; });
    let customQuery = `update ugv set manual_route = ARRAY[${waypoints}] where ugv_id = ${num(req.body.ugv_id)}`;
    await db.updateWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "saveUGVManualRoute Updated Successfully",
          });
          res.status(200).send({
            error: false,
            message: "Updated Successfully",
            statusCode: 200,
          });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "saveUGVManualRoute Updated Successfully",
          });
          res.status(304).send({
            error: false,
            message: "Updated Successfully",
            statusCode: 304,
          });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Response Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "saveUGVManualRoute Error",
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
      sub_module: "Response Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "saveUGVManualRoute Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

exports.getUGVManualRoute = async (req, res, next) => {
  try {
    const customQuery = `select manual_route from ugv where ugv_id = ${num(req.query.ugv_id)}`;
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetUGVManualRoute Success",
          });
          res
            .status(200)
            .send({ error: false, data: results[0], statusCode: 200 });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetUGVManualRoute Success",
          });
          res.status(200).send({ error: false, data: {}, statusCode: 200 });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Response Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "GetUGVManualRoute Error",
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
      sub_module: "Response Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "GetUGVManualRoute Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// get Assignment Rules
exports.getAssignmentRules = async (req, res, next) => {
  try {
    const customQuery = `select id, array_to_string(assignments, ',') as assignments from assignment_rules order by 1 limit 1`;
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetAssignmentRules Success",
          });
          res
            .status(200)
            .send({ error: false, data: results[0], statusCode: 200 });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetAssignmentRules Success",
          });
          res.status(200).send({ error: false, data: {}, statusCode: 200 });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Response Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "GetAssignmentRules Error",
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
      sub_module: "Response Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "GetAssignmentRules Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

exports.tracks = (req, res, next) => {
  //console.log(req.body)
  tracks = req.body.tracks;
  res.send('success');
}

exports.uavTrack = (req, res, next) => {
  console.log("----", req.query)
  var uav_data = {
    category: "uav_status",
    properties: {
      level: "20.17",
      remaining_time: "20.24",
      ip: env.peer_host,
      lat: req.query.lat,
      lon: req.query.lng,
      zone_id: ""
    }
  };
  sendDataToUI(uav_data);
  res.send('success');
}

// Save/Update Assignment Rules
exports.saveAssignmentRules = async (req, res, next) => {
  try {
    assignment_rules = req.body.assignments;
    if (!req.body.isUpdate) {
      let customQuery = `insert into assignment_rules(assignments) values (ARRAY[${str(req.body.assignments)}])`;
      await db.createWithQuery(customQuery).then(
        (results) => {
          if (results && results.length) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Response Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "SaveAssignmentRules Success",
            });
            res
              .status(200)
              .send({ error: false, data: results, statusCode: 200 });
          } else {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Response Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "SaveAssignmentRules Success",
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
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message || "SaveAssignmentRules Error",
          });
          res
            .status(400)
            .send({ error: true, message: error.message, statusCode: 400 });
        }
      );
    } else if (req.body.isUpdate && req.body.id) {
      let customQuery = `UPDATE assignment_rules SET assignments = ARRAY[${str(req.body.assignments)}] WHERE id = ${num(req.body.id)}`;
      await db.updateWithQuery(customQuery).then(
        (results) => {
          if (results && results.length) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Response Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "SaveAssignmentRules Updated Successfully",
            });
            res.status(200).send({
              error: false,
              message: "Updated Successfully",
              statusCode: 200,
            });
          } else {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Response Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "SaveAssignmentRules Updated Successfully",
            });
            res.status(304).send({
              error: false,
              message: "Updated Successfully",
              statusCode: 304,
            });
          }
        },
        (error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message || "SaveAssignmentRules Error",
          });
          res
            .status(400)
            .send({ error: true, message: error.message, statusCode: 400 });
        }
      );
    }
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
      sub_module: "Response Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "SaveAssignmentRules Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Assign to response like UAV, UGV, QRT
exports.assignToResponse = async (req, res, next) => {
  console.log(req.body)
  if (req.body.type === "uav") {
    if (req.body.eventType === 5) {
      // console.log(tracks)
      getUavInfo({ zone_id: req.body.zone_id, type: "uav", alarm_id: req.body.alarm_id, alarm_location: coordinates, event_type: req.body.eventType }, res);
    }
    else if (req.body.eventType === 6) {
      getUavInfo({ zone_id: req.body.zone_id, type: "uav", alarm_id: req.body.alarm_id, alarm_location: coordinates, event_type: req.body.eventType }, res);
    }
  }
  else if (req.body.type === "qrt") {  // QRT Assignment
    // Send it to UI
    var alarm_data = req.body.alarm_data;
    var coordinates = alarm_data.location.coordinates;
    var alarmObject = { type: alarm_data.alarm_type, alarm_id: alarm_data.alarm_id, id: req.body.id, lat: coordinates[1], lng: coordinates[0] };
    var geojson = CustomGeoJson.parse(alarmObject, { Point: ['lat', 'lng'] });
    var alarm_data = req.body.alarm_data;
    alarm_data.event_type = req.body.eventType; // sets event type
    var data = { alarm_data: req.body.alarm_data, category: "qrt", gJson: geojson };
    console.log("sending the data to qrt")
    sendDataToUI(data).then(response => { response });
  }
  res.status(200).send({ error: false, message: 'success', statusCode: 200 });
};

// Assign to response like UAV, UGV, QRT
exports.sendCommands = async (req, res, next) => {
  var command = req.body.command;
  var commandtoBeSent = "";
  if (command == "armed") {
    commandtoBeSent = JSON.stringify({
      DroneId: "SDE52",
      Command: "Armed",
      Value1: "",
      Value2: "",
      Value3: "",
    });
  } else if (command == "takeoff") {
    commandtoBeSent = JSON.stringify({
      DroneId: "SDE52",
      Command: "Takeoff",
      Value1: "",
      Value2: "",
      Value3: "",
    });
  } else if (command == "rtl") {
    console.log("in rtl");
    commandtoBeSent = JSON.stringify({
      DroneId: "SDE52",
      Command: "RTL",
      Value1: "",
      Value2: "",
      Value3: "",
    });
  }
  tcp_socket_command.tcpServerConnect({ host: env.peer_host, port: 3250 });
  tcp_socket_command.command(commandtoBeSent);
  log.createLog({
    type: "info",
    root_module: "MCCS",
    sub_module: "Response Service",
    method: new Error().stack.split("\n")[1].trim(),
    log_message: "SendCommands Success",
  });
  res.send("success");
};

function processAssignment(req, res, next) {
  try {
    console.log(req.body);
    if (
      req.body.type == "ugv" &&
      ((req.body.mode === "auto" && assignment_rules.indexOf("ugv") > -1) ||
        req.body.mode == "manual")
    ) {
      var alarm_data = req.body.alarm_data;
      var coordinates = alarm_data.location.coordinates;
      var destLatitude = convertToDataPacket(coordinates[1]);
      var destLongitude = convertToDataPacket(coordinates[0]);
      findPath(coordinates[1], coordinates[0]);
      if (res != undefined) {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Response Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: "ProcessAssignment Not available",
        });
        res.status(404).send({
          status: false,
          error: true,
          message: "Not available",
          statusCode: 404,
        });
      }
    } else if (
      req.body.type === "uav" &&
      ((req.body.mode === "auto" && assignment_rules.indexOf("uav") > -1) ||
        req.body.mode == "manual")
    ) {
      var alarm_data = req.body.alarm_data;

      var coordinates = alarm_data.location.coordinates;
      // var destLatitude = convertToDataPacket(coordinates[1]);
      // var destLongitude = convertToDataPacket(coordinates[0]);
      // console.log(coordinates[1], coordinates[0])

      getUavInfo(
        {
          zone_id: req.body.zone_id,
          type: "uav",
          alarm_location: coordinates,
          event_type: req.body.eventType,
        },
        res
      );
    } else if (req.body.type === "qrt") {
      // QRT Assignment
      // Send it to UI
      var alarm_data = req.body.alarm_data;
      var coordinates = alarm_data.location.coordinates;
      var alarmObject = {
        type: alarm_data.alarm_type,
        alarm_id: alarm_data.alarm_id,
        id: req.body.id,
        lat: coordinates[1],
        lng: coordinates[0],
      };
      var geojson = CustomGeoJson.parse(alarmObject, { Point: ["lat", "lng"] });
      var alarm_data = req.body.alarm_data;
      alarm_data.event_type = req.body.eventType; // sets event type
      var data = {
        alarm_data: req.body.alarm_data,
        category: "qrt",
        gJson: geojson,
      };
      console.log("sending the data to qrt");
      sendDataToUI(data).then((response) => {
        response;
      });
    }

    // Update is assigned
    const promise1 = new Promise((resolve, reject) => {
      let query;
      if (req.body.type === 'uav') {
        query = `update ${req.body.type} set is_assigned=1 where zone_id=${str(req.body.zone_id)}`;
      }
      else if (req.body.type === 'ugv') {
        query = `update ${req.body.type} set is_in_patrol=false, is_assigned=1 where zone_id=${str(req.body.zone_id)}`;
      }
      db.updateWithQuery(query).then(
        (results) => {
          if (results && results.length) {
            resolve(results);
          } else {
            resolve();
          }
        },
        (error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error || "ProcessAssignment Error",
          });
          resolve(error);
        }
      );
    });
    // Update Alarm Events
    const promise2 = new Promise((resolve, reject) => {
      const eventsQuery = `INSERT INTO alarm_events (alarm_id, event_type, timeofevent, location) VALUES (${str(req.body.alarm_data.alarm_id)}, ${str(req.body.eventType)}, 'now()', ST_GeomFromText('POINT(${num(req.body.alarm_data.location.coordinates[0])} ${num(req.body.alarm_data.location.coordinates[1])})', 4326))`;
      db.createWithQuery(eventsQuery).then(
        (results) => {
          if (results && results.length) {
            resolve(results);
          } else {
            resolve();
          }
        },
        (error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error || "ProcessAssignment Error",
          });
          resolve(error);
        }
      );
    });

    Promise.all([promise1, promise2]).then(function (results) {
      const customQuery = `SELECT * FROM ${ident(req.body.type)} WHERE zone_id = ${str(req.body.zone_id)}`;
      db.selectWithQuery(customQuery).then(
        (results) => {
          if (results && results.length) {
            //  sendRequest(results);
            if (res != undefined) {
              res.status(200).send({ error: false, data: results, statusCode: 200 });
            }
          }
        },
        (error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error || "ProcessAssignment Error",
          });
          if (res != undefined) {
            res.status(400).send({ error: true, message: error.message, statusCode: 400 });
          }
        }
      );
    });
  } catch (err) {
    if (res != undefined) {
      res.errorCode = 500;
      res.errorInfo = {
        error: true,
        status: "failed",
        message: err.message || "Error occurred.. Please try later.",
      };
      log.createLog({
        type: "error",
        root_module: "MCCS",
        sub_module: "Response Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: err.message || "ProcessAssignment Failed",
      });
      res.send({ ...res.errorInfo, ... { statusCode: 500 } });
    }
  }
}

function sendDataToTCPServer(data, type) {
  if (true) {
    console.log("Client: connection established with server");
    console.log("---------client details -----------------");
    let start = "B5 62 41 08";
    if (type == 6) {
      start = "B5 62 42 01";
    } else {
      start = "B5 62 41 08";
    }
    let startingPacket = start.split(/\s+/);
    startingPacket = convertIntPacket(startingPacket);
    let end = "44 17";

    let endPacket = end.split(/\s+/);
    endPacket = convertIntPacket(endPacket);
    let pdata = startingPacket + data + endPacket;
    console.log("-----data-----", pdata);

    tcp_socket_command.tcpZmotionServerConnect({ host: "localhost", port: 9095 });
    tcp_socket_command.command(pdata);

    /* request.get(
      `http://localhost:8093/command?cmd=${pdata}`,
      (err, res, body) => {
        if (err) {
          err.errorCode = 500;
          err.errorInfo = {
            error: true,
            status: "failed",
            message: err.message || "Error occurred.. Please try later.",
          };
        } else {
          console.log("data sent");
          // response.send({ status: true, error: false, message: 'Saved Successfully' });
        }
      }
    ); */
  }
}

const getUavInfo = (params, res) => {
  var options = { json: true }
  options.url = "http://localhost:3001/api/sensor/get-sensor-mapped-config";
  options.body = { zone_id: params.zone_id, column: "zone_id", type: params.type }
  options.method = "POST"
  request(options, (err, response, body) => {
    if (!err) {
      // console.log("--sensor cofig data---", response.body)
      if (params.event_type != 6) {

        sendUavTakeoff(response.body.data.ip)
        let radar_cords = undefined;
        for (let index = 0; index < tracks.length; index++) {
          const element = tracks[index];
          if (params.alarm_id === element.id) {
            alarm_id = element.id;
            uav_ip = response.body.data.ip
            // console.log("---", element.tail);
            radar_cords = element.tail.pop();
            // console.log(radar_cords)    
            if (radar_cords != undefined) {
              sendUavCommand(response.body.data.ip, radar_cords[1], radar_cords[0])
              break;
            }
          }
        }

        // startTcpReceiving(response.body.data.ip, params.zone_id, params.alarm_id, params.alarm_location[1], params.alarm_location[0], params.event_type, params.radar_latlng);
      }
      else {

        clearInterval(interval);
        sendUavRTL(response.body.data.ip);

        // endTcpReceiving(response.body.data.ip, params.zone_id, params.event_type);
      }
      // res.status(200).send('sent')
    }
    else {
      res.status(400).send({ error: true, message: 'UAV Not Availble with IP', statusCode: 400 });
    }
  });
}

var coordinates = [
  [17.429, 78.369],
  [17.4275, 78.3665],
  [17.4255, 78.3635],
];
var index = 0;
var isStartedFlying = false;


//Receive Track Data From Map Service...
function receiveTrackDataFromMapService() {
  var options = { json: true }
  options.url = env.base_url + "/map/radar/track-data";
  options.method = "GET"
  request(options, (err, response, body) => {
    if (!err) {
      console.log('Error Checking...')

      uavTrack_Data = response.body.track_data;
      console.log('UAV_Track_Data:', response.body.track_data);
    }
  });
}

function startTcpReceiving(ip, zoneId, lat, lon) {
  // console.log("---tcp req---", ip, zoneId, lat, lon);

  // host should be ip. for testing purpose , localhost has been added
  var command = null;
  var count = 0;

  let interval_time = 0;

  if (count === 0) {
    interval_time = 30000;
  } else if (count === 1) {
    interval_time = 20000;
  } else if (count === 2) {
    interval_time = 50000;
  }
  // else if(count === 3) {
  //     interval_time = 20000;
  // }
  /* command = JSON.stringify({
    DroneId: "SDE52",
    Command: "Fly",
    Value1: "" + lat + "",
    Value2: "" + lon + "",
    Value3: "50",
  });
  tcp_socket_command.tcpServerConnect({ host: ip, port: 3250 });
  tcp_socket_command.command(command); */
  // count++;

  var interval = setInterval(() => {
    if (count === 0 && !isStartedFlying) {
      command = JSON.stringify({ 'DroneId': 'SDE52', 'Command': 'Armed', 'Value1': '', 'Value2': '', 'Value3': '' });
    }
    else if (count === 1 && !isStartedFlying) {
      command = JSON.stringify({ 'DroneId': 'SDE52', 'Command': 'Takeoff', 'Value1': '', 'Value2': '', 'Value3': '' });
      isStartedFlying = true
    }
    else if (count === 2 && isStartedFlying) {
      command = JSON.stringify({ 'DroneId': 'SDE52', 'Command': 'Fly', 'Value1': '' + lat + '', 'Value2': '' + lon + '', 'Value3': '50' });
    }
    // else if (count === 3 && event_type === 6) {
    //     command = JSON.stringify({ 'DroneId': 'SDE52', 'Command': 'RTL', 'Value1': '', 'Value2': '', 'Value3': '' });
    // }
    count++;

    // Sending the command to TCP Server
    tcp_socket_command.tcpServerConnect({ host: ip, port: 3250 });
    tcp_socket_command.command(command);

    // console.log(count, "---command---", command);

    // if (count === 3) {

    //   clearInterval(interval); // Reset the interval after sending of fly command

    // }
    if (count >= 3) {
      receiveTrackDataFromMapService(uavTrack_Data);
      var latitude = uavTrack_Data.lat;
      var Longitude = uavTrack_Data.log;
      command = JSON.stringify({ 'DroneId': 'SDE52', 'Command': 'Fly', 'Value1': '' + latitude + '', 'Value2': '' + Longitude + '', 'Value3': '50' });

      clearInterval(interval); // Reset the interval after sending of fly command

    }

    // console.log("----interval_time----", interval_time);
  }, interval_time);

  // command = JSON.stringify({ 'DroneId': 'SDE52', 'Command': 'RTL', 'Value1': '', 'Value2': '', 'Value3': '' });

  // let command = JSON.stringify({ 'DroneId': droneId, 'Command': 'RTL', 'Value1': '', 'Value2': '', 'Value3': '' });
  //let command = JSON.stringify({ 'DroneId': droneId, 'Command': 'Armed', 'Value1': '', 'Value2': '', 'Value3': '' });
  //let command = JSON.stringify({ 'DroneId': droneId, 'Command': 'Takeoff', 'Value1': '', 'Value2': '', 'Value3': '' });
  // console.log(command)
  // tcp_socket_command.tcpServerConnect({ host: env.peer_host, port: 3250 });
  // tcp_socket_command.command(command)

  // console.log("sending command is ",command)
  // request.get(`http://195.67.15.4:8093/command?cmd=${command}`, (err, res, body) => {
  //     if (err) {
  //         err.errorCode = 500;
  //         err.errorInfo = {
  //             error: true,
  //             status: 'failed',
  //             message: err.message || "Error occurred.. Please try later."
  //         }
  //     } else {
  //         console.log("data sent")
  //         // response.send({ status: true, error: false, message: 'Saved Successfully' });
  //     }
  // });
}

// Contineously hitting fly command while isStartedFlying is true
setInterval(() => {
  var count = 0;
  isStartedFlying = true
  if (count === 2 && isStartedFlying) {
    command = JSON.stringify({ 'DroneId': 'SDE52', 'Command': 'Fly', 'Value1': '' + lat + '', 'Value2': '' + lon + '', 'Value3': '50' });
  }
}, 5000);


function endTcpReceiving(ip, zoneId, event_type) {
  var command = null;
  if (isStartedFlying) {
    //var interval = setInterval(() => {
    command = JSON.stringify({
      DroneId: "SDE52",
      Command: "RTL",
      Value1: "",
      Value2: "",
      Value3: "",
    });

    // Sending the command to TCP Server
    tcp_socket_command.tcpServerConnect({ host: ip, port: 3250 });
    tcp_socket_command.command(command);
    isStartedFlying = false;

    // clearInterval(interval); // Reset the interval after sending of fly command

    // }, 20000);
  }
}


// KKL

function sendUavRTL(ip) {
  console.log("---rtl--");

  request.get(`http://${env.peer_host}:5000/rtl?ip=${ip}`, (err, res, body) => {
    if (err) {
      err.errorCode = 500;
      err.errorInfo = {
        error: true,
        status: 'failed',
        message: err.message || "Error occurred.. Please try later."
      }
    } else {
      console.log("RTL sent")
      // response.send({ status: true, error: false, message: 'Saved Successfully' });
    }
  });
}

// KKL
function sendUavTakeoff(ip) {
  console.log("---takeoff--");
  request.get(`http://${env.peer_host}:5000/takeoff?ip=${ip}`, (err, res, body) => {
    if (err) {
      err.errorCode = 500;
      err.errorInfo = {
        error: true,
        status: 'failed',
        message: err.message || "Error occurred.. Please try later."
      }
    } else {
      console.log("Takeoff sent")
      // response.send({ status: true, error: false, message: 'Saved Successfully' });
    }
  });
}

// KKL
function sendUavCommand(ip, lat, lng) {
  console.log("---fly--");

  request.get(`http://${env.peer_host}:5000/command?ip=${ip}&lat=${lat}&lng=${lng}`, (err, res, body) => {
    if (err) {
      err.errorCode = 500;
      err.errorInfo = {
        error: true,
        status: 'failed',
        message: err.message || "Error occurred.. Please try later."
      }
    } else {
      console.log("data sent")
      // response.send({ status: true, error: false, message: 'Saved Successfully' });
    }
  });
}

receiveUAVData();

function receiveUAVData() {

  tcp_connect.tcpClient({ host: env.peer_host, port: 3251 });
  var data = {
    category: "uav_status",
    properties: {
      level: "20.17",
      remaining_time: "20.24",
      ip: env.peer_host,
      lat: "",
      lon: "",
      zone_id: "19"
    }
  };
  setInterval(function () {
    let uavData = tcp_connect.getUAVStatus();
    if (uavData != undefined) {
      console.log("---data----", uavData);
      data.data.lat = uavData.lat;
      data.data.lon = uavData.lng;
      data.data.remaining_time = uavData.battery_remaining;
      sendDataToUI(data);
    }
  }, 1000)
}


function convertToDataPacket(data) {
  var strVal = data.toString();
  strVal = strVal.replace(".", "");
  strVal = strVal + "0";
  if (strVal.length > 8) {
    strVal = strVal.slice(0, 9);
  }
  var hexVal = parseInt(strVal).toString(16);
  var k = 2;
  var hexaArray = "";
  for (var k = hexVal.length; k > 0; k = k - 2) {
    if (k - 2 < 0) {
      let dec = hexVal.slice(0, k);
      if (dec.length == 1) {
        dec = "0" + dec;
      }
      hexaArray += "" + dec;
    } else {
      let dec = hexVal.slice(k - 2, k);
      if (dec.length == 1) {
        dec = "0" + dec;
      }
      hexaArray += "" + dec;
    }
  }
  return hexaArray;
}

function convertIntPacket(list) {
  let hexaArray = "";
  for (let index = 0; index < list.length; index++) {
    hexaArray += "" + list[index];
  }
  return hexaArray;
}

function findPath(lat, lon) {
  fs.readFile(
    "./rndf_files/1607429410891.txt",
    "utf8",
    function (err, fileData) {
      if (err) {
        console.log('findPath', err);
      } else if (fileData) {
        file_data = getJsonFromtxt(fileData);
        // uncomment the below function only you need to test entire scenario
        //  findIdOfLocationFromRDNF(lat, lon, file_data)
        var destnPoints = ["3.1.4"];
        // ugv lane (entry, exit)
        var sourcePoints = ["2.1.1", "2.1.7"];
        let shortestPath = getShortestPath(
          sourcePoints,
          destnPoints,
          file_data
        );
        console.log('shortestPath', shortestPath);
      }
    }
  );
}
// retrives the intruder/UGV current waypoint id from RNDF
function findIdOfLocationFromRDNF(lat, lon, data) {
  var segments = data.segments;
  var allLanes = [];
  var allLaneIDs = [];
  segments.map((rec) => allLanes.push(...rec.lanes));
  for (let index = 0; index < allLanes.length; index++) {
    const waypoints = allLanes[index].waypoints;
    for (let i = 0; i < waypoints.length; i++) {
      const waypoint = waypoints[i];
      // console.log(waypoint.lat, parseFloat(waypoint.lat), parseFloat(waypoint.lon), lat , lon)
      var options = { units: "kilometers" };
      var km_distance = turf.distance(
        [parseFloat(waypoint.lat), parseFloat(waypoint.lon)],
        [lat, lon],
        options
      );
      if (km_distance * 1000 < 2) {
        return allLanes[index].exitpoints;
      }
    }
  }
  console.log(allLanes, allLaneIDs);
}

// Save RNDF Config
exports.saveRndfConfig = (req, res, next) => {
  upload(req, res, async function (err) {
    if (err) {
      err.errorCode = 500;
      err.errorInfo = {
        error: true,
        status: "failed",
        message: err.message || "Error occurred.. Please try later.",
      };
      log.createLog({
        type: "error",
        root_module: "MCCS",
        sub_module: "Response Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: err.message || "SaveRndfConfig Error",
      });
      res.send(err);
    } else {
      const saveRndfQuery = `insert into rndf_configuration (title, file_name, updated_date) values(${str(req.body.file_name)}, ${str(req.file.filename)}, 'now()')`;
      await db.createWithQuery(saveRndfQuery).then(
        (results) => {
          if (results && results.length) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Response Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "SaveRndfConfig Sucess",
            });
            res.status(200).send({
              error: false,
              data: results,
              message: "Successfully Saved",
              statusCode: 200,
            });
          } else {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Response Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "SaveRndfConfig Sucess",
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
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message || "SaveRndfConfig Error",
          });
          res
            .status(400)
            .send({ error: true, message: error.message, statusCode: 400 });
        }
      );
    }
  });
};

// Get RNDF Config
exports.getRndfConfig = async (req, res, next) => {
  try {
    const customQuery = `select * from rndf_configuration order by is_selected desc`;
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          let promises = [];
          let getResponse = results;
          results.forEach((data, i) => {
            promises.push(
              new Promise((resolve, reject) => {
                const file_ext = data.file_name.split(".").pop();
                fs.readFile(
                  "./rndf_files/" + data.file_name,
                  "utf8",
                  function (err, fileData) {
                    if (err) {
                      log.createLog({
                        type: "error",
                        root_module: "MCCS",
                        sub_module: "Response Service",
                        method: new Error().stack.split("\n")[1].trim(),
                        log_message: err || "GetRndfConfig Error",
                      });
                      reject(err);
                    } else if (file_ext === "txt" && fileData) {
                      getResponse[i].file_data = getJsonFromtxt(fileData);
                    } else {
                      getResponse[i].file_data = fileData;
                    }
                    resolve(getResponse);
                  }
                );
              })
            );
          });

          Promise.all(promises)
            .then(([result]) => {
              log.createLog({
                type: "info",
                root_module: "MCCS",
                sub_module: "Response Service",
                method: new Error().stack.split("\n")[1].trim(),
                log_message: "GetRndfConfig Successfully Data Sent",
              });
              res.status(200).send({ data: result });
            })
            .catch((err) => {
              log.createLog({
                type: "error",
                root_module: "MCCS",
                sub_module: "Response Service",
                method: new Error().stack.split("\n")[1].trim(),
                log_message: err || "GetRndfConfig Error",
              });
              console.log(err);
              res
                .status(500)
                .send({ error: true, message: err, statusCode: 500 });
            });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetRndfConfig Success",
          });
          res.status(204).send({ error: false, data: [], statusCode: 204 });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Response Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "GetRndfConfig Error",
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
      sub_module: "Response Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "GetRndfConfig Failed Server",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

function getShortestPath(source, destination, data) {
  //  console.log("in get shortest path", data)
  var segments = data.segments;
  // all Lanes
  var allLanes = [];
  var allLaneIDs = [];
  segments.map((rec) => allLanes.push(...rec.lanes));
  allLanes.map((rec) => allLaneIDs.push(rec.id));
  //all exit points
  var exitPoints = [];
  segments.map((rec) => exitPoints.push(...rec.exit));

  var collectionOfPaths = [];
  var allPossibleEntrypoints = [];
  getMatchedLanePoints(
    allLanes,
    source,
    destination,
    exitPoints,
    collectionOfPaths,
    allPossibleEntrypoints,
    allLaneIDs,
    0
  );
  console.log("allPossibleEntrypoints ", allPossibleEntrypoints);
  var allPossiblePaths = [];
  allPossiblePaths = allLanesIterations(
    "2.1.5",
    allLanes,
    allPossibleEntrypoints,
    "3.1.6",
    allPossiblePaths
  );
}

getMatchedLanePoints = (
  allLanes,
  source,
  destination,
  exitPoints,
  collectionOfPaths,
  AllPaths,
  allLaneIDs,
  visitedLaneIdsLength
) => {
  var matchedLanePoints = [];
  var entryPoint = source[0]
    .split(".")
    .slice(0, 2)
    .toString()
    .replace(/,/g, ".");
  var laneIndex = allLanes.findIndex((rec) => rec.id == entryPoint);
  if (laneIndex !== -1) {
    allLanes[laneIndex].exitpoints.map((rec) => matchedLanePoints.push(rec[0]));
  }
  if (
    matchedLanePoints &&
    exitPoints &&
    matchedLanePoints.length &&
    exitPoints.length
  ) {
    for (var i = 0; i < matchedLanePoints.length; i++) {
      // console.log("matchedLanePoints ", matchedLanePoints)
      for (var k = 0; k < exitPoints.length; k++) {
        if (matchedLanePoints[i] == exitPoints[k][0]) {
          // console.log(matchedLanePoints[i], exitPoints[k][0], destination[0])
          let newSource = exitPoints[k][1];
          if (collectionOfPaths.indexOf(source[0]) == -1) {
            collectionOfPaths.push(source[0]);
          }
          if (collectionOfPaths.length > allLaneIDs.length) {
            collectionOfPaths = [];
            return collectionOfPaths;
          }
          if (
            newSource.split(".").slice(0, 2).toString().replace(/,/g, ".") ==
            destination[0].split(".").slice(0, 2).toString().replace(/,/g, ".")
          ) {
            if (collectionOfPaths.indexOf(destination[0]) == -1) {
              collectionOfPaths.push(destination[0]);
            }
            return source[0];
          } else {
            //  console.log("before calling ",newSource, exitPoints[k][0])
            getMatchedLanePoints(
              allLanes,
              [newSource],
              destination,
              exitPoints,
              collectionOfPaths,
              AllPaths,
              allLaneIDs,
              visitedLaneIdsLength
            );
            // console.log("returned point is ", point, matchedLanePoints[i], destination)
          }
        }
      }
      if (
        collectionOfPaths.length > 0 &&
        collectionOfPaths.indexOf(destination[0]) != -1
      ) {
        AllPaths.push(collectionOfPaths);
        collectionOfPaths = [];
        visitedLaneIdsLength = 0;
      }
    }
  }
};

function allLanesIterations(
  sourcePoint,
  allLanes,
  allPaths,
  destination,
  allPossiblePaths
) {
  console.log(" all lanes iterations", sourcePoint, destination, allPaths);
  for (var j = 0; j < allPaths.length; j++) {
    let path = [];
    for (var k = 0; k < allPaths[j].length; k++) {
      //  console.log(allPaths[j][k])
      var source = parseInt(sourcePoint.split(".").splice(2));
      //  console.log(source)
      var dest = parseInt(allPaths[j][k].split(".").splice(2));
      //  console.log(dest)
      var entryPoint = sourcePoint
        .split(".")
        .slice(0, 2)
        .toString()
        .replace(/,/g, ".");
      var laneIndex = allLanes.findIndex((rec) => rec.id == entryPoint);
      let points = [];
      if (allLanes[laneIndex].waypoints) {
        points = allLanes[laneIndex].waypoints.slice(destination, source);
      }
      if (source > dest) {
        points = points.reverse();
      }
      // console.log("points *** ", points, path)
      path = path.concat(points);
      sourcePoint = allPaths[j][k];
    } // inner for loop
    console.log("_________________________________________________");
    allPossiblePaths.push(path);
  } // outer for loop
  console.log("********************* end **************************");
  return allPossiblePaths;
}

function getJsonFromtxt(data) {
  if (data != undefined) {
    var lines = data.toString().split("\n");
    var opJson = {};
    var segments = [],
      segment = {};
    var lanes = [],
      lane = {};
    var waypoints = [];
    var exitpoints = [];
    var perimeter = {};
    var zones = [],
      zone = {};
    var spots = [],
      spot = {};

    lines.forEach((line) => {
      let cols = line.split(" ");
      // console.log(cols)
      if (
        cols[0].trim() === "RNDF_name" ||
        cols[0].trim() === "num_segments" ||
        cols[0].trim() === "num_zones"
      ) {
        opJson[cols[0]] = cols[1].split("\r")[0];
      } else if (cols[0].trim() === "segment") {
        segment = {};
        segment["number"] = cols[1];
      } else if (
        cols[0].trim() === "num_lanes" ||
        cols[0].trim() === "segment_name"
      ) {
        segment[cols[0]] = cols[1];
      } else if (cols[0].trim() === "lane") {
        lane = {};
        lane["id"] = cols[1];
      } else if (cols[0].trim() === "exit") {
        exitpoints.push([cols[1], cols[2].trim().split("\r")[0]]);
        segment[cols[0]] = exitpoints;
      } else if (
        cols[0].trim() === "num_waypoints" ||
        cols[0].trim() === "lane_width" ||
        cols[0].trim() === "left_boundary" ||
        cols[0].trim() === "right_boundary"
      ) {
        lane[cols[0]] = cols[1];
      } else if (cols[0] != undefined && cols[0].split(".").length == 3) {
        let waypoint = {};
        waypoint["id"] = cols[0];
        waypoint["lon"] = cols[2].trim().split("\r")[0];
        waypoint["lat"] = cols[1];
        waypoints.push(waypoint);
      } else if (cols[0].trim() === "end_lane") {
        lane["waypoints"] = waypoints;
        lane["exitpoints"] = exitpoints;
        lanes.push(lane);
        waypoints = [];
        exitpoints = [];
      } else if (cols[0].trim() === "end_segment") {
        if (lanes.length > 0) {
          segment["lanes"] = lanes;
          segments.push(segment);
          lanes = [];
          segment = {};
          if (parseInt(opJson["num_segments"]) == segments.length) {
            opJson["segments"] = segments;
          }
        }
      } else if (cols[0].trim() === "zone") {
        zone = {};
        zone["number"] = cols[1];
      } else if (
        cols[0].trim() === "num_spots" ||
        cols[0].trim() === "zone_name"
      ) {
        zone[cols[0]] = cols[1];
      } else if (cols[0].trim() === "perimeter") {
        perimeter = {};
        perimeter["id"] = cols[1];
      } else if (cols[0].trim() === "num_perimeterpoints") {
        perimeter[cols[0]] = cols[1];
      } else if (cols[0].trim() === "end_perimeter") {
        perimeter["waypoints"] = waypoints;
        waypoints = [];
        zone["perimeter"] = perimeter;
      } else if (cols[0].trim() === "spot") {
        spot = {};
        spot["id"] = cols[1];
      } else if (cols[0].trim() === "spot_width") {
        spot[cols[0]] = cols[1];
      } else if (cols[0].trim() === "end_spot") {
        spot["waypoints"] = waypoints;
        spots.push(spot);
        waypoints = [];
      } else if (cols[0].trim() === "end_zone") {
        if (spots.length > 0) {
          zone["spots"] = spots;
          zones.push(zone);
          spots = [];
          zone = {};
          if (parseInt(opJson["num_zones"]) == zones.length) {
            opJson["zones"] = zones;
          }
        } else {
          zones.push(zone);
          zone = {};
          if (parseInt(opJson["num_zones"]) == zones.length) {
            opJson["zones"] = zones;
          }
        }
      }
    });
    return opJson;
  }
}

// Delete RNDF Config
exports.deleteRndfConfig = (req, res, next) => {
  // basename: a file name only, so "../" cannot delete files outside rndf_files
  fs.unlink("./rndf_files/" + path.basename(String(req.params.filename)), async (err) => {
    if (err) {
      res.errorCode = 500;
      res.errorInfo = {
        error: true,
        status: "failed",
        message: err.message || "Error occurred.. Please try later.",
      };
      log.createLog({
        type: "error",
        root_module: "MCCS",
        sub_module: "Response Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: err.message || "DeleteRndfConfig Failed",
      });
      res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
    } else {
      const customQuery = `delete from rndf_configuration where id=${num(req.params.id)}`;
      await db.deleteWithQuery(customQuery).then(
        (results) => {
          if (results) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Response Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "DeleteRndfConfig Deleted Success",
            });
            res.status(200).send({
              error: false,
              message: "Deleted Successfully",
              statusCode: 200,
            });
          } else {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Response Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "DeleteRndfConfig Unable to Delete",
            });
            res.status(404).send({
              error: false,
              message: "Unable to Delete",
              statusCode: 404,
            });
          }
        },
        (error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message || "DeleteRndfConfig Failed",
          });
          res
            .status(400)
            .send({ error: true, message: error.message, statusCode: 400 });
        }
      );
    }
  });
};

// Set Default RNDF Config
exports.setDefaultRndfConfig = async (req, res, next) => {
  try {
    const customQuery = `
        update rndf_configuration set is_selected = 
        case 
            when id != ${num(req.params.id)} then false
            when id = ${num(req.params.id)} then true
        end`;

    await db.updateWithQuery(customQuery).then(
      (results) => {
        if (results) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "SetDefaultRndfConfig Updated Successfully",
          });
          res.status(200).send({
            error: false,
            message: "Updated Successfully",
            statusCode: 200,
          });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "SetDefaultRndfConfig Updated Successfully",
          });
          res.status(304).send({
            error: false,
            message: "Updated Successfully",
            statusCode: 304,
          });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Response Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "SetDefaultRndfConfig Error",
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
      sub_module: "Response Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "SetDefaultRndfConfig Failed",
    });
    // next(res);
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

exports.updateRndfConfig = (req, res, next) => {
  upload(req, response, async function (err) {
    if (err) {
      err.errorCode = 500;
      err.errorInfo = {
        error: true,
        status: "failed",
        message: err.message || "Error occurred.. Please try later.",
      };
      log.createLog({
        type: "error",
        root_module: "MCCS",
        sub_module: "Response Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: err.message || "UpdateRndfConfig Error",
      });
      res.send(err);
    } else {
      let updateRndfQuery = `update rndf_configuration set title=${str(req.body.file_name)}, updated_date='now()' where id = ${num(req.body.id)}`;
      if (req.file) {
        updateRndfQuery = `update rndf_configuration set title=${str(req.body.file_name)}, updated_date='now()', file_name=${str(req.file.filename)} where id = ${num(req.body.id)}`;
      }

      if (req.body.old_file_name) {
        fs.unlink("./rndf_files/" + path.basename(String(req.body.old_file_name)), (err) => {
          // console.log('Removed');
        });
      }

      await db.updateWithQuery(updateRndfQuery).then(
        (results) => {
          if (results) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Response Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "UpdateRndfConfig Updated Successfully",
            });
            res.status(200).send({
              error: false,
              message: "Updated Successfully",
              statusCode: 200,
            });
          } else {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Response Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "UpdateRndfConfig Updated Successfully",
            });
            res.status(304).send({
              error: false,
              message: "Updated Successfully",
              statusCode: 304,
            });
          }
        },
        (error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "Response Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: err.message || "UpdateRndfConfig Failed",
          });
          res
            .status(400)
            .send({ error: true, message: error.message, statusCode: 400 });
        }
      );
    }
  });
};

exports.checkAreaCollision = (req, res, next) => {
  let intersectPoints = checkLineIntersection();
  if (intersectPoints) {
    const height = req.body.height;
    const speed = req.body.speed;
    if (height <= env.uavThresholdHeight) {
      // Getting uavThresholdHeight from global config file
      const fromPoint = ugvCurrentInfo.coordinates; // Getting uav current location from global object
      const toPoint = intersectPoints.features[0].geometry.coordinates;
      let distance = null;
      if (fromPoint.length > 0 && toPoint.length > 0) {
        var options = { units: "kilometers" };
        var km_distance = turf.distance(fromPoint, toPoint, options);
        distance = km_distance * 1000;
      }
      log.createLog({
        type: "info",
        root_module: "MCCS",
        sub_module: "Response Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: "Area collision happend by given points",
      });
      res.send({
        collision: true,
        data: {
          instersect_points: intersectPoints,
          height: height,
          distance: distance,
        },
        message: "Area collision happend by given points",
      });
    }
  } else {
    log.createLog({
      type: "info",
      root_module: "MCCS",
      sub_module: "Response Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: "Area collision not happend by given points",
    });
    res.send({
      collision: false,
      data: intersectPoints,
      message: "Area collision not happend by given points",
    });
  }
};

function checkLineIntersection() {
  var line1 = turf.lineString([
    [76.5372196733942, 14.384535303117506],
    [76.5378668500888, 14.385403882365521],
    [76.53899089382153, 14.38702182410202],
    [76.54025118527943, 14.388554611010282],
    [76.54103460969921, 14.389814902468187],
    [76.54129007418392, 14.390223645643724],
  ]);

  var line2 = turf.lineString([
    [76.54076606678457, 14.39275551649413],
    [76.5403583710143, 14.391296394790029],
    [76.54010087894888, 14.389837273085927],
    [76.53988630222769, 14.388485439742421],
    [76.53977901386709, 14.387605675185537],
    [76.53975755619497, 14.387155064071035],
    [76.53980047153921, 14.386854656661367],
  ]);

  var intersection = turf.lineIntersect(line1, line2);
  return intersection && intersection.features.length ? intersection : null;
}

function sendRequest(data) {
  request(
    {
      method: "post",
      url: env.ros_web_url + "/ros/web/adapter/ugv/assign",
      body: { ip: data[0].ip },
      json: true,
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
      } else {
        console.log(error);
      }
    }
  );
}

function sendResponseToWebRos(req) {
  if (req.body.waypoints.length > 0) {
    request(
      {
        method: "post",
        url: env.ros_web_url + "/web/ros/adapter/ugv/assign-path",
        body: req.body,
        json: true,
      },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          //  callback(body);
        }
      }
    );
  }
}

function sendStopAccessToWebRos(req) {
  if (req.body) {
    request(
      {
        method: "post",
        url: env.ros_web_url + "/web/ros/adapter/access/assign",
        body: req.body,
        json: true,
      },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          //  callback(body);
        }
      }
    );
  }
}

function sendZoneInfoToWebRos(req) {
  if (req.body) {
    request(
      {
        method: "post",
        url: env.ros_web_url + "/web/ros/adapter/access/assign",
        body: req.body,
        json: true,
      },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          //  callback(body);
        }
      }
    );
  }
}

exports.sendZoneInfoToWebRos = (req, res, next) => {
  sendZoneInfoToWebRos(req);
  // var data = { type: req.body.type, category: "ugvpath", gJson: req.body.waypoints };
  // // console.log('assignwaypoints', data);
  // sendDataToUI(data).then(response => {
  //     res.send(response);
  // });
  res.send({ data: [] });
};

exports.assignAccessToWaypoints = (req, res, next) => {
  sendStopAccessToWebRos(req);
  // var data = { type: req.body.type, category: "ugvpath", gJson: req.body.waypoints };
  // // console.log('assignwaypoints', data);
  // sendDataToUI(data).then(response => {
  //     res.send(response);
  // });
  res.send({ data: [] });
};

exports.assignWaypoints = (req, res, next) => {
  var data = {
    type: req.body.type,
    category: "ugvpath",
    gJson: req.body.waypoints,
  };
  sendDataToUI(data).then((response) => {
    res.send(response);
  });
};

function sendDataToUI(data) {
  return new Promise((resolve, reject) => {
    var options = {
      json: true,
      url: env.base_url + `/communication/to-ui`,
      body: data,
      method: "get",
    };
    request(options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        log.createLog({
          type: "info",
          root_module: "MCCS",
          sub_module: "Response Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: "SendDataToUI Success",
        });
        resolve(body);
      } else {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Response Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error || "SendDataToUI Error",
        });
        reject(error);
      }
    });
  });
}
