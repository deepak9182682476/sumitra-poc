/**
 * Name : Nagaraju
 * Date of creation: 29-09-2020
 * E-Mail: g-nagaraju@lntecc.com
 */

const request = require("request");
const { str, num, ident, numList } = require("../utils/sqlSafe"); // SQL-injection safe values
const env = require("../config/env");
const path = require("path");
const ffmpeg = require("ffmpeg");
const fs = require("fs");
const multer = require("multer");
const db = require("../controllers/db");
const log = require("../utils/log");

const folder_path = env.evidence_path
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./uploads/"); // set the destination
  },
  filename: function (req, file, callback) {
    var datetimestamp = Date.now();
    callback(
      null,
      file.fieldname +
      "-" +
      datetimestamp +
      "." +
      file.originalname.split(".")[file.originalname.split(".").length - 1]
    ); // set the file name and extension
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    //file filter
    if (
      ["mp4"].indexOf(
        file.originalname.split(".")[file.originalname.split(".").length - 1]
      ) === -1
    ) {
      return callback(new Error("Wrong extension type"));
    }
    callback(null, true);
  },
}).single("file");

function tosplit(request) {
  var value = request;
  valueArray = value.split("\\");
  return valueArray;
}

function extsplit(request) {
  var value = request;
  nameArray = value.split(".");
  return nameArray;
}

// Retrieve all data from the database.
exports.findImageInfo = (req, response, next) => {
  const directoryPath = path.join("/images");
  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      log.createLog({
        type: "error",
        root_module: "MCCS",
        sub_module: "DB Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: err || "FindImageInfo Failed",
      });
      response.send({
        error: true,
        status: "failed",
        message: "No Images Found...",
      });
    } else {
      log.createLog({
        type: "info",
        root_module: "MCCS",
        sub_module: "Image Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: "FindImageInfo Success",
      });
      files.forEach(function (file) {
        console.log(file);
        response.send(file);
      });
    }
  });
};

