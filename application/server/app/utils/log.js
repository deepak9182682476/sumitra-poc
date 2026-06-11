const Logger = require('./logger-config');

exports.logs = (req, res) => {
    const body = {
        root_module: req.body.root_module,
        sub_module: req.body.sub_module,
        method: req.body.method,
        data: (req.body.log_message) ? req.body.log_message : req.body
    };

    body.data.hasOwnProperty('root_module') ? delete body.data.root_module : null;
    body.data.hasOwnProperty('sub_module') ? delete body.data.sub_module : null;


    const logger = new Logger(body.root_module);
    // let error = {};

    if (body.root_module == null || body.root_module == "") {
        logger.error("Root Module field is empty");
        // error["root_module"] = "Root Module field is empty";
        res.send("Root Module is required");
    } else if (body.sub_module == null || body.sub_module == "") {
        logger.error("Sub Module field is empty");
        // error["sub_module"] = "Sub Module field is empty";
        res.send("Sub Module is required");
    } else {
        logger.setLogData(body); // Adding body of the request as log data
        logger.infoObj(`Request received at /${body.method}`, body, {
            "success": true
        });
        res.send("Success");
    }

};

exports.createLog = function (params) {
    const body = {
        root_module: params.root_module,
        sub_module: params.sub_module,
        method: params.method,
        data: (params.log_message) ? params.log_message : params
    };

    body.data.hasOwnProperty('root_module') ? delete body.data.root_module : null;
    body.data.hasOwnProperty('sub_module') ? delete body.data.sub_module : null;

    const logger = new Logger(body.root_module);
    logger.setLogData(body); // Adding body of the request as log data

    if (params.type === "info") {
        logger.infoObj(`Request received at /${body.method}`, body, { "success": true });
    } else if (params.type === "warn") {
        logger.warnObj(`Warning at /${body.method}`, body, { "warning": true });
    } else if (params.type === "error") {
        logger.errorObj(`Error at /${body.method}`, body, { "error": true });
    } else if (params.type === "debug") {
        logger.debugObj(`Debug at /${body.method}`, body, { "debug": true });
    }
}