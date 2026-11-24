const request = require("request");

const { str, num, ident, numList } = require("../utils/sqlSafe"); // SQL-injection safe values
const configParams = {
  params: [
    "S.No",
    "Sensor Type",
    "Sensor ID",
    "Zone ID",
    "IP Address",
    "MAC Address",
    "Longitude",
    "Latitude",
    "Azimuth",
    "Height",
    "Status",
    "Last Update",
    "Actions",
  ],
};
const env = require("../config/env");
const db = require("../controllers/db");
const ping = require("ping");
const multer = require("multer");
const xlstojson = require("xls-to-json-lc");
const xlsxtojson = require("xlsx-to-json-lc");
const log = require("./../utils/log");

const storage = multer.diskStorage({
  //multers disk storage settings
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    var datetimestamp = Date.now();
    cb(
      null,
      file.fieldname +
        "-" +
        datetimestamp +
        "." +
        file.originalname.split(".")[file.originalname.split(".").length - 1]
    );
  },
});
const upload = multer({
  //multer settings
  storage: storage,
  fileFilter: function (req, file, callback) {
    //file filter
    if (
      ["xls", "xlsx"].indexOf(
        file.originalname.split(".")[file.originalname.split(".").length - 1]
      ) === -1
    ) {
      return callback(new Error("Wrong extension type"));
    }
    callback(null, true);
  },
}).single("file");

// Get Perimeter GeoJson
exports.getPerimeterJson = async (req, res, next) => {
  try {
    const customQuery = `
    SELECT json_build_object('type', 'FeatureCollection', 'features', json_agg(ST_AsGeoJSON(s.*)::json)) AS geojson
    FROM (SELECT site_id, site_area, default_center, default_zoom, min_zoom, max_zoom FROM site_dim where type = ${str(req.query.type)}) AS s(site_area)`;
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Perimeter GeoJson Success",
          });
          res.status(200).json(results[0].geojson);
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Perimeter GeoJson Success",
          });
          res.status(200).json(results);
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Sensor Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "Perimeter GeoJson Failed",
        });
        res.status(400).json({ error: true, message: error.message, statusCode: 400 });
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
      sub_module: "Sensor Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "Perimeter GeoJson Failed",
    });
    res.status(500).json({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Get Sensors GeoJson
exports.getSensorsJson = async (req, res, next) => {
  try {
    let sensor_type = req.query.sensor_type;
    let customQuery = `SELECT json_build_object('type', 'FeatureCollection', 'features', json_agg(ST_AsGeoJSON(s.*)::json)) AS geojson
        FROM (SELECT sensor_id as id, sensor_location as sensor_id, sensor_type, current_status, ip, mac_address, height, 
        installed_on, zone_id, azimuth FROM sensors ORDER BY id ASC) AS s(sensor_id)`;
    if (sensor_type) {
        customQuery = `SELECT json_build_object('type', 'FeatureCollection', 'features', json_agg(ST_AsGeoJSON(s.*)::json)) AS geojson
        FROM (SELECT sensor_id as id, sensor_location as sensor_id, sensor_type, current_status, ip, mac_address, height, 
        installed_on, zone_id, azimuth FROM sensors WHERE sensor_type IN (${str(sensor_type)}) ORDER BY id ASC) AS s(sensor_id)`;
    }
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Sensor GeoJson Success",
          });
          res.status(200).json(results[0].geojson);
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Sensor GeoJson Success",
          });
          res.status(200).json(results);
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Sensor Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "Sensor GeoJson Failed",
        });
        res.status(400).json({ error: true, message: error.message, statusCode: 400 });
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
      sub_module: "Sensor Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "Sensor GeoJson Failed",
    });
    res.status(500).json({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Retrieve all data from the database.

exports.paramHeader = (req, response, next) => {
  response.send(configParams);
};

exports.findAll = async (req, res, next) => {
  try {
    const customQuery = `select * from sensors order by sensor_id desc`;
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Sensor FindAll Success",
          });
          res.status(200).send({
            error: false,
            data: results,
            statusCode: 200,
            header: configParams,
          });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Sensor FindAll Success",
          });
          res.status(200).send({
            error: false,
            data: [],
            statusCode: 200,
            header: configParams,
          });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Sensor Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "Sensor FindAll Error",
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
      sub_module: "Sensor Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "Sensor FindAll Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

