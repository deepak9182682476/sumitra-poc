
const alarms = require("../controllers/alarm");
const events = require('events');
const router = require("express").Router();
const middleWare = require('../service/middleware');

// Retrieve all data with authorized user
// router.get("/all", alarms.findAll);

// Retrieve Alarm Info
router.get('/alarm-info', alarms.alarmInfo);

// Retrieve Alarm Info
router.get('/alarm-tail-info', alarms.alarmTailInfo);

router.post('/create-update', alarms.createUpdateAlarm);

router.put('/acknowledge-clear', alarms.acknowledgeClearAlarm);

router.post('/clear-intrusion-tracks', alarms.clearIntrusionTracks);

// Retrieve Alarm Timeline Info
router.get('/alarm-timeline', alarms.getAlarmTimelineEvents);

// Update Auto/Manual Mode
router.put('/update-auto-manual-mode', alarms.updateModeStatus);

// Get Auto/Manual Mode
router.get('/get-auto-manual-mode', alarms.getModeStatus);

// Find iff distance with lat/long
router.get('/find-distance-iff', alarms.findDistanceInIFF);

// Find within iff threshold with lat/long
router.get('/find-within-iff-threshold', alarms.findWithinThreshold);

router.post('/find-zones-alarm-list', alarms.findZonesAlarmLists);

router.post('/entry-video-clip', alarms.setVideoEntryData);

router.post('/save-alarm-video-clip', alarms.saveAlarmVideoEntry);

router.post('/save-alarm-transaction-clip', alarms.saveAlarmTransactionEntry);

// Create new alarm
// router.post("/create", alarms.create);

// Retrieve a data by id
// router.get("/:id", alarms.findById);

// app.use('/api/alarm', router);

module.exports = router;