// Retrieve all alarm events the database.
exports.findImageInfofromDataBase = async (req, res, next) => {
  try {
    let customQuery;
    const filterDate = {
      alarmId: req.query.alarm_id,
      zoneId: req.query.zone_id,
      startDate: req.query.startDate ? req.query.startDate : "",
      endDate: req.query.endDate ? req.query.endDate : ""
    };

    if (filterDate.zoneId && !filterDate.alarmId) {
      customQuery = `SELECT alarms.*, alarm_videos.*, tbl_ext_aot.* 
      FROM alarms
      LEFT JOIN (SELECT DISTINCT ON (alarm_id) * FROM alarm_videos ORDER BY alarm_id, created_on DESC) alarm_videos 
      ON alarm_videos.alarm_id = alarms.alarm_id and alarms.alarm_type = 1 
      LEFT JOIN ( SELECT alarm_id, json_agg(json_build_object('frameid', frameid, 'obj_id', obj_id)) as obj_data 
      FROM tbl_external_alarm_obj_transaction GROUP BY alarm_id ) tbl_ext_aot 
      ON tbl_ext_aot.alarm_id = alarms.alarm_id 
      WHERE alarms.zone_id = ${str(filterDate.zoneId)}`;

      if (filterDate.startDate && filterDate.endDate) {
        customQuery = `SELECT alarms.*, alarm_videos.*, tbl_ext_aot.* 
        FROM alarms
        LEFT JOIN (SELECT DISTINCT ON (alarm_id) * FROM alarm_videos ORDER BY alarm_id, created_on DESC) alarm_videos 
        ON alarm_videos.alarm_id = alarms.alarm_id and alarms.alarm_type = 1 
        LEFT JOIN ( SELECT alarm_id, json_agg(json_build_object('frameid', frameid, 'obj_id', obj_id)) as obj_data 
        FROM tbl_external_alarm_obj_transaction GROUP BY alarm_id ) tbl_ext_aot 
        ON tbl_ext_aot.alarm_id = alarms.alarm_id 
        WHERE alarms.zone_id = ${str(filterDate.zoneId)} and (cast(alarms.alarmmsg_time as date) BETWEEN ${str(req.query.startDate)} AND ${str(req.query.endDate)})`;
      }

    } else if (!filterDate.zoneId && !filterDate.alarmId) {
      customQuery = `SELECT alarms.*, alarm_videos.*, tbl_ext_aot.* 
      FROM alarms
      LEFT JOIN (SELECT DISTINCT ON (alarm_id) * FROM alarm_videos ORDER BY alarm_id, created_on DESC) alarm_videos 
      ON alarm_videos.alarm_id = alarms.alarm_id and alarms.alarm_type = 1 
      LEFT JOIN ( SELECT alarm_id, json_agg(json_build_object('frameid', frameid, 'obj_id', obj_id)) as obj_data 
      FROM tbl_external_alarm_obj_transaction GROUP BY alarm_id ) tbl_ext_aot 
      ON tbl_ext_aot.alarm_id = alarms.alarm_id`;

      if (filterDate.startDate && filterDate.endDate) {
        customQuery = `SELECT alarms.*, alarm_videos.*, tbl_ext_aot.* 
        FROM alarms
        LEFT JOIN (SELECT DISTINCT ON (alarm_id) * FROM alarm_videos ORDER BY alarm_id, created_on DESC) alarm_videos 
        ON alarm_videos.alarm_id = alarms.alarm_id and alarms.alarm_type = 1 
        LEFT JOIN ( SELECT alarm_id, json_agg(json_build_object('frameid', frameid, 'obj_id', obj_id)) as obj_data 
        FROM tbl_external_alarm_obj_transaction GROUP BY alarm_id ) tbl_ext_aot 
        ON tbl_ext_aot.alarm_id = alarms.alarm_id WHERE (cast(alarms.alarmmsg_time as date) BETWEEN ${str(req.query.startDate)} AND ${str(req.query.endDate)})`;
      }

    } else if (
      (!filterDate.zoneId && filterDate.alarmId) ||
      (filterDate.zoneId && filterDate.alarmId)
    ) {
      customQuery = `SELECT alarms.*, alarm_videos.*, tbl_ext_aot.* 
      FROM alarms
      LEFT JOIN (SELECT DISTINCT ON (alarm_id) * FROM alarm_videos ORDER BY alarm_id, created_on DESC) alarm_videos 
      ON alarm_videos.alarm_id = alarms.alarm_id and alarms.alarm_type = 1 
      LEFT JOIN ( SELECT alarm_id, json_agg(json_build_object('frameid', frameid, 'obj_id', obj_id)) as obj_data 
      FROM tbl_external_alarm_obj_transaction GROUP BY alarm_id ) tbl_ext_aot 
      ON tbl_ext_aot.alarm_id = alarms.alarm_id 
      WHERE alarms.alarm_id=${str(filterDate.alarmId)}`;

      if (filterDate.startDate && filterDate.endDate) {
        customQuery = `SELECT alarms.*, alarm_videos.*, tbl_ext_aot.* 
        FROM alarms
        LEFT JOIN (SELECT DISTINCT ON (alarm_id) * FROM alarm_videos ORDER BY alarm_id, created_on DESC) alarm_videos 
        ON alarm_videos.alarm_id = alarms.alarm_id and alarms.alarm_type = 1 
        LEFT JOIN ( SELECT alarm_id, json_agg(json_build_object('frameid', frameid, 'obj_id', obj_id)) as obj_data 
        FROM tbl_external_alarm_obj_transaction GROUP BY alarm_id ) tbl_ext_aot 
        ON tbl_ext_aot.alarm_id = alarms.alarm_id 
        WHERE alarms.alarm_id=${str(filterDate.alarmId)} and (cast(alarms.alarmmsg_time as date) BETWEEN ${str(req.query.startDate)} AND ${str(req.query.endDate)})`;
      }

    }

    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          let files_data = [];
          results.forEach((elem, i) => {
            fs.readdir(path.join(__dirname, `../..${elem.video_url}`), function (err, files) {
              if (files) {
                log.createLog({
                  type: "info",
                  root_module: "MCCS",
                  sub_module: "Image Service",
                  method: new Error().stack.split("\n")[1].trim(),
                  log_message: "FindImageInfofromDataBase Success",
                });
                let videos_list = [], images_list = [];
                files.forEach(function (file, index) {
                  const file_ext = file.split(".").pop();
                  if (file_ext == "mp4") {
                    videos_list.push(`${elem.video_url}/${file}`);
                  }
                  else {
                    images_list.push(`${elem.video_url}/${file}`);
                  }

                  if (files.length - 1 === index) {
                    files_data.push({ videos: videos_list, images: images_list, ...elem });
                    res.send(files_data);
                  }
                });
              }
            });
          });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Image Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "FindImageInfofromDataBase Success",
          });
          res
            .status(204)
            .send({ error: false, message: results, statusCode: 204 });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "DB Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "findImageInfofromDataBase Failed",
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
      log_message: err.message || "findImageInfofromDataBase Failed",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Extract frames from video
