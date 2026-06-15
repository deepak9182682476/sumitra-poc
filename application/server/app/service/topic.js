//var ROSLIB = require('roslib');
var request = require("request");
const armContr = require("../controllers/alarm");
const mapsContr = require("../controllers/map");

var intrusion_alarm_topic_details = { 'name': '/intrusion_alarm', 'type': 'perception_msgs/AlarmMsg' }
var early_warning_topic_details = { 'name': '/early_warning_alarm', 'type': 'perception_msgs/AlarmMsg' }
var radar_track_topic_details = { 'name': '/targets', 'type': 'mass/targets' }
var health_topic_details = { 'name': '/health', 'type': 'health_node/Health_Msg' }
var ugv_track_topic_details = { 'name': '/ugv_track', 'type': 'geometry_msgs/Pose' }
var radars_topic_details = { 'name': '/radars', 'type': 'mass/radars' }
var aids_topic_details = { 'name': '/Threat', 'type': 'iio_skyfort_ros/DeviceThreat' }
var ugs_topic_details = { 'name': '/ugs_data', 'type': 'ugs_driver/UgsData' }
const sensors_triggered = require("../config/sensor_triggered.json")

var targets = []
var isNewDataReceived = false;
let radarsInfo = []
var AIDSThreats = [];


module.exports = function (ros) {
  if (ros != undefined) {
    subscribe(ros, radars_topic_details);
    subscribe(ros, radar_track_topic_details);
    subscribe(ros, intrusion_alarm_topic_details);
    subscribe(ros, early_warning_topic_details);
    subscribe(ros, health_topic_details);
    subscribe(ros, ugv_track_topic_details);
    subscribe(ros, aids_topic_details);
    subscribe(ros, ugs_topic_details);

  } else {
    console.log("no connection");
  }
}

// function subscribe(ros, topicDetails) {
//     console.log(topicDetails, ros.socket.url);
//     var topic = new ROSLIB.Topic({
//         ros: ros,
//         name: topicDetails.name,
//         messageType: topicDetails.type,
//     });
//     topic.advertise();
//     topic.messageType = topicDetails.type;
//     topic.subscribe(function (data) {
//         processAlarmInfo(data, this.messageType, this.ros.socket.url, this.ros.socket.url.split("//")[1].split(":")[0])
//     });
// }

const { Kafka } = require('kafkajs');
function callingRadarKafka() {

  const kafka = new Kafka({
    clientId: 'radar-app',
    //brokers: ['127.0.0.1:9092'],
    brokers: ['192.168.31.1:9092']
    // brokers: ['192.168.0.108:9092']
  });

  const consumer = kafka.consumer({
    groupId: 'radar-group',
    //sessionTimeout: 500000,      // 5 minutes
    heartbeatInterval: 10000,    // 10 sec
    sessionTimeout: 60000,
    rebalanceTimeout: 120000,
  });
  const run = async () => {
    await consumer.connect();
    console.log('Connected to Kafka');

    await consumer.subscribe({
      topic: 'radar_processed',
      fromBeginning: true,
    });

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const kafkaData = JSON.parse(message.value.toString());
          console.log("Received Kafka message:");

          // 🔹 Transform Kafka radar data into AlarmMsg structure
          const transformedData = {
            alarm_location: [
              kafkaData.track.longitude,
              kafkaData.track.latitude
            ],
            event_id: kafkaData.track.id,
            alarm_type: 1,               // hardcoded (primary)
            record_flag: 0,              // hardcoded
            cam_id: "RADAR_1",
            sensors_triggered: 0,      // hardcoded index
            raw_data: kafkaData
          };

          const ip = "127.0.0.1"; // or actual radar IP

          await processAlarmInfo(
            transformedData,
            "mass/targets",
            "",
            ip
          );

        } catch (err) {
          console.error("Kafka parse error:", err);
        }
      },
    });
  };

  run().catch(console.error);
}

var track = [];

async function processAlarmInfo(data, type, url, ip) {
  //  console.log("processAlarmInfo data",data, type, url, ip);
  if (type == "perception_msgs/AlarmMsg") {
    //console.log('kkl',data, type, url, ip)
    var loc = data.alarm_location;
    var eventId = data.event_id;

    var options = { json: true }
    options.url = "http://localhost:3058/api/sensor/get-sensor-config";
    options.body = { "ip": "195.67.6.3" }
    options.method = "POST"
    request(options, (err, response, body) => {
      // console.log("---res kkl---", response.body);
      if (!err) {
        let loc = response.body.data.sensor_location.coordinates;
        if (data.alarm_type == 1 && data.record_flag == 0) { // recording the video
          sendRequest(data.cam_id.replace(/_/g, '.'), eventId, "start");
        }
        else if (data.alarm_type == 1 && data.record_flag == 1) { // stop the recording the video
          sendRequest(data.cam_id.replace(/_/g, '.'), eventId, "stop");
        }

        if (data.alarm_type == 1 || data.alarm_type == 2) {
          sendAlarmDataToMapService(loc[1], loc[0], eventId, data.alarm_type);
        }
        sendAlarmDataToAlarmService(loc[1], loc[0], eventId, data.alarm_type,
          sensors_triggered[data.sensors_triggered], data.record_flag); //***Herer
      }
    });
  } else if (type == 'mass/radars') {
    let radars = data.radars
    for (let index = 0; index < radars.length; index++) {
      const radar = radars[index];
      let radarInfo = { "ip": radar.ip, "uid": radar.uid, "location": radar.location }
      radarsInfo.push(radarInfo)
    }
  }
  else if (type == 'mass/targets') {
    curr_radar = []
    curr_radar.push(data.raw_data)
    targets = curr_radar
    isNewDataReceived = true;
  }
}

