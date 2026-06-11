const env = require("../config/env");
const GeoJSON = require("geojson");
const request = require("request");
const turf = require("@turf/turf");
const multer = require("multer");
const fs = require("fs");
const db = require("../controllers/db");
const log = require("../utils/log");
const { response } = require("express");
//const comr = require("../routes/communication");
let radarTrackData = [];
let alarmTrackInfo = [];
let alarmData = [];
let earlyWarningsInfo = [];
let ewInfo = {};
let trackIds = []
earlyWarningsInfo.push(ewInfo)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./map_files/");
  },
  filename: function (req, file, cb) {
    let ext = ".kml"; // set default extension (if any)
    if (file.originalname.split(".").length > 1)
      // checking if there is an extension or not.
      ext = file.originalname.substring(
        file.originalname.lastIndexOf("."),
        file.originalname.length
      );
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage: storage }).single("file");

// get QRT Location
exports.qrtLocation = async (req, res, next) => {
  try {
    var locationObject = { lat: req.body.lat, lng: req.body.lng };
    var geojson = GeoJSON.parse(locationObject, { Point: ["lat", "lng"] });

    var options = {
      url: env.base_url + `/communication/to-ui`,
      body: { gJson: geojson, category: "qrt_location" },
      json: true
    };

    log.createLog({
      type: "info",
      root_module: "MCCS",
      sub_module: "Map Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: "QRT Location sent to Mccs",
    });
    res.send("received");
    request(options, (err, res, body) => {
      if (err) {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Map Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: err || "QRT Location not sent ",
        });
        console.log(err);
      }
    });
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
      sub_module: "Map Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "QRT Location Error",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

exports.ugvTrack = async (req, res, next) => {
  var geojson = undefined;
  var alarmObject = {
    type: req.body.type,
    category: req.body.category,
    lat: req.body.y,
    lng: req.body.x,
    ip: req.body.ip,
    properties:{ip:req.body.ip, id: req.body.ip, type:req.body.type}
  };
  geojson = GeoJSON.parse(alarmObject, { Point: ["lat", "lng"] });
  //console.log(geojson);
  var data = {};
  data.gJson = geojson;
  data.category = "ugv_track";
  var options = {
    url: env.base_url + `/communication/to-ui`,
    body: data,
    json: true,
  };
  log.createLog({
    type: "info",
    root_module: "MCCS",
    sub_module: "Map Service",
    method: new Error().stack.split("\n")[1].trim(),
    log_message: "UGVTrack Received ",
  });
  res.send("received");
  request(options, (err, res, body) => {
    if (err) {
      log.createLog({
        type: "error",
        root_module: "MCCS",
        sub_module: "Map Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: err || "UGVTrack Failed ",
      });
      console.log(err);
    }
  });
};

exports.distance = async (req, res, nect) => {
  if (req.body && req.body.point1 && req.body.point2 && req.body.unit) {
    log.createLog({
      type: "info",
      root_module: "MCCS",
      sub_module: "Map Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: "Distance Sent ",
    });
    res.send(
      calcDistance(
        req.body.point1.lat,
        req.body.point1.lon,
        req.body.point2.lat,
        req.body.point2.lon,
        req.body.unit
      )
    );
  } else {
    log.createLog({
      type: "error",
      root_module: "MCCS",
      sub_module: "Map Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: "Required format is not matched.",
    });
    res.send("required format is not matched.");
  }
};

// unit = the unit you desire for results
//           where: 'M' is statute miles (default)
//                  'K' is kilometers
//                  'N' is nautical miles
function calcDistance(lat1, lon1, lat2, lon2, unit) {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  } else {
    var radlat1 = (Math.PI * lat1) / 180;
    var radlat2 = (Math.PI * lat2) / 180;
    var theta = lon1 - lon2;
    var radtheta = (Math.PI * theta) / 180;
    var dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
      dist = dist * 1.609344;
    }
    if (unit == "N") {
      dist = dist * 0.8684;
    }
    return dist;
  }
}

var newRadarTrack = false;

