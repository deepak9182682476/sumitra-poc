var net = require('net'), JsonSocket = require('json-socket');

exports.tcpServerConnect = (params) => {
    startServer(params);
}
var interval = undefined;
var commandtoBeSent = undefined
var isNewCommand = false;

function startServer(params) {
    console.log(params.port, params.host)
    var socket = new net.Socket();
    socket.connect(params.port, params.host);

    socket.on('connect', function () { // Don't send until we're connected
        console.log('Client: connection established with server ');
        socket.on('data', function (recivedData) {
            console.log("reciving the data ", recivedData);
            clearInterval(interval);
            socket.end();
        });
        interval = setInterval(function () {
            if (isNewCommand) {
                socket.setKeepAlive(true);
                console.log(" data to be sent to uav", commandtoBeSent);
                let buf = Buffer.from(commandtoBeSent);
                console.log("before sending the data-----", buf);
                socket.setEncoding('utf8');
                socket.write(buf);
                isNewCommand = false;
            }
        }, 500)
    });

   /*  socket.on('drain', function (drain) {
        console.log('Socket Drain : ' + drain);
    }); */

    socket.on('error', function (error) {
        console.log('Socket Connection Error: ' + error);
        // clearInterval(interval)
        // startServer(params)
    });
}

exports.command = (command) => {
    commandtoBeSent = command;
    isNewCommand = true;
}

exports.tcpZmotionServerConnect = (params) => {
    var socket = new net.Socket(); // Decorate a standard net.Socket with JsonSocket
    socket.connect(params.port, params.host);

    socket.on('connect', function () { // Don't send until we're connected

        console.log('Client: connection established with server');

        socket.on('data', function (data) {
            console.log("---data---", data);
            uavStatus = data.toString();
        });

        console.log(" data to be sent to uav", commandtoBeSent);
        // let buf = Buffer.from(commandtoBeSent);
        // console.log("before sending the data-----", buf);
        socket.setEncoding('utf8');
        socket.write(commandtoBeSent);
        isNewCommand = false;
    });

    socket.on('error', function (error) {
        console.log('Socket Connection Error: ' + error);
    });
}