// function processAlarmInfo(data, type, url, ip) {
//     if (type == "perception_msgs/AlarmMsg") {
//         console.log(data, type, url, ip)
//         var loc = data.alarm_location;
//         var eventId = data.event_id;

//         var options = { json: true }
//         options.url = "http://localhost:3058/api/sensor/get-sensor-config";
//         options.body = { "ip": ip }
//         options.method = "POST"
//         request(options, (err, response, body) => {
//             // console.log("---res---", response.body);
//             if (!err) {
//                 let loc = response.body.data.sensor_location.coordinates;
//                 if (data.alarm_type == 1 && data.record_flag == 0) { // recording the video
//                     sendRequest(data.cam_id.replace(/_/g, '.'), eventId, "start");
//                 }
//                 else if (data.alarm_type == 1 && data.record_flag == 1) { // stop the recording the video
//                     sendRequest(data.cam_id.replace(/_/g, '.'), eventId, "stop");
//                 }

//                 if (data.alarm_type == 1 || data.alarm_type == 2) {
//                     sendAlarmDataToMapService(loc[1], loc[0], eventId, data.alarm_type);
//                 }
//                 sendAlarmDataToAlarmService(loc[1], loc[0], eventId, data.alarm_type,
//                     sensors_triggered[data.sensors_triggered], data.record_flag); //***Herer
//             }
//         });
//     } else if (type == 'mass/targets') {
//         targets = data.targets
//         isNewDataReceived = true;
//     } else if (type == 'geometry_msgs/Pose') {
//         sendUGVTrackDataToMapService(data.position.x, data.position.y);
//     } else if (type == 'health_node/Health_Msg') {
//         sendHealthDataToResponseService(data)
//     } else if (type == 'mass/radars') {
//         let radars = data.radars
//         for (let index = 0; index < radars.length; index++) {
//             const radar = radars[index];
//             let radarInfo = { "ip": radar.ip, "uid": radar.uid, "location": radar.location }
//             radarsInfo.push(radarInfo)
//         }
//     } else if (type == 'iio_skyfort_ros/DeviceThreat') {
//         // sendHealthDataToResponseService(data) gps home pilot
//         const threats = data.threats
//         console.log(threats)
//         AIDSThreats = threats
//         for (let index = 0; index < threats.length; index++) {
//             const threat = threats[index];
//             sendAlarmDataToAlarmService(threat.gps.lat, threat.gps.lon, threat.threat_id, 1, ["AIDS"], false);
//         }

//     } else if (type == 'ugs_driver/UgsData') {
//         // sendAlarmDataToAlarmService(loc[1], loc[0],eventId, data.alarm_type, st, data.record_flag);
//         console.log(data)
//     }
// }


function sendRequest(ip, alarm_id, event) {
  request({
    method: 'get',
    url: 'http://195.67.15.3:5000/' + event + '/record?ip=' + ip + '&name=' + alarm_id,
    json: true,
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("---response---", body);
    }
  })
}

// setInterval(function () {

//     if (targets.length > 0 && isNewDataReceived) {
//         console.log(targets)
//         var radar_targets = [];
//         for (let i = 0; i < targets.length; i++) {
//             let target = targets[i];
//             let radar_target = {}
//             radar_target.id = target.uid;
//             if (target.srcUid[0] != undefined) {
//                 radar_target.radarId = target.srcUid[0]
//                 for (let index = 0; index < radarsInfo.length; index++) {
//                     const radarInfo = radarsInfo[index];
//                     if (radarInfo.uid == target.srcUid[0]) {
//                         radar_target.ip = radarInfo.ip;
//                         break;
//                     }
//                 }
//             }
//             radar_target.tail = [];

//             for (let index = 0; index < target.tail.length; index++) {
//                 const point = target.tail[index];
//                 radar_target.tail.push([point.longitude, point.latitude]);
//             }
//             let isPresent = false;
//             for (let index = 0; index < radar_targets.length; index++) {
//                 const tar = radar_targets[index];
//                 if (tar.id == radar_target.id) {
//                     isPresent = true;
//                     tar.tail = radar_target.tail;
//                     break;
//                 }
//             }

