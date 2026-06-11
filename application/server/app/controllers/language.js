const multer = require('multer');
const xlstojson = require("xls-to-json-lc");
const xlsxtojson = require("xlsx-to-json-lc");
const fs = require('fs');
const storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});
const upload = multer({ //multer settings
    storage: storage,
    fileFilter: function (req, file, callback) { //file filter
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');
const log = require("../utils/log");


// Read excel file and convert data into json format
exports.upload = async (req, res, next) => {
    let exceltojson;
    upload(req, res, function (err) {
        if (err) {
            res.errorCode = 500;
            res.errorInfo = {
                error: true,
                status: 'failed',
                message: err.message || "Error occurred.. Please try later.",
            };
            log.createLog({
                type: "error",
                root_module: "MCCS",
                sub_module: "Language Service",
                method: new Error().stack.split("\n")[1].trim(),
                log_message: err.message || "Upload Failed",
              });
            next(res);
            return;
        }
        /** Multer gives us file info in req.file object */
        if (!req.file) {
            res.errorCode = 500;
            res.errorInfo = {
                error: true,
                status: 'failed',
                message: err.message || "Please provide file",
            };
            log.createLog({
                type: "error",
                root_module: "MCCS",
                sub_module: "Language Service",
                method: new Error().stack.split("\n")[1].trim(),
                log_message: err.message || "Upload Failed",
              });
            next(res);
            return;
        }
        /** Check the extension of the incoming file and
         *  use the appropriate module
         */
        if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }
        try {
          //  console.log(req.file.path, '========');
            exceltojson({
                input: req.file.path,
                output: null, //since we don't need output.json
                lowerCaseHeaders: true
            }, function (err, result) {
                if (err) {
                    res.errorCode = 500;
                    res.errorInfo = {
                        error: true,
                        status: 'failed',
                        message: err.message || "Error occurred.. Please try later.",
                    };
                    log.createLog({
                        type: "error",
                        root_module: "MCCS",
                        sub_module: "Language Service",
                        method: new Error().stack.split("\n")[1].trim(),
                        log_message: err.message || "Upload Failed",
                      });
                    next(res);
                    return;
                }
                log.createLog({
                    type: "info",
                    root_module: "MCCS",
                    sub_module: "Language Service",
                    method: new Error().stack.split("\n")[1].trim(),
                    log_message: "Upload Success",
                  });
                res.json({ error: false, status: true, data: result });
            });
        } catch (e) {
            res.errorCode = 500;
            res.errorInfo = {
                error: true,
                status: 'failed',
                message: e.message || "Corupted excel file",
            };
            log.createLog({
                type: "error",
                root_module: "MCCS",
                sub_module: "Language Service",
                method: new Error().stack.split("\n")[1].trim(),
                log_message: e.message || "Upload Failed",
              });
            next(res);
        }
    });
};


// Read Excel file and convert json data
exports.getExcelJsonData = (req, res, next) => {

    const file_path = 'uploads/';
    const file_name = 'translation.xlsx';

    if (file_name.split('.')[file_name.split('.').length - 1] === 'xlsx') {
        exceltojson = xlsxtojson;
    } else {
        exceltojson = xlstojson;
    }
    exceltojson({
        input: file_path + file_name,
        output: null, //since we don't need output.json
        lowerCaseHeaders: true
    }, function (err, result) {
        if (err) {
            res.errorCode = 500;
            res.errorInfo = {
                error: true,
                status: 'failed',
                message: err.message || "Error occurred.. Please try later.",
            };
            log.createLog({
                type: "error",
                root_module: "MCCS",
                sub_module: "Language Service",
                method: new Error().stack.split("\n")[1].trim(),
                log_message: err.message || "GetExcelJsonData Failed",
              });
            next(res);
            return;
        }
        var output_json = {"trans":{}}
        result.forEach(element => {
                    for(let key in element)
                    {
                        let value =  element[key];
                        if(key != "")
                        {
                            key = key[0].toUpperCase() + key.substring(1);
                            if(output_json.trans[key] == undefined)
                            {
                                output_json.trans[key] = {}
                            }
                            output_json.trans[key][element[""]] = value;
                        }
                    }
        });
       // console.log(output_json)
        fs.writeFile('uploads/language.json', JSON.stringify(output_json), (err) => { 
            if (err) throw err; 
        }) 
        log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Language Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetExcelJsonData Success",
          });
        res.json({ error: false, status: true, data: output_json });

    });

};

