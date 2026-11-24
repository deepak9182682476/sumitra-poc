const db = require("../models");
const { str, num, ident, numList } = require("../utils/sqlSafe"); // SQL-injection safe values
const fs = require("fs");
const request = require("request");
const env = require("../config/env");
const dbConfiguration = require("../config/env").db_config;
const log = require("../utils/log");

const queries_queue = [];
let records_length = 0;

getUAVIp(); // Get UAV IP Address

function dbConnection() {
  return new Promise((resolve, reject) => {
    db.sequelize
      .authenticate()
      .then(function () {
        resolve(true);
      })
      .catch(function (err) {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: err || "DB Connection Failed",
        });
        reject(false);
      });
  });
}

//Check Database Connection
exports.checkDBConnection = () => {
  try {
    return dbConnection()
      .then(function (response) {
        log.createLog({
          type: "info",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: "checkDBConnection is established",
        });
        return response;
      })
      .catch(function (err) {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: err || "checkDBConnection is failed",
        });
        return err;
      });
  } catch (err) {
    return err;
  }
};

/** Custom Query Implementation */

// Get Query
exports.selectWithQuery = (query) => {
  try {
    // checks database connection
    return dbConnection()
      .then(function (response) {
        if (response) {
          return selectRecordWithQuery(query)
            .then((result) => {
              // log.createLog({
              //   type: "info",
              //   root_module: "MCCS",
              //   sub_module: "DB Service",
              //   method: new Error().stack.split("\n")[1].trim(),
              //   log_message: "SelectWithQuery CheckDBConnection Success",
              // });
              return result;
            })
            .catch((error) => {
              log.createLog({
                type: "error",
                root_module: "MCCS",
                sub_module: "DB Service",
                method: new Error().stack.split("\n")[1].trim(),
                log_message:
                  error || "SelectWithQuery CheckDBConnection Failed",
              });
              return error;
            });
        }
      })
      .catch(function (error) {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error || "SelectWithQuery CheckDBConnection Failed",
        });
        return error;
      });
  } catch (err) {
    log.createLog({
      type: "error",
      root_module: "MCCS",
      sub_module: "DB Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err || "SelectWithQuery CheckDBConnection Failed",
    });
    return err;
  }
};

// Create Query
exports.createWithQuery = (query) => {
  try {
    // checks database connection
    return dbConnection()
      .then(function (response) {
        if (response) {
          return createRecordWithQuery(query)
            .then((result) => {
              return result;
            })
            .catch((error) => {
              log.createLog({
                type: "error",
                root_module: "MCCS",
                sub_module: "DB Service",
                method: new Error().stack.split("\n")[1].trim(),
                log_message:
                  error || "CreateWithQuery CheckDBConnection Failed",
              });
              return error;
            });
        }
      })
      .catch(function (error) {
        // Maintain query queue in local when database is not connected
        return query_queue("insert", query)
          .then((result) => {
            return result;
          })
          .catch((error) => {
            log.createLog({
              type: "error",
              root_module: "MCCS",
              sub_module: "DB Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: error || "CreateWithQuery CheckDBConnection Failed",
            });
            return error;
          });
      });
  } catch (err) {
    log.createLog({
      type: "error",
      root_module: "MCCS",
      sub_module: "DB Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err || "CreateWithQuery CheckDBConnection Failed",
    });
    return err;
  }
};

// Update Query
exports.updateWithQuery = (query) => {
  try {
    // checks database connection
    return dbConnection()
      .then(function (response) {
        if (response) {
          return updateRecordWithQuery(query)
            .then((result) => {
              return result;
            })
            .catch((error) => {
              console.log(error);
              log.createLog({
                type: "error",
                root_module: "MCCS",
                sub_module: "DB Service",
                method: new Error().stack.split("\n")[1].trim(),
                log_message:
                  error || "UpdateWithQuery CheckDBConnection Failed",
              });
              return error;
            });
        }
      })
      .catch(function (error) {
        // Maintain query queue in local when database is not connected
        return query_queue("update", query)
          .then((result) => {
            return result;
          })
          .catch((error) => {
            log.createLog({
              type: "error",
              root_module: "MCCS",
              sub_module: "DB Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: error || "UpdateWithQuery CheckDBConnection Failed",
            });
            return error;
          });
      });
  } catch (err) {
    log.createLog({
      type: "error",
      root_module: "MCCS",
      sub_module: "DB Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err || "UpdateWithQuery CheckDBConnection Failed",
    });
    return err;
  }
};

// Delete Query
exports.deleteWithQuery = (query) => {
  try {
    // checks database connection
    return dbConnection()
      .then(function (response) {
        if (response) {
          return deleteRecordWithQuery(query)
            .then((result) => {
              return result;
            })
            .catch((error) => {
              log.createLog({
                type: "error",
                root_module: "MCCS",
                sub_module: "DB Service",
                method: new Error().stack.split("\n")[1].trim(),
                log_message:
                  error || "DeleteWithQuery CheckDBConnection Failed",
              });
              return error;
            });
        }
      })
      .catch(function (error) {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error || "DeleteWithQuery CheckDBConnection Failed",
        });
        return error;
      });
  } catch (err) {
    log.createLog({
      type: "error",
      root_module: "MCCS",
      sub_module: "DB Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err || "DeleteWithQuery CheckDBConnection Failed",
    });
    return err;
  }
};