// Retrieve Alarm from the ROS-Web Adapter.
exports.track = async (req, res, next) => {
  newRadarTrack = true;
  radarTrackData = req.body.track;
  // console.log('Track Data', req.body.track);
  // log.createLog({
  //   type: "info",
  //   root_module: "MCCS",
  //   sub_module: "Map Service",
  //   method: new Error().stack.split("\n")[1].trim(),
  //   log_message: "Track Received ",
  // });
  res.send("received");
};


// function trackData(req, res, next){
//   newRadarTrack = true;
//   radarTrackData = req.body.track;
//   console.log('Track Data', req.body.track);
//   return radarTrackData; 

// }

//Send Track Data To response service.
exports.receiveTrackDataFromMapService = async (req, res, next) => {//*** 
  try{
    //trackData(req, res, next);
    console.log('Length() Of Radar_Track Data...',radarTrackData.length) 
    if(radarTrackData.length){

      res.send({track_data: radarTrackData});

    }
    console.log('No Data Found...')
  }catch(error){
    console.log(error);
  }
};

setInterval(() => {
  // Maintaining radar track data as global and send track to UI
  if (newRadarTrack) {
    newRadarTrack = false;
    // console.log(JSON.stringify(radarTrackData))
    
    if (radarTrackData != undefined) {
      trackInfo = radarTrackData[0]
      let location = trackInfo.tail[0]
      if (location != undefined) {
        // isLatLngNearbyBoundary(env.boundaryPoints, location)
        //   .then((response) => {
            const data = {
              lat: location[1],
              lng: location[0],
              id: trackInfo.id,
              type: 2,
              category: "alarm",
              track_to_db: true,
              record_flag: 0,
            };
            let isEWPresent = checkEWPresense(trackInfo.id);
            if (!isEWPresent) {
              console.log("*********************************************************************************************************")
              ewInfo = data;
              earlyWarningsInfo.push(ewInfo);
              sendAlarmDataToMapService(
                location[1],
                location[0],
                trackInfo.id,
                1
              );
              sendAlarmDataToAlarmService(
                location[1],
                location[0],
                trackInfo.id,
                1,
                ["RADAR"],
                trackInfo.ip
              );
            }
          // })
          // .catch((error) => {
          //   log.createLog({
          //     type: "error",
          //     root_module: "MCCS",
          //     sub_module: "Map Service",
          //     method: new Error().stack.split("\n")[1].trim(),
          //     log_message: error || "Track Failed",
          //   });
          //   console.log(error);
          // });
      }

            // radarTrackData.find((trackInfo) => {
            //   let location = trackInfo.tail[trackInfo.tail.length-1]
            //   if (location != undefined) {
            //     // isLatLngNearbyBoundary(env.boundaryPoints, location)
            //     //   .then((response) => {
            //         const data = {
            //           lat: location[1],
            //           lng: location[0],
            //           id: trackInfo.id,
            //           type: 2,
            //           category: "alarm",
            //           track_to_db: false,
            //           record_flag: 0,
            //         };
            //         let isEWPresent = checkEWPresense(trackInfo.id);
            //         if (!isEWPresent) {
            //           console.log("*********************************************************************************************************")
            //           earlyWarningsInfo.push(data);
            //           sendAlarmDataToMapService(
            //             location[1],
            //             location[0],
            //             trackInfo.id,
            //             2
            //           );
            //           sendAlarmDataToAlarmService(
            //             location[1],
            //             location[0],
            //             trackInfo.id,
            //             2,
            //             ["RADAR"],
            //             trackInfo.ip
            //           );
            //         }
            //       // })
            //       // .catch((error) => {
            //       //   log.createLog({
            //       //     type: "error",
            //       //     root_module: "MCCS",
            //       //     sub_module: "Map Service",
            //       //     method: new Error().stack.split("\n")[1].trim(),
            //       //     log_message: error || "Track Failed",
            //       //   });
            //       //   console.log(error);
            //       // });
            //   }

      earlyWarningsInfo.find((ewInfo) => {
        if (trackInfo.id == ewInfo.id) {
          isLatLngExistsInzone(location).then((response) => {
            // console.log("----Matched Zone ID-----", response);any
            sendZoneInfoToResponseService({
              location: location,
              zone_id: response.zone_id,
            });
          });
          // sendTracktoUI("radar_tracks", 2, trackInfo.id, trackInfo.tail);
          sendTracktoUI("radar_tracks", 1, trackInfo.id, trackInfo.tail);
          // var finalTrackCoords = trackInfo.tai
          //   .map((position) => {
          //     return `${position[0]} ${position[1]}`;
          //   })
          //   .join(", ");
          // if (!ewInfo.track_to_db) {
          //   // inserting the data into the DB
          //   const customQuery = `insert into alarm_tail(alarm_id, uid, tail) values('${ewInfo.id}', '${ewInfo.id}', ST_GeomFromText('LINESTRING(${finalTrackCoords})'))`;
          //   db.createWithQuery(customQuery).then((result) => { });
          //   ewInfo.track_to_db = true;
          // } else {
          //   // updating the data into the DB
          //   const customQuery = `update alarm_tail set tail = ST_GeomFromText('LINESTRING(${finalTrackCoords})') where uid = '${ewInfo.id}'`;
          //   db.updateWithQuery(customQuery).then((result) => { });
          //   // console.log("updated the alarm trail");
          // }
          return true;
        }
      });
    };
  }
}, 300);

