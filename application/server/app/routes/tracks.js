const tracks = require("../controllers/tracks");
const router = require("express").Router();
require("../service/trackStore").startRetention(); // daily clean-up of old points

// Track History dashboard
router.get("/summary", tracks.summary);
router.get("/points", tracks.points);

module.exports = router;