function query_queue(type, query) {
  return new Promise((resolve, reject) => {
    queries_queue.push({ type: type, request: query });
    fs.writeFile(
      "./query_queue/records.json",
      JSON.stringify(queries_queue),
      (err) => {
        // throws an error, you could also catch it here
        if (err) {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "DB Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: err || "QueryQueue Failed",
          });
          reject(false);
        }

        // success case, the file was saved
        console.log("Data saved locally!");
        log.createLog({
          type: "info",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: "Data saved locally!",
        });
        resolve(true);
      }
    );
  });
}

function remove_query_queue(query) {
  const searchKeyword = query; // we are looking for a key word query in the file

  fs.readFile(
    "./query_queue/records.json",
    { encoding: "utf-8" },
    function (err, content) {
      if (err) {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: err,
        });
        throw error;
      }

      var dataArray = JSON.parse(content);
      let removableIndex = dataArray.findIndex(
        (x) => x.request === searchKeyword
      );

      if (removableIndex !== -1) {
        dataArray.splice(removableIndex, 1); // remove the keyword query from the data Array
      }

      // UPDATE FILE WITH NEW DATA
      fs.writeFile(
        "./query_queue/records.json",
        JSON.stringify(dataArray),
        (err) => {
          if (err) {
            log.createLog({
              type: "error",
              root_module: "MCCS",
              sub_module: "DB Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: err,
            });
            throw err;
          }
          console.log("Successfully updated the file data");
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "DB Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Successfully updated the file data",
          });
        }
      );
    }
  );
}

function processQueryQueue() {
  // process the query queue when database is re-connected
  if (queries_queue && queries_queue.length) {
    const getQueueData = queries_queue.shift();
    if (getQueueData.type === "insert") {
      // calling create record function to insert into database
      createRecordWithQuery(getQueueData.request)
        .then((result) => {
          remove_query_queue(getQueueData.request);
        })
        .catch((error) => {
          console.log("--create error--", error);
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "DB Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error,
          });
        });
    }
    if (getQueueData.type === "update") {
      // calling update record function to update into database
      updateRecordWithQuery(getQueueData.request)
        .then((result) => {
          remove_query_queue(getQueueData.request);
        })
        .catch((error) => {
          console.log("--update error--", error);
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "DB Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error,
          });
        });
    }
  } else if (queries_queue && queries_queue.length === 0) {
    fs.stat("./query_queue/records.json", function (err, stat) {
      if (err == null) {
        fs.readFile(
          "./query_queue/records.json",
          { encoding: "utf-8" },
          function (err, content) {
            if (err) {
              log.createLog({
                type: "error",
                root_module: "MCCS",
                sub_module: "DB Service",
                method: new Error().stack.split("\n")[1].trim(),
                log_message: err,
              });
              throw err;
            }
            var dataArray = JSON.parse(content);
            if (dataArray && dataArray.length > 0) {
              for (let index = 0; index < dataArray.length; index++) {
                const getQueueData = dataArray[index];
                if (getQueueData.type === "insert") {
                  createRecordWithQuery(getQueueData.request)
                    .then((result) => {
                      remove_query_queue(getQueueData.request);
                    })
                    .catch((error) => {
                      console.log("--create error--", error);
                      log.createLog({
                        type: "error",
                        root_module: "MCCS",
                        sub_module: "DB Service",
                        method: new Error().stack.split("\n")[1].trim(),
                        log_message: error,
                      });
                    });
                }
                if (getQueueData.type === "update") {
                  updateRecordWithQuery(getQueueData.request)
                    .then((result) => {
                      remove_query_queue(getQueueData.request);
                    })
                    .catch((error) => {
                      console.log("--update error--", error);
                      log.createLog({
                        type: "error",
                        root_module: "MCCS",
                        sub_module: "DB Service",
                        method: new Error().stack.split("\n")[1].trim(),
                        log_message: error,
                      });
                    });
                }
              }
            }
          }
        );
      }
    });
  }
}

function selectRecordWithQuery(query) {
  return new Promise((resolve, reject) => {
    db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT }).then(
      (results, metadata) => {
        // log.createLog({
        //   type: "info",
        //   root_module: "MCCS",
        //   sub_module: "DB Service",
        //   method: new Error().stack.split("\n")[1].trim(),
        //   log_message: "SelectRecordWithQuery Success",
        // });
        // Results will be an empty array and metadata will contain the number of affected rows.
        resolve(results);
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error,
        });
        reject(error);
      }
    );
  });
}

function createRecordWithQuery(query) {
  return new Promise((resolve, reject) => {
    db.sequelize.query(query, { type: db.sequelize.QueryTypes.INSERT }).then(
      (results, metadata) => {
        // log.createLog({
        //   type: "info",
        //   root_module: "MCCS",
        //   sub_module: "DB Service",
        //   method: new Error().stack.split("\n")[1].trim(),
        //   log_message: "CreateRecordWithQuery Success",
        // });
        // Results will be an empty array and metadata will contain the number of affected rows.
        resolve(results);
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error,
        });
        reject(error);
      }
    );
  });
}