function checkEWPresense(id) {
  for (let index = 0; index < earlyWarningsInfo.length; index++) {
    const element = earlyWarningsInfo[index];
    if (element.id == id) {
      return true;
    }
  }
  return false;
}

// setInterval(() => {
//     // post alarm -> map alarm with track
//     if (alarmData && alarmData.length > 0) {
//         alarmData.forEach((element, index) => {
//             for (let track_index = 0; track_index < radarTrackData.length; track_index++) {
//                 let track = radarTrackData[track_index];
//                 let mappingData = {
//                     alarm_type: element.type,
//                     alarm_id: element.id,
//                     lat: element.lat,
//                     lng: element.lng,
//                     radar_track: track,
//                     threshold: (element.type === 1) ? 5 : 0.5  //in meters
//                 }
//                 if (mapWithTrack(mappingData)) {
//                     alarmData.splice(index, 1);
//                     break;
//                 }
//             }
//         });
//     }
// }, 10);

function sendZoneInfoToResponseService(data) {
  if (data) {
    request(
      {
        method: "post",
        url: env.base_url + "/response/send-zone-info-to-ros",
        body: data,
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

function isLatLngExistsInzone(location) {
  return new Promise((resolve, reject) => {
    const customQuery = `select * from zone order by zone_id desc`;
    db.selectWithQuery(customQuery).then((res) => {
      if (res && res.length) {
        for (let i = 0; i < res.length; i++) {
          const zoneInfo = res[i];

          zoneInfo.geometry = {
            type: res[i].zone_shape,
            coordinates: res[i].zone_area.coordinates,
          };

          if (location) {
            const point = turf.point(location);
            const polygon = turf.polygon(zoneInfo.geometry.coordinates[0]);

            if (turf.booleanWithin(point, polygon)) {
              resolve({ zone_id: zoneInfo.zone_id });
              break;
            }
          }
        }
      } else {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Map Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: "no zones available",
        });
        resolve({ error: "no zones available" });
      }
    });
  });
}

// To check the Latitude and Longitude Near By Boundary or not
function isLatLngNearbyBoundary(boundaryPoints, location) {
  return new Promise((resolve, reject) => {
    var from = turf.point(location);
    for (let i = 0; i < boundaryPoints.length; i++) {
      let element = boundaryPoints[i];
      var to = turf.point([element[0], element[1]]);
      var options = { units: "kilometers" };
      var km_distance = turf.distance(from, to, options);
      var distance = km_distance * 1000;
      // console.log(" distance found is : ", distance);
      if (distance <= 700) {
        resolve({ location: location });
        break;
      }
    }
  });
}

function sendAlarmDataToMapService(lat, lon, id, type) {
  console.log("sending the alarm to map",lat, lon, id, type)
  var options = { json: true };
  options.body = { lat: lat, lng: lon, id: id, type: type, category: "map" };
  processAlarmData(options);
}

function sendAlarmDataToAlarmService(lat, lon, id, type, st, ip) {
  // console.log("sending the alarm to alarm ",lat, lon, id, type, st, ip)
  var options = { json: true };
  options.url = env.base_url + "/alarm/create-update";
  options.body = {
    location: [lon, lat],
    alarm_id: id,
    event_id: id,
    camera_id: "192.168.1.10",
    alarm_type: type,
    sensors_triggered: st,
  };
  options.method = "POST";
  options.json = true;
  request(options, (err, response, body) => {
    if (err) {
      log.createLog({
        type: "error",
        root_module: "MCCS",
        sub_module: "Map Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: err.code || "SendAlarmDataToAlarmService Error",
      });
      console.log(err.code);
    }
  });
}
// let mulcor =[];
//  async function sendTracktoUI(category, type, id, track) {
//   var geojson = undefined;
//   let alarmObject = { category: category, type: type, id: id, data: track };
//   console.log("@@@alarmObject",alarmObject);
//   if(id==101){
//     mulcor.push(alarmObject.data[0]);
//   console.log("@@@***alarmObject",mulcor);
//   }
//   if(mulcor.length >10){
//   geojson = GeoJSON.parse(mulcor, { LineString: "data" });
//   var data = {};
//   data.gJson = geojson;
//   data.category = category;
//   var options = {
//     url: `http://localhost:3058/api/communication/to-ui`,
//     body: data,
//     json: true,
//   };
  
//   await request(options, (err, res, body) => {
//    // console.log("UI res",res);
//     if (err) {
//       log.createLog({
//         type: "error",
//         root_module: "MCCS",
//         sub_module: "Map Service",
//         method: new Error().stack.split("\n")[1].trim(),
//         log_message: err || "SendTracktoUI Error",
//       });
//       console.log(err);
//     }
//   });
//   //router.sendToUIHandler(data);
//   }
// }
// let mulcor = [];

// async function sendTracktoUI(category, type, id, track) {

//   if (id === 18) {
//     mulcor.push(track[0]);
//   }

//   if (mulcor.length > 3) {

//     const lineWrapper = {
//       category: category,
//       type: type,
//       id: id,
//       data: mulcor
//     };
  
//     geojson = GeoJSON.parse(lineWrapper, { LineString: "data" });
  
//     var data = {};
//     data.gJson = geojson;
//     data.category = category;
  
//     var options = {
//       url: `http://localhost:3058/api/communication/to-ui`,
//       body: data,
//       json: true,
//     };
  
//     await request(options, (err, res, body) => {
//       if (err) {
//         console.log(err);
//       }
//     });
//   }
  
// }

// Store coordinates per id
let tracksById = {};

async function sendTracktoUI(category, type, id, track) {

  // Ensure we have an array for this id
  if (!tracksById[id]) {
    tracksById[id] = [];
  }

  // Push coordinate (assuming track[0] is [lng, lat])
  tracksById[id].push(track[0]);

  // If this id has more than 3 coordinates
  if (tracksById[id].length > 3) {

    const lineWrapper = {
      category: category,
      type: type,
      id: id,
      data: tracksById[id]
    };

    const geojson = GeoJSON.parse(lineWrapper, { LineString: "data" });

    const data = {
      gJson: geojson,
      category: category
    };

    const options = {
      url: `http://localhost:3058/api/communication/to-ui`,
      body: data,
      json: true,
    };

    try {
      await request(options);
    } catch (err) {
      console.log(err);
    }
  }
}

// Retrieve Alarm from the ROS-Web Adapter.
exports.postAlaram = async (req, res, next) => {
  processAlarmData(req);
  res.send("received");
};

function processAlarmData(req) {
  var geojson = undefined;
  var alarmObject = {
    type: req.body.type,
    category: req.body.category,
    id: req.body.id,
    lat: req.body.lat,
    lng: req.body.lng,
  };
  geojson = GeoJSON.parse(alarmObject, { Point: ["lat", "lng"] });

  var data = {};
  data.gJson = geojson;
  data.category = "map";
  var options = {
    url: env.base_url + `/communication/to-ui`,
    body: data,
    json: true,
  };

  alarmData.push(req.body);

  request(options, (err, res, body) => {
    if (err) {
      log.createLog({
        type: "error",
        root_module: "MCCS",
        sub_module: "Map Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: err || "ProcessAlarmData Error",
      });
      console.log(err);
    }
  });
}

function mapWithTrack(mappingData) {
  var from = turf.point([mappingData.lng, mappingData.lat]);
  var radarTrackPoints = mappingData.radar_track.tail.slice(-10);
  // var radarTrackPoints = mappingData.radar_track ? mappingData.radar_track.tail.slice(-10) : mappingData.bfo_track.slice(-10);
  var finalTrackCoords = mappingData.radar_track.tail
    .map((position) => {
      return `${position[0]} ${position[1]}`;
    })
    .join(", ");
  let counter = 0;
  for (let i = 0; i < radarTrackPoints.length; i++) {
    let element = radarTrackPoints[i];
    var to = turf.point([element[0], element[1]]);
    var options = { units: "kilometers" };
    var km_distance = turf.distance(from, to, options);
    var distance = km_distance * 1000;
    if (distance <= mappingData.threshold) {
      if (mappingData.alarm_type === 2) {
        alarmTrackInfo.push({
          EA: mappingData.alarm_id,
          CA: null,
          track_id: mappingData.radar_track.id,
        });

        const customQuery = `insert into alarm_tail(alarm_id, uid, tail) values('${mappingData.alarm_id}', '${mappingData.radar_track.id}', ST_GeomFromText('LINESTRING(${finalTrackCoords})'))`;
        db.createWithQuery(customQuery).then((result) => { });
      } else if (mappingData.alarm_type === 1) {
        if (alarmTrackInfo.length > 0) {
          alarmTrackInfo.map((item) => {
            if (item.track_id === mappingData.radar_track.id) {
              item.CA = mappingData.alarm_id;
              const customQuery = `update alarm_tail set alarm_id = '${mappingData.alarm_id}' where uid = '${mappingData.radar_track.id}'`;
              db.updateWithQuery(customQuery).then((result) => { });
              return item;
            }
          });
        } else {
          alarmTrackInfo.push({
            EA: mappingData.alarm_id,
            CA: mappingData.alarm_id,
            track_id: mappingData.radar_track.id,
          });
          const customQuery = `insert into alarm_tail(uid, tail, alarm_id) values('${mappingData.radar_track.id}', ST_GeomFromText('LINESTRING(${finalTrackCoords})'), '${mappingData.alarm_id}')`;
          db.createWithQuery(customQuery).then((result) => { });
        }
      }
      break;
    }
    counter++;
  }
  if (counter <= radarTrackPoints.length) {
    return true;
  } else {
    return false;
  }
}

function sendRequest(url, method) {
  request(
    {
      method: method,
      url: url,
      json: true,
    },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
      }
    }
  );
}

