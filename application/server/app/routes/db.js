
var router = require("express").Router();

const db = require("../controllers/db");
const middleware = require('../service/middleware');

// Check Database Connection
router.get("/check-db-connection", db.checkDBConnection);

// Create Notification
router.post("/create", db.createNotification);

// Post Analysis Handling
router.get('/custom/findAll', db.getPostAnalysisData);

// Post Analysis Save Search
router.post('/custom/save-search', db.saveSearch);

// Get Saved Search Data
router.get('/custom/save-search', db.getSaveSearch);

// Delete Saved Search Data
router.delete('/custom/delete-search/:id', db.deleteSavedSearch);

router.delete('/clear/alarms-data', db.clearAlarms);

router.post('/custom/config', db.dbConfig);

router.get('/get-alarm-obj-transaction', db.getTblExternalAlarmObjTransaction);

// Retrive UAV data
router.get('/custom/find-uav', db.getAllUAV);

// Retrive UAV data
router.get('/custom/find-ugv', db.getAllUGV);

router.delete('/custom/delete/:id/:type', db.delete);

router.put('/custom/update-uav', db.updateUAV);

router.post('/custom/add-uav', db.insertUAV);

router.put('/custom/update-ugv', db.updateUGV);

router.post('/custom/add-ugv', db.insertUGV);


// app.use("/api/", router);
module.exports = router;
