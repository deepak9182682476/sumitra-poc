require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const log = require('./app/utils/log');
const routes = require('./app/routes');
const auth = require("./app/controllers/auth");
const db_controller = require("./app/controllers/db");
const { checkActiveTime } = require("./app/service/middleware");
const languageRouter = require('./app/routes/language');
const maingateRouter = require('./app/routes/maingate');

const app = express();

// Security headers (do not change how the API works)
app.disable('x-powered-by');                      // do not advertise the server type
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff'); // browsers must not guess file types
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');     // pages cannot be framed by other sites
  next();
});

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use('/images', express.static('images')); 
app.use('/translation', express.static('uploads')); 

// Default route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to SUMITRA API Server." });
});

var logger = function (err, req, res, next) {
  req.body.root_module = 'MCCS';
  req.body.sub_module = 'Service';
  log.logs(req, res);
}

app.use(logger);

// Logger Generator
app.post('/createLog', (req, res) => {
  log.logs(req, res);
});

// Check and Get active time config
app.get('/api/get-time-config', db_controller.getActiveTimeConfig);

app.post('/api/time-config', db_controller.activeTimeConfig);

// Login
app.post("/api/auth/login", auth.validateLogin);

// Language
app.use('/api/language', languageRouter);

// Maingate
app.use('/api/maingate', maingateRouter);

app.use('/', checkActiveTime, routes);

// catch 404 (the old handler referred to an undefined variable and answered 500 with "err is not defined")
app.use(function (req, res, next) {
  res.status(404).json({ error: { message: 'Not found' } });
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // send the error
  res.status(err.status >= 100 && err.status < 600 ? err.status : 500).send(err.message);
});


// Create a Server
const HOST = process.env.HOST;
const PORT = process.env.PORT || 3000;
// Listen on all network cards so the other PC (172.16.8.237) can reach this backend.
// HOST in .env stays 'localhost' because it is also used for the backend's own internal calls.
const server = app.listen(PORT, process.env.BIND_HOST || "0.0.0.0", function () {

  let host = server.address().address;
  let port = server.address().port;

  console.log("Server listening on http://%s:%s", host, port);
});

module.exports = app;
// module.exports = server;

