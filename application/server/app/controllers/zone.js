const env = require("../config/env");
const db = require("../controllers/db");
const request = require("request");
const log = require("../utils/log");

// Retrieve all data from the database.
exports.findAll = async (req, res, next) => {
  try {
    const customQuery = `SELECT z.zone_priority, json_build_object(
            'type', 'FeatureCollection',
            'features', json_agg(ST_AsGeoJSON(z.*)::json)
        ) AS geojson
        FROM (
            SELECT zone_id, zone_shape, zone_type, 'true' as checked,
            zone_area, current_status, zone_priority, radius FROM zone
        ) AS z(zone_area) GROUP BY z.zone_priority`;
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Zone Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Zone FindAll Success",
          });
          res
            .status(200)
            .send({ error: false, data: results, statusCode: 200 });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Zone Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Zone FindAll Success",
          });
          res.status(204).send({ error: false, data: [], statusCode: 204 });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Zone Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "Zone FindAll Failed",
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
      sub_module: "Zone Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "Zone FindAll Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Create zones
exports.create = async (req, res, next) => {
  try {
    const zone_area = req.body.zone_area[0]
      .map((position) => {
        return `${position[0]} ${position[1]}`;
      })
      .join(", ");
    const customQuery = `INSERT INTO ZONE (Zone_Type, Zone_Area, Zone_Priority, Current_Status, Zone_Shape, radius) VALUES ('${req.body.zone_type}', ST_AsText(ST_Multi(ST_GeomFromText('POLYGON((${zone_area}))'))), ${req.body.zone_priority}, '${req.body.current_status}', '${req.body.zone_shape}', ${req.body.zone_radius})`;
    await db.createWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Zone Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Zone Create Success",
          });
          res
            .status(200)
            .send({ error: false, data: results, statusCode: 200 });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Zone Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Zone Create Success",
          });
          res.status(204).send({ error: false, data: [], statusCode: 204 });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Zone Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "Zone Create Failed",
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
      sub_module: "Zone Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "Zone Create Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Enable or disable of zone into the database.
exports.enableDisableZone = (req, response, next) => {
  const sensorsPromise = new Promise((resolve, reject) => {
    const customQuery = `update sensors set current_status = ${req.body.status} where zone_id = '${req.body.zone_id}'`;
    db.updateWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Zone Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "EnableDisable Zone Success",
          });
          resolve(results);
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Zone Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "EnableDisable Zone Success",
          });
          resolve();
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Zone Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error || "EnableDisable Zone Failed",
        });
        resolve(error);
      }
    );
  });

  const ugvsPromise = new Promise((resolve, reject) => {
    const customQuery = `update ugv set current_status = ${req.body.status} where zone_id = '${req.body.zone_id}'`;
    db.updateWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Zone Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "UgvsPromise Success",
          });
          resolve(results);
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Zone Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "UgvsPromise Success",
          });
          resolve();
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Zone Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error || "UgvsPromise Failed",
        });
        resolve(error);
      }
    );
  });

  const uavsPromise = new Promise((resolve, reject) => {
    const customQuery = `update uav set current_status = ${req.body.status} where zone_id = '${req.body.zone_id}'`;
    db.updateWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Zone Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "UavsPromise Success",
          });
          resolve(results);
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Zone Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "UavsPromise Success",
          });
          resolve();
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Zone Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error || "UavsPromise Error",
        });
        resolve(error);
      }
    );
  });

  const zonesPromise = new Promise((resolve, reject) => {
    const customQuery = `update zone set current_status = ${req.body.status} where zone_id = '${req.body.zone_id}'`;
    db.updateWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Zone Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "ZonesPromise Success",
          });
          resolve(results);
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Zone Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "ZonesPromise Success",
          });
          resolve();
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Zone Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error || "ZonesPromise Error",
        });
        resolve(error);
      }
    );
  });

  Promise.all([sensorsPromise, ugvsPromise, uavsPromise, zonesPromise])
    .then((result) => {
      response.send(result);
    })
    .catch((error) => {
      log.createLog({
        type: "error",
        root_module: "MCCS",
        sub_module: "Zone Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: error || "PromiseAll Error",
      });
      next(error);
    });
};

// Common Error Handler
var errorHandler = function (message) {
  return {
    error: true,
    status: "failed",
    message: message || "Error occurred.. Please try later.",
  };
};


// Delete one zone: DELETE /api/zone/:id
exports.deleteZone = async (req, res, next) => {
  const id = String(req.params.id || "").trim();
  if (!/^\d+$/.test(id)) {
    return res.status(400).send({ error: true, message: "invalid zone id", statusCode: 400 });
  }
  try {
    const sequelize = require("../models").sequelize; // lazy (see models/index.js)
    const rows = await sequelize.query(`DELETE FROM zone WHERE zone_id = :id RETURNING zone_id`,
      { replacements: { id }, type: sequelize.QueryTypes.SELECT });
    if (!rows || !rows.length) {
      return res.status(404).send({ error: true, message: "zone " + id + " not found", statusCode: 404 });
    }
    log.createLog({ type: "info", root_module: "MCCS", sub_module: "Zone Service",
      method: new Error().stack.split("\n")[1].trim(), log_message: "Zone " + id + " deleted" });
    res.status(200).send({ error: false, data: { zone_id: id }, statusCode: 200 });
  } catch (err) {
    log.createLog({ type: "error", root_module: "MCCS", sub_module: "Zone Service",
      method: new Error().stack.split("\n")[1].trim(), log_message: err.message || "Zone Delete Failed" });
    res.status(400).send({ error: true, message: err.message, statusCode: 400 });
  }
};
