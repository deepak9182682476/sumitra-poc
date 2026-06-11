const router = require("express").Router();
const env = require("../config/env");
const WebSocket = require('ws');
//const wss = new WebSocket.Server({ host: env.server_host,port: env.wsPort1 });
//const wss = new WebSocket.Server({ port: env.wsPort1 });
// const wss = new WebSocket.Server({ host: '0.0.0.0', port: env.wsPort1 });

// var wsocket = [];
// let saveToken = null;
// wss.on('connection', function connection(ws) {
//     console.log("websocket connected")
//     wsocket.push(ws);
//     console.log("wsocket",wsocket);
// });


const PORT = 8082;

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`WebSocket server is listening on port ${PORT}`);
});

wss.on('connection', function (ws) {
    console.log('websocket connected');

    ws.on('message', (msg) => {
        console.log('message received:', msg.toString());
    });

    ws.send(JSON.stringify({ msg: 'Hello from server' }));
});

/** Handling websocket */
router.get('/to-ui', async function (req, res) {
    // Make sure body exists
    if (req.body) {
        // Loop through all connected clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                console.log("to-ui back end",req.body);
//                
                client.send(JSON.stringify(req.body));
            }
        });
    }

    res.send("data received");
});


// /** Handling websocket  */
// router.get('/to-ui', async function (req, res) {
//     //console.log(JSON.stringify(req.body), '-------Communication');
//     if (wsocket.length > 0 && req.body) {
//         wsocket.forEach(ws => {
//             console.log("o-ui' back end");
//             ws.send(JSON.stringify(req.body));
//         });
//     }
//     res.send("data received");
// });

function sendToUIHandler (body) {
    if (wsocket.length > 0 && body) {
      wsocket.forEach(ws => {
        console.log("o-ui' back end");
        ws.send(JSON.stringify(body));
      });
    }
  }
  
// Get Token
// router.get('/get-token', async function (req, res) {
//     if (req.query && req.query.token) {
//         saveToken = req.query.token;
//         res.send({ message: 'Token saved successfully', error: false, status: true });
//     } else {
//         res.send({ message: 'Token is required', error: true, status: false });
//     }
// });

// app.use('/communication/', router);

module.exports = router