function updateRecordWithQuery(query) {
  return new Promise((resolve, reject) => {
    db.sequelize.query(query, { type: db.sequelize.QueryTypes.UPDATE }).then(
      (results, metadata) => {
        // log.createLog({
        //   type: "info",
        //   root_module: "MCCS",
        //   sub_module: "DB Service",
        //   method: new Error().stack.split("\n")[1].trim(),
        //   log_message: "UpdateRecordWithQuery Success",
        // });
        // Results will be an empty array and metadata will contain the number of affected rows.
        resolve(results);
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error,
        });
        reject(error);
      }
    );
  });
}

function deleteRecordWithQuery(query) {
  return new Promise((resolve, reject) => {
    db.sequelize.query(query, { type: db.sequelize.QueryTypes.DELETE }).then(
      (results, metadata) => {
        console.log(results, metadata)
        log.createLog({
          type: "info",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: "DeleteRecordWithQuery Success",
        });
        // Results will be an empty array and metadata will contain the number of affected rows.
        resolve(results);
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error,
        });
        reject(error);
      }
    );
  });
}

// Get Post Analysis Data
exports.getPostAnalysisData = (req, res, next) => {
  try {
    if (req.query.filterName === "zone") {
      let query = `select * from ${req.query.filterName} where zone_type = 'System Defined'`;

      db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT }).then(
        (result) => {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "DB Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetPostAnalysisData Success",
          });
          res.status(200).send(result);
        },
        (error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "DB Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message,
          });
          res.send({ error: true, message: error.message, statusCode: 500 });
        }
      );
    } else if (req.query.filterName === "alarms") {
      let query = `select * from ${req.query.filterName}`;

      db.sequelize.query(query, { type: db.sequelize.QueryTypes.SELECT }).then(
        (result) => {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "DB Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetPostAnalysisData Success",
          });
          res.status(200).send(result);
        },
        (error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "DB Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message,
          });
          res.send({ error: true, message: error.message, statusCode: 500 });
        }
      );
    } else if (req.query.filterName === "filter") {
      const filterDate = {
        alarmId: req.query.alarm_id,
        zoneId: req.query.zone_id,
        startDate: req.query.startDate ? req.query.startDate : "",
        endDate: req.query.endDate ? req.query.endDate : ""
      };

      const promise1 = new Promise((resolve, reject) => {
        let query;

        if (filterDate.zoneId && !filterDate.alarmId) {
          query = `SELECT * FROM alarms INNER JOIN alarm_events ON alarm_events.alarm_id = alarms.alarm_id 
          WHERE alarms.zone_id = ${str(filterDate.zoneId)}`;
          if (filterDate.startDate && filterDate.endDate) {
            query = `SELECT * FROM alarms INNER JOIN alarm_events ON alarm_events.alarm_id = alarms.alarm_id 
            WHERE alarms.zone_id = ${str(filterDate.zoneId)} and 
            (cast(alarms.alarmmsg_time as date) between ${str(req.query.startDate)} and ${str(req.query.endDate)})`;
          }
        } else if (!filterDate.zoneId && !filterDate.alarmId) {
          query = `SELECT alarms.alarm_id, alarms.alarmmsg_time,alarms.alarm_type,
                    alarms.event_id,alarms.camera_id,
                    alarms.location,alarms.sensors_triggered,alarms.zone_id,
                    alarm_events.alarm_id, alarm_events.event_type,alarm_events.timeofevent,
                    alarms.location FROM alarms
                    INNER JOIN alarm_events ON alarm_events.alarm_id = alarms.alarm_id`;

          if (filterDate.startDate && filterDate.endDate) {
            query = `SELECT alarms.alarm_id, alarms.alarmmsg_time,alarms.alarm_type,
                        alarms.event_id,alarms.camera_id,
                        alarms.location,alarms.sensors_triggered,alarms.zone_id,
                        alarm_events.alarm_id, alarm_events.event_type,alarm_events.timeofevent,
                        alarms.location FROM alarms
                        INNER JOIN alarm_events ON alarm_events.alarm_id = alarms.alarm_id 
                        WHERE (cast(alarms.alarmmsg_time as date) between ${str(filterDate.startDate)} and ${str(filterDate.endDate)})`;
          }
        } else if (
          (!filterDate.zoneId && filterDate.alarmId) ||
          (filterDate.zoneId && filterDate.alarmId)
        ) {
          query = `SELECT alarms.alarm_id, alarms.alarmmsg_time,alarms.alarm_type,
                    alarms.event_id,alarms.camera_id,
                    alarms.location,alarms.sensors_triggered,alarms.zone_id,
                    alarm_events.alarm_id, alarm_events.event_type,alarm_events.timeofevent,
                    alarms.location FROM alarms
                    INNER JOIN alarm_events ON alarm_events.alarm_id = alarms.alarm_id where alarms.alarm_id=${str(filterDate.alarmId)}`;

          if (filterDate.startDate && filterDate.endDate) {
            query = `SELECT alarms.alarm_id, alarms.alarmmsg_time,alarms.alarm_type,
                        alarms.event_id,alarms.camera_id,
                        alarms.location,alarms.sensors_triggered,alarms.zone_id,
                        alarm_events.alarm_id, alarm_events.event_type,alarm_events.timeofevent,
                        alarms.location FROM alarms
                        INNER JOIN alarm_events ON alarm_events.alarm_id = alarms.alarm_id  
                        WHERE (cast(alarms.alarmmsg_time as date) between ${str(filterDate.startDate)} and ${str(filterDate.endDate)}) 
                        and alarms.alarm_id=${str(filterDate.alarmId)}`;
          }
        }
        console.log('queryyyyyyy', query)
        db.sequelize
          .query(query, { type: db.sequelize.QueryTypes.SELECT })
          .then(
            (result) => {
              log.createLog({
                type: "info",
                root_module: "MCCS",
                sub_module: "DB Service",
                method: new Error().stack.split("\n")[1].trim(),
                log_message: "GetPostAnalysisData DB Sequlize Success",
              });
              resolve(result);
            },
            (error) => {
              log.createLog({
                type: "error",
                root_module: "MCCS",
                sub_module: "DB Service",
                method: new Error().stack.split("\n")[1].trim(),
                log_message: error,
              });
              reject(error);
            }
          );
      });

      const promise2 = new Promise((resolve, reject) => {
        let query;

        if (filterDate.zoneId && !filterDate.alarmId) {
          query = `select zone_id, count(alarm_id) as alarm_count from alarms WHERE alarms.zone_id = ${str(filterDate.zoneId)} group by zone_id`;
          if (filterDate.startDate && filterDate.endDate) {
            query = `select zone_id, count(alarm_id) as alarm_count from alarms WHERE alarms.zone_id = ${str(filterDate.zoneId)} 
                     and (cast(alarms.alarmmsg_time as date) between ${str(req.query.startDate)} and ${str(req.query.endDate)}) group by zone_id`;
          }
        } else if (!filterDate.zoneId && !filterDate.alarmId) {
          query = `select zone_id, count(alarm_id) as alarm_count from alarms group by zone_id`;
          if (filterDate.startDate && filterDate.endDate) {
            query = `select zone_id, count(alarm_id) as alarm_count from alarms 
                     WHERE (cast(alarms.alarmmsg_time as date) between ${str(filterDate.startDate)} and ${str(filterDate.endDate)}) group by zone_id`;
          }
        } else if (
          (!filterDate.zoneId && filterDate.alarmId) ||
          (filterDate.zoneId && filterDate.alarmId)
        ) {
          query = `select zone_id, count(alarm_id) as alarm_count from alarms 
                   WHERE alarms.alarm_id=${str(filterDate.alarmId)} group by zone_id`;
          if (filterDate.startDate && filterDate.endDate) {
            query = `select zone_id, count(alarm_id) as alarm_count from alarms WHERE alarms.alarm_id=${str(filterDate.alarmId)} 
                     and (cast(alarms.alarmmsg_time as date) between ${str(filterDate.startDate)} and ${str(filterDate.endDate)}) group by zone_id`;
          }
        }

        db.sequelize
          .query(query, { type: db.sequelize.QueryTypes.SELECT })
          .then(
            (result) => {
              log.createLog({
                type: "info",
                root_module: "MCCS",
                sub_module: "DB Service",
                method: new Error().stack.split("\n")[1].trim(),
                log_message: "GetPostAnalysisData DB Sequlize Success",
              });
              resolve(result);
            },
            (error) => {
              log.createLog({
                type: "error",
                root_module: "MCCS",
                sub_module: "DB Service",
                method: new Error().stack.split("\n")[1].trim(),
                log_message: error || "GetPostAnalysisData DB Sequlize Error",
              });
              reject(error);
            }
          );
      });

      Promise.all([promise1, promise2])
        .then(([result1, result2]) => {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "DB Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetPostAnalysisData Promise All Success",
          });
          res.status(200).send({
            graphData: result1,
            zoneWiseData: result2
          });
        })
        .catch((error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "DB Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message,
          });
          res.send({ error: true, message: error.message, statusCode: 500 });
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
      sub_module: "DB Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "GetPostAnalysisData Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Post analysis save search
