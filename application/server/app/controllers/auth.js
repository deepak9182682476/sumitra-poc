const log = require("../utils/log");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../controllers/db");
const env = require("../config/env");
const configParams = {
  params: ["S.No", "Username", "User Role", "Last Update", "Actions"],
};
const authenticationToken = [];

// Validate Login
exports.validateLogin = async (req, res, next) => {
  // const pass = bcrypt.hashSync('admin', 8);
  // console.log(bcrypt.compareSync('admin', pass));
  // console.log(pass, '=============', bcrypt.compareSync('admin', '$2a$08$PODe6sWWI/zXQdQRW5eBVO4qvztU2HnC9MbC.hvs0r9IxS4E883SG'));
  // Validate request
  const errorMsg = {
    error: true,
    status: "failed",
    message: "Login details are required",
  };

  if (!req.body.username || !req.body.password) {
    // Handling Logs
    res.errorCode = 400;
    res.errorInfo = errorMsg;
    // next(res);
    log.createLog({
      type: "error",
      root_module: "MCCS",
      sub_module: "Auth Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: errorMsg,
    });
    // res.send(errorMsg);
    return;
  }

  if (req.body.password) {
    let result = "";
    const array = req.body.password.split("%");
    for (i = 0; i < array.length; i++) {
      result += String.fromCharCode(array[i] - 10);
    }
    req.body.password = result;
  }

  try {
    const customQuery = `select * from users where user_name='${req.body.username}' and status=true`;
    // console.log("-----");
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          if (bcrypt.compareSync(req.body.password, results[0].password)) {
            const getUser = "select * from user_roles where id=" + results[0].user_id;
            db.selectWithQuery(getUser).then(
              (findByIdRes) => {
                if (findByIdRes && findByIdRes.length) {
                  const activeTimeConfig = "select session_timeout from active_time_config limit 1";
                  db.selectWithQuery(activeTimeConfig).then(
                    (time_config) => {
                      let token = null;
                      let session_timeout = '1h';
                      if (time_config && time_config.length) {
                        session_timeout = time_config[0].session_timeout ? time_config[0].session_timeout : '1h';
                      }
                      else {
                        session_timeout = '1h';
                      }
                      token = jwt.sign({
                        id: results[0].user_id,
                        user_name: results[0].user_name,
                        role: results[0].user_role,
                        theme: results[0].theme,
                        selected_font: results[0].selected_font
                      }, env.jwt_secret_key, { expiresIn: session_timeout });

                      // Find and remove exists token
                      for (let i = 0; i < authenticationToken.length; i++) {
                        if (authenticationToken[i].id === results[0].user_id) {
                          authenticationToken.splice(i, 2);
                        }
                      }
                      authenticationToken.push({
                        id: results[0].user_id,
                        token: token,
                      });
                      // Find and remove exists token
                      log.createLog({
                        type: "info",
                        root_module: "MCCS",
                        sub_module: "Auth Service",
                        method: new Error().stack.split("\n")[1].trim(),
                        log_message: "Successfully Signed In",
                      });
                      res.send({
                        error: false,
                        message: "Successfully Signed In",
                        status: false,
                        data: {
                          id: results[0].user_id,
                          user_name: results[0].user_name,
                          role: results[0].user_role,
                          authToken: token,
                          theme: results[0].theme,
                          selected_font: results[0].selected_font,
                        },
                      });
                    });
                } else {
                  log.createLog({
                    type: "error",
                    root_module: "MCCS",
                    sub_module: "Auth Service",
                    method: new Error().stack.split("\n")[1].trim(),
                    log_message: errorMsg,
                  });
                  res.send(errorMsg);
                }
              },
              (error) => {
                log.createLog({
                  type: "error",
                  root_module: "MCCS",
                  sub_module: "Auth Service",
                  method: new Error().stack.split("\n")[1].trim(),
                  log_message: error.message,
                });
                res.send({
                  error: true,
                  message: error.message,
                  statusCode: 500,
                });
              }
            );
          } else {
            log.createLog({
              type: "error",
              root_module: "MCCS",
              sub_module: "Auth Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "Sign in failed",
            });
            res.send({ error: true, message: "Sign in failed", status: false });
          }
        } else {
          res.send({ error: true, message: "Sign in failed", status: false });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Auth Service",
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
      sub_module: "Auth Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "ValidateLogin Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Get all users
exports.findAll = async (req, res, next) => {
  try {
    // const customQuery = `SELECT u.user_id, u.user_name, u.user_role, u.lastlogin_attempt FROM users u`;
    const customQuery = `SELECT u.user_id, u.user_name, u.user_role, ur.role_name, u.lastlogin_attempt FROM users u INNER JOIN user_roles ur ON u.user_role = ur.id where u.status = true order by u.user_id asc`;
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Auth Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Find All Success",
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
            sub_module: "Auth Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Find All Success",
          });
          res.status(204).send({
            error: false,
            data: results,
            statusCode: 204,
            header: configParams,
          });
        }
      },
      (error) => {
        log.createLog({
          type: "info",
          root_module: "MCCS",
          sub_module: "Auth Service",
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
      type: "info",
      root_module: "MCCS",
      sub_module: "Auth Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "Find All Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Update user data into the database.
exports.updateUser = async (req, res, next) => {
  try {
    let updatedData = {};
    if (req.body.hasOwnProperty("password")) {
      updatedData = Object.assign(updatedData, {
        password: bcrypt.hashSync(req.body.password, 8),
      });
    }
    if (req.body.hasOwnProperty("status")) {
      updatedData = Object.assign(updatedData, { status: req.body.status });
    }
    if (req.body.hasOwnProperty("font_size")) {
      updatedData = Object.assign(updatedData, {
        selected_font: req.body.font_size,
      });
    }
    if (req.body.hasOwnProperty("theme")) {
      updatedData = Object.assign(updatedData, { theme: req.body.theme });
    }
    if (req.body.hasOwnProperty("language")) {
      updatedData = Object.assign(updatedData, { language: req.body.language });
    }

    updatedData = Object.assign(updatedData, {
      lastlogin_attempt: new Date().toISOString().slice(0, 10),
    });

    let finalUpdatedData = `${Object.keys(updatedData)
      .map((key) => `${key} ` + "=" + ` '${updatedData[key]}'`)
      .join(", ")}`;
    const customQuery = `update users set ${finalUpdatedData} where user_id = ${req.body.id}`;

    await db.updateWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Auth Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Update User Success",
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
            sub_module: "Auth Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "Update User Success",
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
          type: "error",
          root_module: "MCCS",
          sub_module: "Auth Service",
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
      sub_module: "Auth Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "Update User Error",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Find the authendication token
exports.getauthenticationToken = (req, res, next) => {
  let isTokenFound = false;

  if (req.params) {
    console.log(req.params.token, "---", authenticationToken);
    isTokenFound = authenticationToken.find((token) => {
      return token.token + "" === req.params.token + "";
    });
  }

  const isValid = isTokenFound ? true : false;
  log.createLog({
    type: isTokenFound ? "info" : "error",
    root_module: "MCCS",
    sub_module: "Auth Service",
    method: new Error().stack.split("\n")[1].trim(),
    log_message: isTokenFound ? "Token is valid" : "Token is invalid",
  });
  res.status(200).send({
    error: isTokenFound ? false : true,
    status: isValid,
    message: isTokenFound ? "Token is valid" : "Token is invalid",
    isValidToken: isValid,
  });
};

exports.getAllToken = (req, res, next) => {
  return authenticationToken;
};

exports.verifyToken = (req, res, next) => {
  let token = req.params.token;

  if (!token) {
    res.status(403).send({
      message: "No token provided!"
    });
  }

  jwt.verify(token, env.jwt_secret_key, (err, decoded) => {
    if (err) {
      res.status(401).send({
        message: "Unauthorized!"
      });
    }
    else {
      const getUser = `select * from users where user_id='${decoded.id}' and status=true`;
      db.selectWithQuery(getUser).then(
        (userInfo) => {
          if (userInfo && userInfo.length) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Auth Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "Token verified successfully",
            });
            res.send({
              error: false,
              message: "Token verified successfully",
              status: false,
              data: {
                id: userInfo[0].user_id,
                user_name: userInfo[0].user_name,
                role: userInfo[0].user_role,
                authToken: token,
                theme: userInfo[0].theme,
                selected_font: userInfo[0].selected_font,
              }
            });
          } else {
            log.createLog({
              type: "error",
              root_module: "MCCS",
              sub_module: "Auth Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "User details not found",
            });
            res.send({
              error: false,
              message: "User details not found",
              statusCode: 500
            });
          }
        },
        (error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "Auth Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message,
          });
          res.send({
            error: true,
            message: error.message,
            statusCode: 500
          });
        }
      );
    }
  });

};