// Site Map Configuration
exports.getMapConfig = async (req, res, next) => {
  try {
    const customQuery = `SELECT json_build_object( 'type', 'FeatureCollection', 'features', json_agg(ST_AsGeoJSON(st.*)::json) ) AS geojson
    FROM ( SELECT site_id, site_area, default_center, updated_time FROM site_dim order by 1 asc limit 1) AS st(site_area)`;
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Map Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetMapConfig Success",
          });
          res.status(200).send({
            error: false,
            data: results ? results[0] : [],
            statusCode: 200,
          });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Map Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetMapConfig Success",
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
          sub_module: "Map Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "GetMapConfig Error",
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
      sub_module: "Map Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "GetMapConfig Error",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// Insert/Update Map config
exports.mapConfig = async (req, res, next) => {
  try {
    const site_area = req.body.site_area[0]
      .map((position) => {
        return `${position[0]} ${position[1]}`;
      })
      .join(", ");

    if (!req.body.isUpdate) {
      let customQuery = `insert into site_dim(default_center, site_area, updated_time) values ('SRID=4326;POINT(${req.body.longitude} ${req.body.latitude})', ST_AsText(ST_Multi(ST_GeomFromText('POLYGON((${site_area}))'))), now())`;
      await db.createWithQuery(customQuery).then(
        (results) => {
          if (results && results.length) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Map Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "MapConfig Success",
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
              sub_module: "Map Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "MapConfig Success",
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
            sub_module: "Map Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message || "MapConfig Error",
          });
          res
            .status(400)
            .send({ error: true, message: error.message, statusCode: 400 });
        }
      );
    } else if (req.body.isUpdate && req.body.id) {
      let customQuery = `UPDATE site_dim SET default_center = 'SRID=4326;POINT(${req.body.longitude} ${req.body.latitude})', site_area = ST_AsText(ST_Multi(ST_GeomFromText('POLYGON((${site_area}))'))), updated_time=now() WHERE site_id = ${req.body.id}`;
      await db.updateWithQuery(customQuery).then(
        (results) => {
          if (results && results.length) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Map Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "MapConfig Successfully Updated",
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
              sub_module: "Map Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "MapConfig Successfully Updated",
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
            sub_module: "Map Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message || "MapConfig Error",
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
      sub_module: "Map Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "MapConfig Error",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

exports.mapWithBfoTrack = (req, response, next) => {
  const mappingData = req.body;
  var from = turf.point([mappingData.lng, mappingData.lat]);
  var radarTrackPoints = mappingData.bfo_track.slice(-10);
  var finalTrackCoords = mappingData.radar_track.tail
    .map((position) => {
      return `${position[0]} ${position[1]}`;
    })
    .join(", ");
  let counter = 0;
  for (let i = 0; i < radarTrackPoints.length; i++) {
    let element = radarTrackPoints[i];
    var to = turf.point([element[0], element[1]]);
    var options = { units: "kilometers" };
    var km_distance = turf.distance(from, to, options);
    var distance = km_distance * 1000;

    if (distance <= mappingData.threshold) {
      if (mappingData.alarm_type === 2) {
        alarmTrackInfo.push({
          EA: mappingData.alarm_id,
          CA: null,
          track_id: mappingData.radar_track.id,
        });

        const customQuery = `insert into alarm_tail(alarm_id, uid, tail) values('${mappingData.alarm_id}', '${mappingData.radar_track.id}', ST_GeomFromText('LINESTRING(${finalTrackCoords})'))`;
        db.createWithQuery(customQuery).then((result) => { });
      } else if (mappingData.alarm_type === 1) {
        if (alarmTrackInfo.length > 0) {
          alarmTrackInfo.map((item) => {
            if (item.track_id === mappingData.radar_track.id) {
              item.CA = mappingData.alarm_id;
              const customQuery = `update alarm_tail set alarm_id = '${mappingData.alarm_id}' where uid = '${mappingData.radar_track.id}'`;
              db.updateWithQuery(customQuery).then((result) => { });
              return item;
            }
          });
        } else {
          alarmTrackInfo.push({
            EA: mappingData.alarm_id,
            CA: mappingData.alarm_id,
            track_id: mappingData.radar_track.id,
          });
          const customQuery = `insert into alarm_tail(uid, tail, alarm_id) values('${mappingData.radar_track.id}', ST_GeomFromText('LINESTRING(${finalTrackCoords})'), '${mappingData.alarm_id}')`;
          db.createWithQuery(customQuery).then((result) => { });
        }
      }
      break;
    }
    counter++;
  }
  if (counter <= radarTrackPoints.length) {
    return true;
  } else {
    return false;
  }
};

// save uploaded map
exports.saveUploadedMap = (req, res, next) => {
  upload(req, res, async function (err) {
    if (err) {
      err.errorCode = 500;
      err.errorInfo = {
        error: true,
        status: "failed",
        message: err.message || "Error occurred.. Please try later.",
      };
      res.send(err);
    } else {
      let saveQuery;
      if (req.body.type == "url") {
        saveQuery = `insert into map_config (type, url, priority, updated_date) values('${req.body.type}', '${req.body.url}', 1, 'now()')`;
      } else {
        saveQuery = `insert into map_config (type, title, file_name, priority, updated_date) values('${req.body.type}', '${req.body.file_name}', '${req.file.filename}', 1, 'now()')`;
      }

      await db.createWithQuery(saveQuery).then(
        (results) => {
          if (results && results.length) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Map Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "SaveUploadedMap Successfully Updated",
            });
            res.status(200).send({
              error: false,
              message: "Successfully Saved",
              statusCode: 200,
            });
          } else {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Map Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "SaveUploadedMap Successfully Updated",
            });
            res.status(204).send({ error: false, statusCode: 204 });
          }
        },
        (error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "Map Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message || "SaveUploadedMap Error",
          });
          res
            .status(400)
            .send({ error: true, message: error.message, statusCode: 400 });
        }
      );
    }
  });
};