exports.saveSearch = (req, res) => {
  try {
    if (req.body && !Object.keys(req.body).length) {
      res.status(501).send("Please provide valid input");
      return;
    }

    if (req.body) {
      let saveSearchParams = {
        columns: "alarm_id,role",
        values: `${str(req.body.alarmId)}, ${num(req.body.role)}`,
        selectData: `alarm_id=${str(req.body.alarmId)} and role=${num(req.body.role)}`,
      };
      if (req.body.zoneId) {
        saveSearchParams.columns += ",zone_id";
        saveSearchParams.values += `,${num(req.body.zoneId)}`;
        saveSearchParams.selectData += `and zone_id=${num(req.body.zoneId)}`;
      }
      if (req.body.startDate && req.body.endDate) {
        saveSearchParams.columns += ",start_date,end_date";
        saveSearchParams.values += `,${str(req.body.startDate)}, ${str(req.body.endDate)}`;
        saveSearchParams.selectData += ` and start_date=${str(req.body.startDate)} and end_date=${str(req.body.endDate)}`;
      }
      db.sequelize
        .query(`select * from save_search where ${saveSearchParams.selectData}`)
        .then(
          (selectResults) => {
            if (selectResults[0] && !selectResults[0].length) {
              db.sequelize
                .query(
                  `insert into save_search (${saveSearchParams.columns}) values(${saveSearchParams.values})`
                )
                .then(
                  (results) => {
                    log.createLog({
                      type: "info",
                      root_module: "MCCS",
                      sub_module: "DB Service",
                      method: new Error().stack.split("\n")[1].trim(),
                      log_message: "Successfully saved",
                    });
                    res.status(200).send({
                      error: false,
                      message: "Successfully saved",
                      status: true,
                      statusCode: 200,
                    });
                  },
                  (err) => {
                    log.createLog({
                      type: "error",
                      root_module: "MCCS",
                      sub_module: "DB Service",
                      method: new Error().stack.split("\n")[1].trim(),
                      log_message: err || "Save Search Failed",
                    });
                    res.status(500).send({
                      error: true,
                      message: "Error occured.. Please try later",
                      status: false,
                      statusCode: 500,
                    });
                  }
                );
            } else {
              res.status(200).send({
                error: true,
                message: "Sorry these data already available in the list",
                status: false,
                statusCode: 200,
              });
            }
          },
          (err) => {
            log.createLog({
              type: "error",
              root_module: "MCCS",
              sub_module: "DB Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: err || "Save Search Failed",
            });
            res.status(500).send({
              error: true,
              message: "Error occured.. Please try later",
              status: false,
              statusCode: 500,
            });
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
      sub_module: "DB Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "Save Search Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Get Save Search Data
exports.getSaveSearch = async (req, res) => {
  try {
    if (req.body && !req.query.role) {
      res.status(501).send("Please provide valid input");
      return;
    }

    if (req.query.role) {
      await db.sequelize
        .query(`select * from save_search where role=${num(req.query.role)}`)
        .then(
          (selectResults) => {
            const data =
              selectResults[0] && selectResults[0].length
                ? selectResults[0]
                : [];
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "DB Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "GetSaveSearch Success",
            });
            res.status(200).send(data);
          },
          (err) => {
            log.createLog({
              type: "error",
              root_module: "MCCS",
              sub_module: "DB Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: err || "GetSaveSearch Failed",
            });
            res.status(500).send({
              error: true,
              message: "Error occured.. Please try later",
              status: false,
              statusCode: 500,
            });
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
      sub_module: "DB Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err || "GetSaveSearch Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Delete Saved Search
exports.deleteSavedSearch = async (req, res) => {
  try {
    if (!req.params || (req.params && !req.params.id)) {
      res.status(501).send("Please provide valid input");
      return;
    }

    if (req.params.id) {
      await db.sequelize
        .query(`delete from save_search where id=${num(req.params.id)}`)
        .then(
          (selectResults) => {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "DB Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "DeleteSavedSearch Successfully",
            });
            res.status(200).send({
              error: false,
              message: "Deleted Successfully",
              status: false,
              statusCode: 200,
            });
          },
          (err) => {
            log.createLog({
              type: "error",
              root_module: "MCCS",
              sub_module: "DB Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: err || "DeleteSavedSearch Failed",
            });
            res.status(500).send({
              error: true,
              message: "Error occured.. Please try later",
              status: false,
              statusCode: 500,
            });
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
      sub_module: "DB Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "DeleteSavedSearch Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

setInterval(() => {
  dbConnection()
    .then(function (response) {
      // console.log("----connection----", response);

      if (queries_queue && queries_queue.length) {
        processQueryQueue();
      }
    })
    .catch(function (error) {
      // console.log('--connection--', error);
      //sending the notification to UI
      var data = {
        type: "system_notification",
        isAck: false,
        isCleared: false,
        content: "Database connection lost",
        timestamp: new Date(),
      };
      log.createLog({
        type: "error",
        root_module: "MCCS",
        sub_module: "DB Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: error || "Database connection lost",
      });
      sendNotificationToUI(data)
        .then((response) => {
          response;
        })
        .catch((error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "DB Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error || "SendNotification Error",
          });
          return error;
        });
    });

  // var data = { category: "ugv_battery_info", data: { level: "20.17", remaining_time: "20.24" } };
  // sendNotificationToUI(data).then(response => { response });
}, 3000);

function sendNotificationToUI(data) {
  return new Promise((resolve, reject) => {
    var options = {
      json: true,
      url: env.base_url + "/communication/to-ui",
      body: data,
      method: "get",
    };
    request(options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        log.createLog({
          type: "info",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: "SendNotificationToUI SuccessFully",
        });
        resolve(body);
      } else {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error || "SendNotification Error",
        });
        reject(error);
      }
    });
  });
}

exports.createNotification = (req, res, next) => {
  try {
    db.notification
      .create({
        type: "notification",
        origin: req.body.origin,
        data: req.body.data,
      })
      .then((result) => {
        log.createLog({
          type: "info",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: "CreateNotification Success",
        });
        res.status(200).send(result);
      })
      .catch((err) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: err || "CreateNotification Error",
        });
        res.send({ error: true, message: err, statusCode: 500 });
      });
  } catch (err) {
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
      sub_module: "DB Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "CreateNotification Error",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Delete Alarms Data from Database
exports.clearAlarms = (req, res, next) => {
  try {
    db.sequelize.query(`delete from alarm_events`).then(
      (deleteRes) => {
        db.sequelize.query(`delete from alarms`).then(
          (response) => {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "DB Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "ClearAlarms Success",
            });
            res.status(200).send({
              error: false,
              message: "Deleted Successfully",
              status: false,
            });
          },
          (error) => {
            log.createLog({
              type: "error",
              root_module: "MCCS",
              sub_module: "DB Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: error || "ClearAlarms Error",
            });
            res.status(500).send({
              error: true,
              message: "Error occured.. Please try later",
              status: false,
            });
          }
        );
      },
      (err) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: err || "ClearAlarms Error",
        });
        res.status(500).send({
          error: true,
          message: "Error occured.. Please try later",
          status: false,
        });
      }
    );
  } catch (err) {
    log.createLog({
      type: "error",
      root_module: "MCCS",
      sub_module: "DB Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err || "ClearAlarms Error",
    });
    res.status(500).send({
      error: true,
      message: "Error occured.. Please try later",
      status: false,
    });
  }
};