exports.sensorHealth = (req, res, next) => {
  // console.log("-----sensorHealth-----", req.body);
  let type = undefined;
  if (req.body.name == "EOIR") {
    type = "EOIR";
  }
  else{
    type = req.body.name;
  }
  let data = {
    origin: type,
    type: "notification",
    id: req.body.hardware_id,
    category: "health",
    data: {
      sensor_type: type,
      hardware_id: req.body.hardware_id,
      error_data: req.body.message,
    },
  };
  sendDataToUI(data);
  log.createLog({
    type: "info",
    root_module: "MCCS",
    sub_module: "Sensor Service",
    method: new Error().stack.split("\n")[1].trim(),
    log_message: "SensorHealth Received",
  });
  //notification
  res.send("received");
};

function sendDataToUI(data) {
  console.log(env.base_url);
  var options = {
    json: true,
    url: env.base_url + `/notification/persist`,
    body: data,
    method: "post",
  };
  request(options, (error, response, body) => {});
}

//////////////////////////////////////////////////////////////////////////////////////
const dgram = require('dgram');
const udpClient = dgram.createSocket('udp4');
//const log = require("./../utils/log");

// 1. CONFIGURATION
const CAMERA_PORT = 5000; 
const PAN_OFFSET = -5.0;  
const TILT_OFFSET = 0.0; 

// 2. LOGGING THE ESTABLISHMENT / RESPONSE
// This will trigger when the camera replies to your command
udpClient.on('message', (msg, rinfo) => {
    const ack = msg.toString('hex').toUpperCase();
    const logMsg = `Camera response from ${rinfo.address}:${rinfo.port} -> DATA: ${ack}`;
    console.log(logMsg);
    
    // Write to your database/file logs
    log.createLog({
        type: "info",
        root_module: "MCCS",
        sub_module: "Camera_Interface",
        log_message: logMsg
    });
});

// Capture socket errors (e.g., if the network is down)
udpClient.on('error', (err) => {
    console.error(`Socket Error: ${err.stack}`);
    udpClient.close();
});

// 3. HELPER FUNCTIONS (Stay the same)
function toProwlBinary(degrees) {
    let millidegrees = Math.floor(degrees * 1000);
    let magnitude = Math.abs(millidegrees);
    if (millidegrees < 0) magnitude = (magnitude >>> 0) | 0x80000000;
    const buf = Buffer.alloc(4);
    buf.writeUInt32BE(magnitude >>> 0); 
    return buf;
}

function buildProwlFrame(deviceId, dataBuffer) {
    const frame = Buffer.alloc(14);
    frame.writeUInt8(0xE0, 0);               
    frame.writeUInt16BE(Math.floor(Math.random() * 60000), 1); 
    frame.writeUInt8(deviceId, 3);           
    frame.writeUInt8(0x00, 4);               
    frame.writeUInt8(0x07, 5);               
    frame.writeUInt8(0x57, 6);               
    frame.writeUInt16BE(0x0009, 7);          
    dataBuffer.copy(frame, 9);               

    let checksum = 0;
    for (let i = 3; i < 13; i++) checksum = (checksum + frame[i]) % 256;
    frame.writeUInt8(checksum, 13);
    return frame;
}

