const { response } = require("express");
const { str, num, ident, numList } = require("../utils/sqlSafe"); // SQL-injection safe values
const request = require("request");
const env = require("../config/env");
const db = require("../controllers/db");
const log = require("./../utils/log");

var notificationsList = [];

exports.persist = async (req, res, next) => {
  try {
    let notify_data = req.body;
    let customQuery = `insert into notification (type, origin, sensor_key, data, time) values 
    ('notification', ${str(notify_data.origin)}, ${str(notify_data.data.hardware_id)}, ${str(JSON.stringify(notify_data.data))}, now()) returning id`;
    db.createWithQuery(customQuery)
      .then((result) => {
        notify_data.id = result[0][0].id;
        
        // set current status in sensor table as sensor got error
        let sensorQuery = `update sensors set current_status=false where ip = ${str(notify_data.data.hardware_id)}`;
        db.updateWithQuery(sensorQuery).then((results) => {});

        //sending the notification to UI
        // console.log(result, "sending the data to ui", notify_data);
        sendNotificationToUI(notify_data).then((response) => {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Notification Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Notification Persist Success",
          });
          res.status(200).send(result);
        });
      })
      .catch((err) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Notification Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: err || "Notification Persist Error",
        });
        res.send({ error: true, message: err, statusCode: 500 });
      });
  } catch (err) {
    console.log(err);
    res.errorCode = 500;
    res.errorInfo = {
      error: true,
      status: "failed",
      message: err.message || "Error occurred.. Please try later.",
    };
    // next(res);
    log.createLog({
      type: "error",
      root_module: "MCCS",
      sub_module: "Notification Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "Notification Persist Error",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

function sendNotificationToUI(data) {
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
          type: "success",
          root_module: "MCCS",
          sub_module: "Notification Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: "SendNotificationUI Success",
        });
        resolve(body);
      } else {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Notification Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error || "SendNotificationUI Error",
        });
        reject(error);
      }
    });
  });
}

/* var count = 0;
setInterval(() => {
    if (count == 0) {
        // sendNotificationToUI({"sensor_id":"RADAR_1","sensor_type":"UAV","error_data":"RADAR"});
    } else if (count == 1) {
        sendNotificationToUI({ "sensor_id": "UAV_1", "sensor_type": "UAV", "error_data": "UAV1  low battery" });
    } else if (count == 2) {
        count = 0;
        sendNotificationToUI({ "sensor_id": "UGV_1", "sensor_type": "UGV", "error_data": "UGV-1 - Hot" });
    }
    count++;

}, 5000); */

exports.findAll = async (req, res, next) => {
  try {
    const customQuery = `SELECT * FROM notification ORDER BY id DESC`;
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Notification Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Notifications retreived successfully",
          });
          res.status(200).send({
            error: false,
            data: results,
            message: "Notifications retreived successfully",
            statusCode: 200,
          });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Notification Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Notifications retreived successfully",
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
          sub_module: "Notification Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "Notifications retreived Failed",
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
      sub_module: "Notification Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "Notifications retreived Failed",
    });
    // next(res);
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Change Notification Status into the database.
exports.changeStatus = async (req, res, next) => {
  try {
    let customQuery;
    if (req && req.body && req.body.status === 1) {
      customQuery = `update notification set read_by = array_append(read_by,${num(req.body.user_id)}) where id = ${num(req.params.id)}`;
    } else {
      customQuery = `update notification set cleared_by = array_append(cleared_by,${num(req.body.user_id)}) where id = ${num(req.params.id)}`;
    }
    await db.updateWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Notification Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Notifications ChangeStatus Success",
          });
          res.status(200).send({
            error: false,
            data: results,
            message: "Notifications retreived successfully",
            statusCode: 200,
          });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Notification Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Notifications ChangeStatus Success",
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
          sub_module: "Notification Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "Notifications ChangeStatus Error",
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
      sub_module: "Notification Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "Notifications ChangeStatus Error",
    });
    // next(res);
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};