exports.dbConfig = (req, res, next) => {
  const config = req.body.config;
  if (config && config.environment) {
    dbConfiguration[config.environment.toLowerCase()].database = config.dbname;
    dbConfiguration[config.environment.toLowerCase()].host = config.hostname;
    dbConfiguration[config.environment.toLowerCase()].username =
      config.username;
    dbConfiguration[config.environment.toLowerCase()].password =
      config.password;
  }

  try {
    log.createLog({
      type: "info",
      root_module: "MCCS",
      sub_module: "DB Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: "Updated Successfully",
    });
    res
      .status(200)
      .send({ error: false, message: "Updated Successfully", status: true });
  } catch (err) {
    log.createLog({
      type: "error",
      root_module: "MCCS",
      sub_module: "DB Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err || "Please try later",
    });
    res
      .status(500)
      .send({ error: true, message: "Please try later", status: false });
  }
};

/******************* UAV/UGV  ******************/

exports.UAVIPList = (req, response, next) => {
  response.send({ ips: tcp_connection_ips });
};

/** Get UAV IP Address From UAV Table */
function getUAVIp() {
  db.sequelize
    .query(`select * from uav`, { type: db.sequelize.QueryTypes.SELECT })
    .then(
      (results) => {
        // tcp_ip_config.tcp_port_nos.connection1.ip = results[0].ip;
        // tcp_ip_config.tcp_port_nos.connection2.ip = results[1].ip;
        // tcp_ip_config.tcp_port_nos.connection3.ip = results[2].ip;
        log.createLog({
          type: "info",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: "getUAVIP Success",
        });
        tcp_connection_ips = results;
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error || "getUAVIP Error",
        });
        // Error Occured
        // tcp_ip_config.tcp_port_nos.connection1.ip = '127.0.0.1';
        // tcp_ip_config.tcp_port_nos.connection2.ip = '127.0.0.1';
        // tcp_ip_config.tcp_port_nos.connection3.ip = '127.0.0.1';
        tcp_connection_ips = [];
      }
    );
}

