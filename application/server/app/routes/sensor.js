const sensor = require("../controllers/sensor");
const router = require("express").Router();
const middleware = require('../service/middleware');

// Get Perimeter GeoJson
router.get("/get-perimeter-json", sensor.getPerimeterJson);

// Get Sensors GeoJson
router.get("/get-sensors-json", sensor.getSensorsJson);

// Retrieve all data    
router.get("/all", sensor.findAll);

// Create sensor data    
router.post("/create", sensor.create);

// Update sensor data    
router.put("/update", sensor.update);

// Update status of sensor    
router.put("/status-update", sensor.statusUpdate);

// Retrieve Diagnostics Info
router.get('/diagnostics-data', sensor.getDiagnosticsData);

router.put('/update-diagnostics', sensor.updateDiagnostics);

router.get('/ptz', sensor.PTZControl);

// Retrieve a data by id
// router.get("/:id", sensor.findById);

//paramHeader
router.get("/header", sensor.paramHeader);

// Get Sensors mapped config
router.post("/get-sensor-mapped-config", sensor.getSensorsMappedConfig);

// Get Sensors details based on IP
router.post("/get-sensor-config", sensor.getSensorConfig);

// Get system mapped config
router.get("/get-system-mapped-config", sensor.getSystemMappedConfig);

// Insert/Update system mapped config
router.post("/system-mapped-config", sensor.systemMappedConfig);

router.get('/system-configuration/sensors', sensor.getSensors);
router.get('/system-configuration/', sensor.getConfiguration);

router.post('/system-configuration', sensor.systemConfig);

router.post('/connection-status', sensor.connectionStatus);

router.post('/ping-ip', sensor.pingIp);

// Check two area are collide or not
router.post("/sensor_health", sensor.sensorHealth);

// Read excel file and convert data into json format
router.post("/upload-sensors-data", sensor.sensorsTemplateUpload);

// Main routes
// app.use('/api/sensor', router);

module.exports = router;