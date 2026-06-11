const map = require("../controllers/map");
const router = require("express").Router();
const middleware = require('../service/middleware');

// qrt location
router.post("/qrt-location", map.qrtLocation);

// Get perimeter data   
router.get("/get-mapconfig", map.getMapConfig);

// create perimeter
router.post("/save-mapconfig", map.mapConfig);

// save uploaded map
router.post("/save-uloaded-map", map.saveUploadedMap);

// get all uploaded map files
router.get("/get-uploaded-map-files", map.getUploadedMapFiles);

// update uploaded map
router.put("/update-uploaded-map", map.updateUploadedMap);

// delete uploaded map
router.delete("/delete-uploaded-map/:id/:filename", map.deleteUploadedMap);

// Retrieve Alarm from the ROS-Web Adapter.
router.post("/post-alarm", map.postAlaram);

// finding out the distance between two points with specied unit
router.post("/distance", map.distance);

// UGV pose from Adapter
router.post("/ugv/pose", map.ugvTrack);

// Radar track of all the objects in the site
router.post("/radar/track", map.track);

// Get Radar track data
router.get("/radar/track-data", map.receiveTrackDataFromMapService);

// BFO track of all the objects in the site
router.post("/radar/bfo/track", map.mapWithBfoTrack);

// Get alarm with zone data
router.get('/alarm/zones/:zone_id', map.getAlarmWithZoneData); 

// app.use('/api/map', router);

// Get AWS Data
router.post("/get-aws", map.getAwsData);


module.exports = router;