/**
 * Retrive UAV Data
 */
exports.getAllUAV = (req, res, next) => {
  try {
    db.sequelize
      .query(`select * from uav`, { type: db.sequelize.QueryTypes.SELECT })
      .then(
        (results) => {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "DB Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "getAllUAV Success",
          });
          res.status(200).send({ error: false, status: true, data: results });
        },
        (error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "DB Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error || "getAllUAV Error",
          });
          res.status(500).send({
            error: true,
            message: "Error occured.. Please try later",
            status: false,
          });
        }
      );
  } catch (err) {
    log.createLog({
      type: "error",
      root_module: "MCCS",
      sub_module: "DB Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err || "getAllUAV Error",
    });
    res.status(500).send({
      error: true,
      message: "Error occured.. Please try later",
      status: false,
    });
  }
};

/**
 * Retrive UGV Data
 */
exports.getAllUGV = (req, res, next) => {
  try {
    db.sequelize
      .query(`select * from ugv`, { type: db.sequelize.QueryTypes.SELECT })
      .then(
        (results) => {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "DB Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "getAllUAV Info",
          });
          res.status(200).send({ error: false, status: true, data: results });
        },
        (error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "DB Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error || "getAllUAV Error",
          });
          res.status(500).send({
            error: true,
            message: "Error occured.. Please try later",
            status: false,
          });
        }
      );
  } catch (err) {
    log.createLog({
      type: "error",
      root_module: "MCCS",
      sub_module: "DB Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err || "getAllUAV Error",
    });
    res.status(500).send({
      error: true,
      message: "Error occured.. Please try later",
      status: false,
    });
  }
};

