const router = require('express').Router();
const dbRouter = require('./db');
const authRouter = require('./auth');
const commRouter = require('./communication');
const alarmRouter = require('./alarm');
// const languageRouter = require('./language');
const mapRouter = require('./map');
const notificationRouter = require('./notification');
const responseRouter = require('./response');
const sensorRouter = require('./sensor');
const zoneRouter = require('./zone');
const imageRouter = require('./image');
const tracksRouter = require('./tracks'); // Track History dashboard
// const maingateRouter = require('./maingate');

router.use('/api', dbRouter);
router.use('/api/auth', authRouter);
router.use('/api/communication', commRouter);
router.use('/api/alarm', alarmRouter);
// router.use('/api/language', languageRouter);
router.use('/api/map', mapRouter);
router.use('/api/notification', notificationRouter);
router.use('/api/response', responseRouter);
router.use('/api/sensor', sensorRouter);
router.use('/api/zone', zoneRouter);
router.use('/api/image', imageRouter);
router.use('/api/tracks', tracksRouter);
// router.use('/api/maingate', maingateRouter);

module.exports = router;