//             if (!isPresent) {
//                 radar_targets.push(radar_target);
//             }
//         }
//         sendRadarTrackDataToMapService(radar_targets)
//         isNewDataReceived = false;
//     }
// }, 100);

setInterval(function () {

  if (targets.length > 0 && isNewDataReceived) {
    //console.log(targets)
    var radar_targets = [];
    for (let i = 0; i < targets.length; i++) {
      let target = targets[i];
      let radar_target = {}
      radar_target.id = target.track.id;
      radar_target.radarId = 223
      radar_target.ip = "195.67.6.3";
      radar_target.tail = [];

      // for (let index = 0; index < target.tail.length; index++) {
      //     const point = target.tail[index];
      //     radar_target.tail.push([point.longitude, point.latitude]);
      // }

      radar_target.tail.push([target.track.longitude, target.track.latitude]);

      let isPresent = false;
      for (let index = 0; index < radar_targets.length; index++) {
        const tar = radar_targets[index];
        if (tar.id == radar_target.id) {
          isPresent = true;
          tar.tail = radar_target.tail;
          break;
        }
      }

      if (!isPresent) {
        radar_targets.push(radar_target);
      }
    }
    sendRadarTrackDataToMapService(radar_targets)
    isNewDataReceived = false;
  }
}, 100);


var options = {
  json: true,
}
function sendHealthDataToResponseService(data) {
  var options = { json: true }
  options.url = "http://localhost:3001/api/sensor/sensor_health";
  options.body = data
  options.method = "POST"
  request(options, (err, response, body) => {
    failedResponse(response, err);
  });
}

function sendAlarmDataToMapService(lat, lon, id, type) {
  var options = { json: true }
  options.url = "http://localhost:3058/api/map/post-alarm";
  options.body = { "lat": lat, "lng": lon, "id": id, "type": type, "category": "alarm" }
  options.method = "POST"
  request(options, (err, response, body) => {
    failedResponse(response, err);
  });
}

function sendUGVTrackDataToMapService(x, y) {
  var options = { json: true }
  options.url = "http://localhost:3001/api/map/ugv/pose";
  options.body = { "x": x, "y": y, "category": "map", "type": "ugv-pose", "ip": "10.66.40.61" }
  options.method = "POST"
  request(options, (err, response, body) => {
    failedResponse(response, err);
  });
}


function sendRadarTrackDataToMapService(track) {
  // var options = { json: true }
  // options.url = "http://localhost:3001/api/map/radar/track";
  // options.body = { "category": "map", "type": "radar_track", "track": track }
  // options.method = "POST"
  // request(options, (err, response, body) => {
  //     failedResponse(response, err);
  // });

  console.log("sending the alarm to alarm service (sendRadarTrackDataToMapService)");

  const fakeReq = {
    body: {
      category: 'map',
      type: "radar_track",
      track: track
    }
  };


  const fakeRes = {
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    send: function (data) {
      console.log("Alarm service response:", data);
    }
  };

  //armContr.createUpdateAlarms(fakeReq, fakeRes);
  mapsContr.track(fakeReq, fakeRes);
}



function sendAlarmDataToAlarmService(lat, lon, id, type, st, record_flag) {
  try {
    console.log("sending the alarm to alarm service (sendAlarmDataToAlarmService)");

    const fakeReq = {
      body: {
        location: [lon, lat],
        alarm_id: id,
        event_id: id,
        camera_id: id,
        alarm_type: type,
        sensors_triggered: st,
        record_flag: record_flag
      }
    };

    const fakeRes = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      send: function (data) {
        console.log("Alarm service response:", data);
      }
    };

    console.log("Prepared fakeReq for Alarm Service: kkl", fakeReq);
    armContr.createUpdateAlarms(fakeReq, fakeRes);

  } catch (err) {
    console.log(err);
  }
}
//       function sendAlarmDataToAlarmService(lat, lon, id, type, st, record_flag) {
//         try{
//             createUpdateAlarms();

// //     console.log("sending the alarm  to alarm service")
//     options.url = "http://localhost:3058/api/alarm/create-update";
//     options.body = { location: [lon, lat], alarm_id: id, event_id: id, camera_id: id, alarm_type: type, sensors_triggered: st, record_flag: record_flag }
//     options.method = "POST"
//     options.json = true;
//     console.log("sending the alarm  to alarm service")
//     request(options, (err, response, body) => {
//         failedResponse(response, err);
//     });
//  } catch (err) {
//      console.log(err);
//  }}

function failedResponse(response, err) {
  if (err) {
    console.log(err.code);
  }
}
module.exports = {
  callingRadarKafka
}