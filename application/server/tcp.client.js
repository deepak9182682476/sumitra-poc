var net = require('net'), JsonSocket = require('json-socket');
const env = require("./app/config/env");
const request = require("request");

var uavStatus = undefined;
var dataToSent = {
    category: "uav_status",
    data: {
        level: "",
        remaining_time: "",
        ip: "",
        lat: "",
        lon: "",
        zone_id: ""
    }
};

exports.tcpClient = (params) => {

    // console.log("--params---", params);
    var socket = new JsonSocket(new net.Socket()); // Decorate a standard net.Socket with JsonSocket
    socket.connect(params.port, params.host);

    socket.on('connect', function () { // Don't send until we're connected

        console.log('Client: connection established with server');

        socket.on('data', function (responseData) {
            uavStatus = JSON.parse(responseData.toString());
            // console.log("---data----", uavStatus);
            dataToSent.data.lat = uavStatus.lat;
            dataToSent.data.lon = uavStatus.lng;
            dataToSent.data.ip = params.host;
            dataToSent.data.zone_id = params.zone_id;
            dataToSent.data.remaining_time = uavStatus.battery_remaining;

            // console.log(uavStatus, "--data sent to UI--", dataToSent);
            sendDataToUI(dataToSent);
        });
    });

    socket.on('error', function (error) {
        console.log('Socket Connection Error: ' + error);
    });
}

function sendDataToUI(data) {
    try {
        var options = {
            json: true,
            url: env.base_url + `/communication/to-ui`,
            body: data,
            method: "get"
        };
        request(options, (error, response, body) => { });
    }
    catch (err) {
        console.log('tcpClient Data', err);
    }
}

exports.getUAVStatus = () => {
    if (uavStatus != undefined) {
        return uavStatus;
    }
}