// 4. THE ROUTE
exports.PTZControl = (req, res, next) => {
    const { ip, pan, tilt, type } = req.query;
    console.log("trying to control ptz")

    if (!ip) return res.status(400).send("Camera IP is required");

    
        try {
            // Note: UDP is 'fire and forget'. We log the attempt here.
            if (pan !== undefined) {
                const pFrame = buildProwlFrame(0x10, toProwlBinary(parseFloat(pan) + PAN_OFFSET));
                udpClient.send(pFrame, CAMERA_PORT, ip, (err) => {
                    if (err) console.error(`Failed to send Pan to ${ip}`, err);
                });
            }
            if (tilt !== undefined) {
                const tFrame = buildProwlFrame(0x11, toProwlBinary(parseFloat(tilt) + TILT_OFFSET));
                udpClient.send(tFrame, CAMERA_PORT, ip, (err) => {
                    if (err) console.error(`Failed to send Tilt to ${ip}`, err);
                });
            }

            return res.status(200).json({ 
                status: "Success", 
                message: `Commands dispatched to ${ip}:${CAMERA_PORT}` 
            });
        } catch (err) {
            return res.status(500).send("Internal PTZ Logic Error");
        }
    res.send("Standard PTZ triggered");
};


// exports.PTZControl = (req, res, next) => {
//   let query = "query=" + req.query.query;
//   query = query + "&camera=" + req.query.camera;
//   if (req.query.zoom != undefined) {
//     query = query + "&zoom=" + req.query.zoom;
//   }
//   if (req.query.tilt != undefined) {
//     query = query + "&tilt=" + req.query.tilt;
//   }
//   if (req.query.pan != undefined) {
//     query = query + "&pan=" + req.query.pan;
//   }
//   //    console.log(query, req.query.ip)
//   request.get(
//     "http://" + req.query.ip + "/axis-cgi/com/ptz.cgi?" + query,
//     (error, response, body) => {
//       // console.log(response,error)
//     }
//   );
//   log.createLog({
//     type: "info",
//     root_module: "MCCS",
//     sub_module: "Sensor Service",
//     method: new Error().stack.split("\n")[1].trim(),
//     log_message: "PTZControl Received",
//   });
//   res.send("received");
// };

// setInterval(function(){
//     let dataexports.PTZControl = (req, res, next) => {
//   let query = "query=" + req.query.query;
//   query = query + "&camera=" + req.query.camera;
//   if (req.query.zoom != undefined) {
//     query = query + "&zoom=" + req.query.zoom;
//   }
//   if (req.query.tilt != undefined) {
//     query = query + "&tilt=" + req.query.tilt;
//   }
//   if (req.query.pan != undefined) {
//     query = query + "&pan=" + req.query.pan;
//   }
//   //    console.log(query, req.query.ip)
//   request.get(
//     "http://" + req.query.ip + "/axis-cgi/com/ptz.cgi?" + query,
//     (error, response, body) => {
//       // console.log(response,error)
//     }
//   );
//   log.createLog({
//     type: "info",
//     root_module: "MCCS",
//     sub_module: "Sensor Service",
//     method: new Error().stack.split("\n")[1].trim(),
//     log_message: "PTZControl Received",
//   });
//   res.send("received");
// }; = { "origin": "EOIR", type: "notification", id: "EOIR1", category: "health", data: { "sensor_type": "EOIR", "sensor_id": "EOIR1", "error_data": "camera_problem" } };
//     sendDataToUI(data)
// },2000)

// Create sensor data into the database.
exports.create = async (req, res, next) => {
  try {
    if (req.body.longitude && req.body.latitude) {
      req.body.sensor_location =
        "SRID=4326;POINT(" + req.body.longitude + " " + req.body.latitude + ")";
      delete req.body.longitude;
      delete req.body.latitude;
    }
    if (req.body.hasOwnProperty("icon")) {
      delete req.body.icon;
    }
    if (req.body.hasOwnProperty("location_marker")) {
      delete req.body.location_marker;
    }
    if (req.body.hasOwnProperty("sensor_id")) {
      delete req.body.sensor_id;
    }

    let sensorColumns = `${Object.keys(req.body)
      .map((key) => `${ident(key)}`)
      .join(", ")}`;
    let sensorValues = `${Object.keys(req.body)
      .map((key) => `${str(req.body[key])}`)
      .join(", ")}`;
    const customQuery = `insert into sensors (${sensorColumns}) values (${sensorValues})`;

    await db.createWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Create Success",
          });
          res
            .status(200)
            .send({ error: false, body: results, statusCode: 200 });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Create Success",
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
          sub_module: "Sensor Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "Create Failed",
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
      sub_module: "Sensor Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "Create Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Update sensor data into the database.