// Delete
exports.delete = async (req, res) => {
  if (!req.params || (req.params && !req.params.id)) {
    res.status(501).send("Please provide valid input");
    return;
  }

  if (req.params.id) {
    let deleteQuery = null;
    if (req.params.type === "uav") {
      deleteQuery = `delete from uav where uav_id=${num(req.params.id)}`;
    } else {
      deleteQuery = `delete from ugv where ugv_id=${num(req.params.id)}`;
    }

    db.sequelize.query(deleteQuery).then(
      (selectResults) => {
        log.createLog({
          type: "info",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: "Deleted Successfully",
        });
        res.status(200).send({
          error: false,
          message: "Deleted Successfully",
          status: false,
        });
      },
      (err) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: err || "getAllUAV Error",
        });
        res.status(500).send({
          error: true,
          message: "Error occured.. Please try later",
          status: false,
        });
      }
    );
  }
};

/**
 * Update UAV
 */
exports.updateUAV = (req, res, next) => {
  const customQuery = `update uav set ip = ${str(req.body.data.ipaddress)}, rth_location = 'SRID=4326;POINT(${num(req.body.data.longitude)} ${num(req.body.data.latitude)})', current_status = ${num(req.body.data.current_status)}, zone_id=${num(req.body.data.zone_id)},is_assigned = ${num(req.body.data.is_assigned)} where uav_id=${num(req.body.data.uav_id)}`;

  db.sequelize.query(customQuery).then(
    (results) => {
      log.createLog({
        type: "info",
        root_module: "MCCS",
        sub_module: "DB Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: "Updated Successfully",
      });
      res
        .status(200)
        .send({ error: false, message: "Updated Successfully", status: false });
    },
    (error) => {
      log.createLog({
        type: "error",
        root_module: "MCCS",
        sub_module: "DB Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: error || "Updated Failed",
      });
      res.status(500).send({
        error: true,
        message: "Error occured.. Please try later",
        status: false,
      });
    }
  );
};

/**
 * Update UAV
 */
exports.insertUAV = (req, res, next) => {
  const customQuery = `insert into uav (ip, rth_location, current_status, zone_id, is_assigned) values(${str(req.body.data.ipaddress)}, 'SRID=4326;POINT(${num(req.body.data.longitude)} ${num(req.body.data.latitude)})', ${num(req.body.data.current_status)}, ${num(req.body.data.zone_id)}, ${num(req.body.data.is_assigned)})`;

  db.sequelize.query(customQuery).then(
    (results) => {
      log.createLog({
        type: "info",
        root_module: "MCCS",
        sub_module: "DB Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: "InsertUAV Success",
      });
      res.status(200).send({
        error: false,
        message: "Inserted Successfully",
        status: false,
      });
    },
    (error) => {
      log.createLog({
        type: "error",
        root_module: "MCCS",
        sub_module: "DB Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: error || "InsertUAV Failed",
      });
      res.status(500).send({
        error: true,
        message: "Error occured.. Please try later",
        status: false,
      });
    }
  );
};

/**
 * Update UAV
 */
exports.updateUGV = (req, res, next) => {
  const customQuery = `update ugv set ip = ${str(req.body.data.ipaddress)}, base_location = 'SRID=4326;POINT(${num(req.body.data.longitude)} ${num(req.body.data.latitude)})', current_status = ${num(req.body.data.current_status)}, zone_id=${num(req.body.data.zone_id)},is_assigned = ${num(req.body.data.is_assigned)} where ugv_id=${num(req.body.data.ugv_id)}`;

  db.sequelize.query(customQuery).then(
    (results) => {
      log.createLog({
        type: "info",
        root_module: "MCCS",
        sub_module: "DB Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: "UpdateUGV Success",
      });
      res
        .status(200)
        .send({ error: false, message: "Updated Successfully", status: false });
    },
    (error) => {
      log.createLog({
        type: "error",
        root_module: "MCCS",
        sub_module: "DB Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: error || "UpdateUGV Failed",
      });
      res.status(500).send({
        error: true,
        message: "Error occured.. Please try later",
        status: false,
      });
    }
  );
};

/**
 * Update UGV
 */
exports.insertUGV = (req, res, next) => {
  const customQuery = `insert into ugv (ip, base_location, current_status, zone_id, is_assigned) values(${str(req.body.data.ipaddress)}, 'SRID=4326;POINT(${num(req.body.data.longitude)} ${num(req.body.data.latitude)})', ${num(req.body.data.current_status)}, ${num(req.body.data.zone_id)}, ${num(req.body.data.is_assigned)})`;

  db.sequelize.query(customQuery).then(
    (results) => {
      log.createLog({
        type: "info",
        root_module: "MCCS",
        sub_module: "DB Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: "InsertUGV Success",
      });
      res.status(200).send({
        error: false,
        message: "Inserted Successfully",
        status: false,
      });
    },
    (error) => {
      log.createLog({
        type: "error",
        root_module: "MCCS",
        sub_module: "DB Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: error || "InsertUGV Failed",
      });
      res.status(500).send({
        error: true,
        message: "Error occured.. Please try later",
        status: false,
      });
    }
  );
};

// Get Time Configuration
exports.getActiveTimeConfig = async (req, res, next) => {
  try {
    const customQuery = `select * from active_time_config limit 1`;
    await db.sequelize.query(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "DB Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetActiveTimeConfig Success",
          });
          res
            .status(200)
            .send({ error: false, data: results[0][0], statusCode: 200 });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "DB Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetActiveTimeConfig Success",
          });
          res.status(204).send({ error: false, data: {}, statusCode: 204 });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error || "GetActiveTimeConfig Error",
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
      sub_module: "DB Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "GetActiveTimeConfig Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Insert/Update Time config