// get all uploaded map files
exports.getUploadedMapFiles = async (req, res, next) => {
  try {
    const customQuery = `select * from map_config`;
    await db.selectWithQuery(customQuery).then(
      (results) => {
        if (results && results.length) {
          let promises = [];
          const getResponse = results;
          results.forEach((data, i) => {
            promises.push(
              new Promise((resolve, reject) => {
                if (data.type == "url") {
                  getResponse[i].file_data = null;
                  resolve(data);
                } else {
                  const file_ext = data.file_name.split(".").pop();
                  fs.readFile(
                    "./map_files/" + data.file_name,
                    "utf8",
                    function (err, fileData) {
                      if (err) {
                        log.createLog({
                          type: "error",
                          root_module: "MCCS",
                          sub_module: "Map Service",
                          method: new Error().stack.split("\n")[1].trim(),
                          log_message: err,
                        });
                        reject(err);
                      } else if (file_ext === "txt") {
                        getResponse[i].file_data = getJsonFromtxt(fileData);
                      } else {
                        getResponse[i].file_data = fileData;
                      }
                      resolve(getResponse);
                    }
                  );
                }
              })
            );
          });

          Promise.all(promises)
            .then(([result]) => {
              log.createLog({
                type: "info",
                root_module: "MCCS",
                sub_module: "Map Service",
                method: new Error().stack.split("\n")[1].trim(),
                log_message: "GetUploadedMapFiles Success",
              });
              res.status(200).send({ data: result });
            })
            .catch((err) => {
              res
                .status(500)
                .send({ error: true, message: err, statusCode: 500 });
            });
        } else {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Map Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetUploadedMapFiles Success",
          });
          res.status(204).send({ error: false, data: [], statusCode: 204 });
        }
      },
      (error) => {
        log.createLog({
          type: "error",
          root_module: "MCCS",
          sub_module: "Map Service",
          method: new Error().stack.split("\n")[1].trim(),
          log_message: error.message || "GetUploadedMapFiles Error",
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
      sub_module: "Map Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "GetUploadedMapFiles Error",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

// delete uploaded map
exports.deleteUploadedMap = (req, res, next) => {
  fs.unlink("./map_files/" + req.params.filename, async (err) => {
    if (err) {
      res.errorCode = 500;
      res.errorInfo = {
        error: true,
        status: "failed",
        message: err.message || "Error occurred.. Please try later.",
      };
      res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
    } else {
      const customQuery = `delete from map_config where id=${req.params.id}`;
      await db.deleteWithQuery(customQuery).then(
        (results) => {
          if (results) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Map Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "DeleteUploadedMap Success",
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
              sub_module: "Map Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "DeleteUploadedMap Unable to delete",
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
            sub_module: "Map Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message || "DeleteUploadedMap Error",
          });
          res
            .status(400)
            .send({ error: true, message: error.message, statusCode: 400 });
        }
      );
    }
  });
};

// update uploaded map
exports.updateUploadedMap = (req, res, next) => {
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
        sub_module: "Map Service",
        method: new Error().stack.split("\n")[1].trim(),
        log_message: err || "UpdateUploadedMap Error",
      });
      res.send(err);
    } else {
      let updateRndfQuery = `update map_config set title='${req.body.file_name}', priority=1, updated_date='now()' where id = ${req.body.id}`;

      if (req.file) {
        updateRndfQuery = `update map_config set title='${req.body.file_name}', priority=1, updated_date='now()', file_name='${req.file.filename}' where id = ${req.body.id}`;
      }
      // console.log(req.body.old_file_name);

      if (req.body.old_file_name) {
        fs.unlink("./map_files/" + req.body.old_file_name, (err) => {
          // console.log('Removed');
        });
      }

      await db.updateWithQuery(updateRndfQuery).then(
        (results) => {
          if (results) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Map Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "UpdateUploadedMap Updated Successfully",
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
              sub_module: "Map Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "UpdateUploadedMap Success",
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
            sub_module: "Map Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message || "UpdateUploadedMap Error",
          });
          res
            .status(400)
            .send({ error: true, message: error.message, statusCode: 400 });
        }
      );
    }
  });
};