exports.update = async (req, res, next) => {
  try {
    if (req.body.longitude && req.body.latitude) {
      req.body.sensor_location =
        "SRID=4326;POINT(" + req.body.longitude + " " + req.body.latitude + ")";
      delete req.body.longitude;
      delete req.body.latitude;
    }
    if (req.body.hasOwnProperty("icon")) {
      delete req.body.icon;
    }
    if (req.body.hasOwnProperty("location_marker")) {
      delete req.body.location_marker;
    }
    let finalUpdatedData = `${Object.keys(req.body)
      .map((key) => `${ident(key)} ` + "=" + ` ${str(req.body[key])}`)
      .join(", ")}`;
    const customQuery = `update sensors set ${finalUpdatedData} where sensor_id = ${num(req.body.sensor_id)}`;
    await db.updateWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Update Success",
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
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Update Success",
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
          sub_module: "Sensor Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "Update Error",
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
      sub_module: "Sensor Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "Update Error",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Update status of sensor into the database.
exports.statusUpdate = async (req, res, next) => {
  try {
    let customQuery;
    if (req.body && req.body.status === 2) {
      customQuery = `delete from sensors where sensor_id = ${num(req.body.id)} RETURNING sensor_id`;
      await db.deleteWithQuery(customQuery).then(
        (results) => {
          console.log(results)
          if (results && results.length) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Sensor Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "StatusUpdate Success",
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
              sub_module: "Sensor Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "StatusUpdate Unable to Delete",
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
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message || "StatusUpdate Error",
          });
          res
            .status(400)
            .send({ error: true, message: error.message, statusCode: 400 });
        }
      );
    } else {
      customQuery = `update sensors set current_status = ${num(req.body.status)} where sensor_id = ${num(req.body.id)}`;
      await db.updateWithQuery(customQuery).then(
        (results) => {
          if (results && results.length) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Sensor Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "StatusUpdate Update Success",
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
              sub_module: "Sensor Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "StatusUpdate Update Success",
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
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message || "StatusUpdate Update Error",
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
      sub_module: "Sensor Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "StatusUpdate Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Retrieve all data from the database.
exports.getDiagnosticsData = async (req, res, next) => {
  try {
    const customQuery = `SELECT s.*, n.sensor_key, n.origin, n.error_data FROM sensors s
                          JOIN (
                                SELECT DISTINCT ON (sensor_key) sensor_key, origin, (data ->'error_data')::text as error_data
                                FROM notification WHERE ARRAY_LENGTH(cleared_by, 1) IS NULL OR ARRAY_LENGTH(cleared_by, 1) < 1
                                ORDER BY sensor_key, time DESC
                              ) n
                          ON s.ip = n.sensor_key
                          INNER JOIN zone z ON s.zone_id = z.zone_id and s.current_status = false and z.current_status = true`;
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetDiagnosticsData Success",
          });
          res
            .status(200)
            .send({ error: false, data: results, statusCode: 200 });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetDiagnosticsData Success",
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
          sub_module: "Sensor Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "GetDiagnosticsData Error",
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
      sub_module: "Sensor Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "GetDiagnosticsData Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Update Diagnostics Data
exports.updateDiagnostics = (req, res, next) => {
  updateDiagnosticsApi(req, res, next);
};

// Insert/Update system config
exports.systemConfig = async (req, res, next) => {
  try {
    if (!req.body.isUpdate) {
      let customQuery = `insert into system_configuration(sensors, role, updated_time) values (${str(req.body.sensors.join())}, ${
        req.body.role
      }, now())`;
      await db.createWithQuery(customQuery).then(
        (results) => {
          if (results && results.length) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Sensor Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "SystemConfig Success",
            });
            res
              .status(200)
              .send({ error: false, data: results, statusCode: 200 });
          } else {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Sensor Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "SystemConfig Success",
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
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message || "SystemConfig Error",
          });
          res
            .status(400)
            .send({ error: true, message: error.message, statusCode: 400 });
        }
      );
    } else if (req.body.isUpdate && req.body.id) {
      let customQuery = `UPDATE system_configuration SET sensors = ${str(req.body.sensors.join())}, role=${num(req.body.role)}, updated_time=now() WHERE config_id = ${num(req.body.id)}`;
      await db.updateWithQuery(customQuery).then(
        (results) => {
          if (results && results.length) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Sensor Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "SystemConfig updated success",
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
              sub_module: "Sensor Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "SystemConfig updated success",
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
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message || "SystemConfig updated error",
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
      sub_module: "Sensor Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "SystemConfig updated Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Get Sensors
exports.getSensors = async (req, res, next) => {
  try {
    const customQuery = "select * from sensors";
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetSensors Success",
          });
          res
            .status(200)
            .send({ error: false, data: results, statusCode: 200 });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetSensors Success",
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
          sub_module: "Sensor Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "GetSensors Error",
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
      sub_module: "Sensor Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "GetSensors Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// System Configuration
exports.getConfiguration = async (req, res, next) => {
  try {
    const customQuery = "select * from system_configuration";
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetConfiguration Success",
          });
          res
            .status(200)
            .send({ error: false, data: results, statusCode: 200 });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetConfiguration Success",
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
          sub_module: "Sensor Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "GetConfiguration Error",
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
      sub_module: "Sensor Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "GetConfiguration Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Syatem Connections
exports.connectionStatus = async (req, res, next) => {
  try {
    if (
      req.body.ip &&
      req.body.status &&
      (req.body.status.replace(/\s/g, "").toLowerCase() === "dead" ||
        req.body.status.replace(/\s/g, "").toLowerCase() === "disconnected" ||
        req.body.status.replace(/\s/g, "").toLowerCase() === "notconnected")
    ) {
      const customQuery = `update sensors set current_status=false where ip = ${str(req.body.ip)}`;

      await db.updateWithQuery(customQuery).then(
        (results) => {
          if (results && results.length) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Sensor Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "ConnectionStatus Successfully updated",
            });
            res.status(200).send({
              error: false,
              data: results,
              message: "Successfully updated",
              statusCode: 200,
            });
          } else {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Sensor Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "ConnectionStatus Successfully updated",
            });
            res.status(304).send({
              error: false,
              data: results,
              message: "Successfully updated",
              statusCode: 304,
            });
          }
        },
        (error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message || "ConnectionStatus Error",
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
        sub_module: "Sensor Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: "Ip and status is required",
      });
      res.send({
        error: true,
        status: false,
        message: "Ip and status is required",
      });
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
      sub_module: "Sensor Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "ConnectionStatus Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

exports.getSystemMappedConfig = async (req, res, next) => {
  try {
    let customQuery = `select * from system_mapped_config`;
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Data retrieved successfully",
          });
          res.status(200).send({
            error: false,
            data: results,
            message: "Data retrieved successfully",
            statusCode: 200,
          });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Data retrieved successfully",
          });
          res.status(204).send({
            error: false,
            data: results,
            message: "Data retrieved successfully",
            statusCode: 204,
          });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Sensor Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "Data retrieved Error",
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
      sub_module: "Sensor Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "Data retrieved Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Insert/Update system mapped config
exports.systemMappedConfig = async (req, res, next) => {
  try {
    if (!req.body.isUpdate) {
      let customQuery = `
            insert into system_mapped_config(zone_id, radar_id, ti_id, ugv_id, uav_id)
            values ${req.body.selected_options
              .map(
                (item) =>
                  `(${str(item.zone_id)}, ${num(item.radar_id)}, ${num(item.ti_id)}, ${num(item.ugv_id)}, ${num(item.uav_id)})`
              )
              .join(",")}`;

      await db.createWithQuery(customQuery).then(
        (results) => {
          if (results && results.length) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Sensor Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "SystemMappedConfig successfully saved",
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
              sub_module: "Sensor Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "SystemMappedConfig successfully saved",
            });
            res.status(204).send({
              error: false,
              data: results,
              message: "Successfully Saved",
              statusCode: 204,
            });
          }
        },
        (error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message || "SystemMappedConfig error",
          });
          res
            .status(400)
            .send({ error: true, message: error.message, statusCode: 400 });
        }
      );
    } else if (req.body.isUpdate && req.body.id) {
      let updatedData = `${Object.keys(req.selected_options)
        .map((key) => `${ident(key)} ` + "=" + ` ${str(req.body[key])}`)
        .join(", ")}`;
      let customQuery = `UPDATE system_mapped_config set ${updatedData} WHERE id = ${num(req.body.id)}`;

      await db.updateWithQuery(customQuery).then(
        (results) => {
          if (results && results.length) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Sensor Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "SystemMappedConfig successfully updated",
            });
            res.status(200).send({
              error: false,
              data: results,
              message: "Successfully updated",
              statusCode: 200,
            });
          } else {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Sensor Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "SystemMappedConfig successfully updated",
            });
            res.status(304).send({
              error: false,
              data: results,
              message: "Successfully updated",
              statusCode: 304,
            });
          }
        },
        (error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message || "SystemMappedConfig error",
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
      sub_module: "Sensor Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "SystemMappedConfig Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Ping IP Address
exports.pingIp = (req, response, next) => {
  const ipAddress = req.body.ip;
  if (ipAddress) {
    let ipIsAlive = false;
    ping.sys.probe(ipAddress, function (isAlive) {
      ipIsAlive = isAlive ? true : false;
      const msg = ipIsAlive ? "Host is alive" : "Host is not alive";
      log.createLog({
        type: !ipIsAlive ? "error" : "info",
        root_module: "MCCS",
        sub_module: "Sensor Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: msg,
      });
      response.send({
        error: !ipIsAlive ? true : false,
        status: isAlive,
        message: msg,
      });
    });
  } else {
    log.createLog({
      type: "error",
      root_module: "MCCS",
      sub_module: "Sensor Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: "IP address is required",
    });
    response.send({
      error: true,
      status: false,
      message: "IP address is required",
    });
  }
};

// Update Diagnostic Data Api Call
async function updateDiagnosticsApi(req, res, next) {
  try {
    if (req.body.type !== "configuration") {
      if (req.body.data && req.body.data.length) {
        if (req.body.diagnosticsData) {
          if (req.body.data[req.body.diagnosticsData.length]) {
            req.body.diagnosticsData.push(
              req.body.data[req.body.diagnosticsData.length]
            );
            const customQuery = `update sensors set current_status=false where sensor_id = ${str(req.body.data[req.body.diagnosticsData.length])}`;
            await db.updateWithQuery(customQuery).then(
              (results) => {
                if (results && results.length) {
                  updateDiagnosticsApi(req, res, next);
                }
              },
              (error) => {
                log.createLog({
                  type: "error",
                  root_module: "MCCS",
                  sub_module: "Sensor Service",
                  method: new Error().stack.split("\n")[1].trim(),
                  log_message: error.message || "UpdateDiagnosticsApi Error",
                });
                res.status(400).send({
                  error: true,
                  message: error.message,
                  statusCode: 400,
                });
              }
            );
          } else {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Sensor Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "UpdateDiagnosticsApi Successfully updated",
            });
            res.status(200).send({
              error: false,
              data: [],
              message: "Successfully updated",
              statusCode: 200,
            });
          }
        } else {
          req.body.diagnosticsData = [req.body.data[0]];
          // const customQuery = `update zone set current_status=false where zone_id = ${str(req.body.data[0])}`;
          const customQuery = `update sensors set current_status=true where sensor_id = ${str(req.body.data[0])}`;
          await db.updateWithQuery(customQuery).then(
            (results) => {
              if (results && results.length) {
                updateDiagnosticsApi(req, res, next);
              }
            },
            (error) => {
              log.createLog({
                type: "error",
                root_module: "MCCS",
                sub_module: "Sensor Service",
                method: new Error().stack.split("\n")[1].trim(),
                log_message: error.message || "UpdateDiagnosticsApi Error",
              });
              res
                .status(400)
                .send({ error: true, message: error.message, statusCode: 400 });
            }
          );
        }
      } else {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Sensor Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: err.message || "UpdateDiagnosticsApi Failed",
        });
        res.status(500).send({
          error: true,
          status: true,
          message: "Sensor is required",
          statusCode: 500,
        });
      }
    } else {
      var query = `update sensors set sensor_type = ${str(req.body.data.sensor_type)}, sensor_location = 'SRID=4326;POINT(${num(req.body.data.long)} ${num(req.body.data.lat)})', current_status = ${num(req.body.data.current_status)}, ip = ${str(req.body.data.ip)}, mac_address = ${str(req.body.data.mac_address)}, password = ${str(req.body.data.password)}`;
      if (req.body.data.azimuth) {
        query += ` ,azimuth = ${num(req.body.data.azimuth)}`;
      }
      var customQuery =
        query + ` where sensor_id = ${num(req.body.data.sensor_id)}`;
      await db.updateWithQuery(customQuery).then(
        (results) => {
          if (results && results.length) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Sensor Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "UpdateDiagnosticsApi Successfully updated",
            });
            res.status(200).send({
              error: false,
              data: results,
              message: "Successfully updated",
              statusCode: 200,
            });
          } else {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Sensor Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "UpdateDiagnosticsApi Successfully updated",
            });
            res.status(200).send({
              error: false,
              data: results,
              message: "Successfully updated",
              statusCode: 200,
            });
          }
        },
        (error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message || "UpdateDiagnosticsApi Error",
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
      sub_module: "Sensor Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "UpdateDiagnosticsApi Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
}

