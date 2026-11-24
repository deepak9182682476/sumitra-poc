const env = require("../config/env");
const { str, num, ident, numList } = require("../utils/sqlSafe"); // SQL-injection safe values
const db = require("../controllers/db");
const request = require("request");
const log = require("../utils/log");

// Create visitor entry data into the database.
exports.create = async (req, res, next) => {
  try {
    let visitorInfo = {
      aadhaarNumber: req.body.aadhaarNumber ? req.body.aadhaarNumber : null,
      visitorName: req.body.visitorName,
      mobileNo: req.body.mobileNo,
      photo: req.body.photo ? req.body.photo: null,
      vehicleNo: req.body.vehicleNo,
      thingsAlong: req.body.thingsAlong,
      entryReason: req.body.entryReason
    };

    const customQuery = `insert into visitors_info(aadhaar_number, name, mobile, photo, vehicle_no, things_along, reason, entry_time) values(${str(visitorInfo.aadhaarNumber)}, ${str(visitorInfo.visitorName)}, ${str(visitorInfo.mobileNo)}, ${str(visitorInfo.photo)}, ${str(visitorInfo.vehicleNo)}, ${str(visitorInfo.thingsAlong)}, ${str(visitorInfo.entryReason)}, now())`;
    await db.createWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "MainGate Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Create Success",
          });
          res
            .status(200)
            .send({ error: false, data: results, statusCode: 200 });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "MainGate Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Create Success",
          });
          res.status(204).send({ error: false, data: [], statusCode: 204 });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "MainGate Service",
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
      type: "info",
      root_module: "MCCS",
      sub_module: "MainGate Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "Create Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Get All Cameras Info
exports.camerasList = async (req, res, next) => {
  try {
    const customQuery = `select * from camera_info order by id asc`;
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "MainGate Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "CamerasList Success",
          });
          res
            .status(200)
            .send({ error: false, data: results, statusCode: 200 });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "MainGate Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "CamerasList Success",
          });
          res.status(200).send({ error: false, data: [], statusCode: 200 });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "MainGate Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "CamerasList Failed",
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
      sub_module: "MainGate Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "CamerasList Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Update camera data into the database.
exports.cameraUpdate = async (req, res, next) => {
  try {
    const customQuery = `update camera_info set ip = ${str(req.body.ip)}, url = ${str(req.body.url)}, name = ${str(req.body.name)} where id = ${num(req.body.id)}`;
    await db.updateWithQuery(customQuery).then(
      (results) => {
        if (results) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "MainGate Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "CameraUpdate Success",
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
            sub_module: "MainGate Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "CameraUpdate Success",
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
          sub_module: "MainGate Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "CameraUpdate Failed",
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
      sub_module: "MainGate Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "CameraUpdate Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};