exports.activeTimeConfig = async (req, res, next) => {
  try {
    if (!req.body.isUpdate) {
      console.log("testing")
      let customQuery = `insert into active_time_config (start_time, end_time, session_timeout) values(${str(req.body.start_time)}, ${str(req.body.end_time)}, ${str(req.body.session_timeout)})`;
      console.log("active_time_config insertion")
      await db.sequelize.query(customQuery).then(
        (results) => {
          if (results && results.length) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "DB Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "ActiveTimeConfig Successfully Saved",
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
              sub_module: "DB Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "ActiveTimeConfig Successfully Saved",
            });
            res
              .status(204)
              .send({ error: false, data: results, statusCode: 204 });
          }
        },
        (error) => {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "DB Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message || "ActiveTimeConfig Failed",
          });
          res
            .status(400)
            .send({ error: true, message: error.message, statusCode: 400 });
        }
      );
    } else if (req.body.isUpdate && req.body.id) {
      let customQuery = `UPDATE active_time_config SET start_time = ${str(req.body.start_time)}, end_time = ${str(req.body.end_time)}, session_timeout = ${str(req.body.session_timeout)} WHERE 1 = 1`;
      await db.sequelize.query(customQuery).then(
        (results) => {
          if (results && results.length) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "DB Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "ActiveTimeConfig Successfully Updated",
            });
            res.status(200).send({
              error: false,
              message: "Successfully Updated",
              statusCode: 200,
            });
          } else {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "DB Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "ActiveTimeConfig Successfully Updated",
            });
            res.status(304).send({
              error: false,
              message: "Successfully Updated",
              statusCode: 304,
            });
          }
        },
        (error) => {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "DB Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message || "ActiveTimeConfig Failed",
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
      sub_module: "DB Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "ActiveTimeConfig Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Get tbl_external_alarm_obj_transaction
exports.getTblExternalAlarmObjTransaction = async (req, res, next) => {
  try {
    await db.sequelize
      .query(
        `select alarm_id, json_agg(json_build_object('frameid', frameid, 'obj_id', obj_id)) as obj_data
         from public.tbl_external_alarm_obj_transaction
         group by alarm_id`,
        { type: db.sequelize.QueryTypes.SELECT }
      )
      .then(
        (result) => {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "DB Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "getTblExternalAlarmObjTransaction Success",
          });
          res.status(200).send(result);
        },
        (err) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "DB Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: err || "getTblExternalAlarmObjTransaction Failed",
          });
          res.status(500).send({
            error: true,
            message: "Error occured.. Please try later",
            status: false,
            statusCode: 500,
          });
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
      sub_module: "DB Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err || "getTblExternalAlarmObjTransaction Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// This function simulates us checking the length
let getQueueLength = async function () {
  return await db.sequelize
    .query(
      `select count(id) as records_length from tbl_external_alarm_obj_transaction`,
      { type: db.sequelize.QueryTypes.SELECT }
    )
    .then(
      (result) => {
        if (result && result.length) {
          return result[0].records_length;
        }
        else {
          return 0;
        }
      },
      (err) => {
        console.log(err);
      }
    );
};

// This function simulates us checking the list
let getQueueList = async function (limit) {
  return await db.sequelize
    .query(
      `select alarm_id,frameid,obj_id from tbl_external_alarm_obj_transaction order by id desc limit ${num(limit)}`,
      { type: db.sequelize.QueryTypes.SELECT }
    )
    .then(
      (result) => {
        return result;
      },
      (err) => {
        console.log(err);
      }
    );
};

// We would like to retrieve the queue length at regular intervals
setInterval(async function () {
  let queueLength = await getQueueLength().then(records => { return records });

  if (queueLength >= records_length) {

    let limit = queueLength - records_length;
    let queueListArray = await getQueueList(limit).then(records => { return records });
    // console.log('queueListArray', queueListArray);

    let queueList = queueListArray.reduce((result, obj) => {
      const itemExists = result.find(item => obj.alarm_id === item.alarm_id);
      if (itemExists) {
        itemExists.ids = [...itemExists.ids, Number(obj.frameid)]
      } else {
        result.push({ alarm_id: obj.alarm_id, ids: [Number(obj.frameid)], file: `${env.videos_url + obj.alarm_id}_raw.mp4` })
      }
      return result;
    }, [])[0]

    if (queueList != undefined) {
      // sendVideoClipToAlarmService(queueList);
      sendAlarmObjTransToWebRos(queueList);
    }

    records_length = queueLength;
  }

}, 5000); // 5 seconds

// function sendVideoClipToAlarmService(data) {
//   if (data) {
//     request(
//       {
//         method: "post",
//         url: env.base_url + "/alarm/save-alarm-video-clip",
//         body: data,
//         json: true,
//       },
//       function (error, response, body) {
//         if (!error && response.statusCode == 200) {
//           //  callback(body);
//         }
//       }
//     );
//   }
// }

function sendAlarmObjTransToWebRos(data) {
  if (data) {
    request(
      {
        method: "post",
        url: env.web_ros_url + "/web/ros/adapter/send-video-clip-compose",
        body: { data: JSON.stringify(data) },
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