exports.getSensorsMappedConfig = async (req, res, next) => {
  try {
    let customQuery;
    if (req.body.column === "zone_id" && req.body.type === "uav") {
      customQuery = `SELECT ua.* FROM uav ua 
                INNER JOIN system_mapped_config smc ON ua.zone_id = smc.zone_id 
                where smc.zone_id = ${str(req.body.zone_id)}`;
    } else if (req.body.column === "zone_id" && req.body.type === "ugv") {
      customQuery = `SELECT ug.* FROM ugv ug 
                INNER JOIN system_mapped_config smc ON ug.zone_id = smc.zone_id 
                where smc.zone_id = ${str(req.body.zone_id)}`;
    } else {
      customQuery = `select * from sensors where sensor_id in 
            (
                SELECT smc.${ident(req.body.column)} FROM sensors sr 
                INNER JOIN system_mapped_config smc ON sr.sensor_id = smc.radar_id 
                where sr.ip = ${str(req.body.ip)}
            )`;
    }
    //  console.log("---customQuery-----", customQuery);
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetSensorsMappedConfig Data retrieved successfully",
          });
          res.status(200).send({
            error: false,
            data: results[0],
            message: "Data retrieved successfully",
            statusCode: 200,
          });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetSensorsMappedConfig Data retrieved successfully",
          });
          res.status(200).send({
            error: false,
            data: [],
            message: "Data retrieved successfully",
            statusCode: 200,
          });
        }
      },
      (error) => {
        log.createLog({
          type: "info",
          root_module: "MCCS",
          sub_module: "Sensor Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "GetSensorsMappedConfig Error",
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
      sub_module: "Sensor Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "GetSensorsMappedConfig Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

exports.getSensorConfig = async (req, res, next) => {
  try {
    let customQuery = `select * from sensors where ip = inet(${str(req.body.ip)})`;
    // console.log("---customQuery-----", customQuery);
    await db.selectWithQuery(customQuery).then(
      (results) => {
        // console.log(results)
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetSensorConfig Data retrieved successfully",
          });
          res.status(200).send({
            error: false,
            data: results[0],
            message: "Data retrieved successfully",
            statusCode: 200,
          });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Sensor Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetSensorConfig Data retrieved successfully",
          });
          res.status(200).send({
            error: false,
            data: [],
            message: "Data retrieved successfully",
            statusCode: 200,
          });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Sensor Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "GetSensorConfig Error",
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
      sub_module: "Sensor Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "GetSensorConfig Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Read excel file and convert data into json format
exports.sensorsTemplateUpload = async (req, res, next) => {
  let exceltojson;
  upload(req, res, function (err) {
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
        sub_module: "Sensor Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: err.message || "SensorsTemplateUpload Failed",
      });
      res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
    }
    /** Multer gives us file info in req.file object */
    if (!req.file) {
      res.errorCode = 500;
      res.errorInfo = {
        error: true,
        status: "failed",
        message: err.message || "Please provide file",
      };
      log.createLog({
        type: "error",
        root_module: "MCCS",
        sub_module: "Sensor Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: err.message || "SensorsTemplateUpload Please provide file",
      });
      res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
    }
    /** Check the extension of the incoming file and
     *  use the appropriate module
     */
    if (
      req.file.originalname.split(".")[
        req.file.originalname.split(".").length - 1
      ] === "xlsx"
    ) {
      exceltojson = xlsxtojson;
    } else {
      exceltojson = xlstojson;
    }
    try {
      exceltojson(
        {
          input: req.file.path,
          output: null, //since we don't need output.json
          lowerCaseHeaders: true,
        },
        function (err, result) {
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
              sub_module: "Sensor Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: err.message || "SensorsTemplateUpload Failed",
            });
            res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
          }

          let values = result
            .filter((item, key) => {
              if (item.longitude && item.latitude) {
                item.sensor_location =
                  "SRID=4326;POINT(" +
                  item.longitude +
                  " " +
                  item.latitude +
                  ")";
                delete item.longitude;
                delete item.latitude;
                return item;
              } else {
                return item;
              }
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

          const customQuery = `INSERT INTO sensors (password, sensor_type, zone_id, ip, port, mac_address, azimuth, height, username, sensor_location) VALUES ${values}`;
          db.createWithQuery(customQuery).then(
            (results) => {
              if (results && results.length) {
                log.createLog({
                  type: "info",
                  root_module: "MCCS",
                  sub_module: "Sensor Service",
                  method: new Error().stack.split("\n")[1].trim(),
                  log_message: "SensorsTemplateUpload Success",
                });
                res
                  .status(200)
                  .send({ error: false, message: "File uploaded successfully", body: results, statusCode: 200 });
              } else {
                log.createLog({
                  type: "info",
                  root_module: "MCCS",
                  sub_module: "Sensor Service",
                  method: new Error().stack.split("\n")[1].trim(),
                  log_message: "SensorsTemplateUpload Success",
                });
                res
                  .status(204)
                  .send({ error: false, message: "File uploaded successfully", data: results, statusCode: 204 });
              }
            },
            (error) => {
              log.createLog({
                type: "error",
                root_module: "MCCS",
                sub_module: "Sensor Service",
                method: new Error().stack.split("\n")[1].trim(),
                log_message: error.message || "SensorsTemplateUpload Error",
              });
              res
                .status(400)
                .send({ error: true, message: error.message, statusCode: 400 });
            }
          );
        }
      );
    } catch (e) {
      res.errorCode = 500;
      res.errorInfo = {
        error: true,
        status: "failed",
        message: err.message || "Corupted excel file",
      };
      log.createLog({
        type: "error",
        root_module: "MCCS",
        sub_module: "Sensor Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: err.message || "SensorsTemplateUpload Corupted excel file",
      });
      res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
    }
  });
};