// Get Alarm Data based on zones
exports.getAlarmWithZoneData = async (req, res, next) => {
  // console.log(req.params);
  try {
    if (req.params && !req.params.zone_id) {
      const customQuery = `
        SELECT * FROM zone z, alarms a WHERE z.zone_id = a.zone_id and z.current_status = false`;
      await db.selectWithQuery(customQuery).then(
        (results) => {
          if (results && results.length) {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Map Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "GetAlarmWithZoneData Success",
            });
            res.status(200).send({
              error: false,
              data: { disabledAlarm: results ? results : [] },
              statusCode: 200,
              isZoneAvailable: false,
            });
          } else {
            log.createLog({
              type: "info",
              root_module: "MCCS",
              sub_module: "Map Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: "GetAlarmWithZoneData Success",
            });
            res.send({
              error: false,
              data: { disabledAlarm: results },
              statusCode: 200,
            });
          }
        },
        (error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "Map Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error.message || "GetAlarmWithZoneData Error",
          });
          res
            .status(400)
            .send({ error: true, message: error.message, statusCode: 400 });
        }
      );
    } else {
      const promise1 = new Promise((resolve, reject) => {
        const eventsQuery = `SELECT * FROM zone z, alarms a WHERE z.zone_id = a.zone_id and z.current_status = false`;
        db.selectWithQuery(eventsQuery).then(
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
              sub_module: "Map Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: error || "GetAlarmWithZoneData Error",
            });
            resolve(error);
          }
        );
      });

      const promise2 = new Promise((resolve, reject) => {
        const zoneId = req.params.zone_id + "";
        const eventsQuery = `SELECT * FROM zone z, alarms a WHERE z.zone_id = a.zone_id and z.current_status = true and a.zone_id='${zoneId}'`;
        db.selectWithQuery(eventsQuery).then(
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
              sub_module: "Map Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: error || "GetAlarmWithZoneData Error",
            });
            resolve(error);
          }
        );
      });

      const promise3 = new Promise((resolve, reject) => {
        const zoneId = req.params.zone_id + "";
        const eventsQuery = `SELECT * FROM alarm_events ORDER BY (alarm_id, event_type)`;
        db.selectWithQuery(eventsQuery).then(
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
              sub_module: "Map Service",
              method: new Error().stack.split("\n")[1].trim(),
              log_message: error || "GetAlarmWithZoneData Error",
            });
            resolve(error);
          }
        );
      });

      Promise.all([promise1, promise2, promise3])
        .then((zoneAlarmData) => {
          log.createLog({
            type: "info",
            root_module: "MCCS",
            sub_module: "Map Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: "GetAlarmWithZoneData Promise All Success",
          });
          res.send({
            data: {
              disabledAlarm: zoneAlarmData[0],
              addAlarm: { data: zoneAlarmData[1], events: zoneAlarmData[2] },
            },
            isZoneAvailable: true,
          });
        })
        .catch((error) => {
          log.createLog({
            type: "error",
            root_module: "MCCS",
            sub_module: "Map Service",
            method: new Error().stack.split("\n")[1].trim(),
            log_message: error || "GetAlarmWithZoneData Error",
          });
          next(error);
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
      sub_module: "Map Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "GetAlarmWithZoneData Error",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};

exports.getAwsData = async(req, res, next) => {
  try{

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
      sub_module: "Map Service",
      method: new Error().stack.split("\n")[1].trim(),
      log_message: err.message || "getAwsData Error",
    });
    res.send({ ...res.errorInfo, ...{ statusCode: 500 } });
  }
};