exports.extractFrames = (req, res, next) => {
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
        sub_module: "Image Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: err.message || "Extract Frames Failed",
      });
      next(res);
      return;
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
        sub_module: "Image Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: err.message || "Extract Frames Failed",
      });
      next(res);
      return;
    }

    var video_file = fs.createReadStream(req.file.path); // Storing File path
    var video_res = JSON.parse(JSON.stringify(video_file)); // Converting Json into String and Parsing req.file.path

    var valueArray = tosplit(video_res.path); // Splitting Path in value
    var filename = extsplit(valueArray[1]); // Spliting File name from path
    var finalpath = "./uploads/" + valueArray[1]; // Path to Video for Extracting Images
    var destpath = "./uploads/"; // Destinaton Path to Store Images

    try {
      var process = new ffmpeg(finalpath);
      process.then(
        function (video) {
          // Callback mode
          video.fnExtractFrameToJPG(
            destpath,
            {
              frame_rate: 1,
              number: 50,
              keep_pixel_aspect_ratio: true,
              keep_aspect_ratio: true,
              file_name: filename[0] + "_%s",
            },
            function (error, files) {
              if (!error) {
                var fileJsonStr = JSON.stringify(files);
                log.createLog({
                  type: "info",
                  root_module: "MCCS",
                  sub_module: "Image Service",
                  method: new Error().stack.split("\n")[1].trim(),
                  log_message: "Extract Frames Success",
                });
                res.send(fileJsonStr).responseJSON;
              }
            }
          );
        },
        function (err) {
          console.log("Error: " + err);
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "Image Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: err || "Extract Frames Failed",
          });
        }
      );
    } catch (e) {
      console.log(e.code);
      console.log(e.msg);
      log.createLog({
        type: "error",
        root_module: "MCCS",
        sub_module: "Image Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: e.msg || "Extract Frames Failed",
      });
    }
  });
};


// The resolved file must stay inside the media folder (stops "../" reading other files)
function insideFolder(base, file) {
  const root = require("path").resolve(String(base));
  const full = require("path").resolve(String(file));
  return full === root || full.startsWith(root + require("path").sep);
}

exports.getImage = async (req, res, next) => {
  console.log('listening ------------------');
  try {
    const { image_path, time } = req.query;
    //let date_obj_str = time.replaceAll("/","-")
    // let date_obj_str = time;

    let filepath = path.join(folder_path + "/" + image_path + ".jpg");
    if (!insideFolder(folder_path, filepath)) {
      return res.status(400).send({ error: 'Invalid image path' });
    }

    console.log('--------------', image_path, filepath);
    if (fs.existsSync(filepath)) {
      console.log(image_path, 'exists');
      var eventImage = fs.readFileSync(filepath, { encoding: "base64" });
      res.status(200).send({ image_base64: eventImage });
    }
    else {
      console.log(image_path, 'not-exists');
      res.status(400).send({ error: 'No image found' });
    }
  } catch (error) {
    console.log('errrrrr---------', error)
    res.status(500).send({ error: error });
  }
};

exports.getVideo = async (req, res, next) => {

  console.log('inside video ------ ')

  const path = folder_path+'/'+req.query.id+".mp4"
  if (!insideFolder(folder_path, path)) {
    return res.status(400).send({ error: 'Invalid video id' });
  }
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range
  console.log('inside video ', fileSize, range)

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

    // Check for valid range
    if (start >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n');
      return;
    }


    const chunksize = (end - start) + 1
    const file = fs.createReadStream(path, { start, end })
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
}
