    const response = require("../controllers/response");
    const router = require("express").Router();
    const env = require("../config/env");
    const middleware = require('../service/middleware');    

    // Retrieve all data    
    router.get("/zone-wise", response.zoneWise);

    // Retrieve ugvs and uavs
    router.get("/get-geojson", response.getGeoJson);

    // Save/Update Patrol Flag
    router.post("/save-patrol-flag", response.savePatrolFlag);
    
    // Save ugv manual route
    router.post("/save-ugv-manual-route", response.saveUGVManualRoute);

    // get ugv manual route
    router.get("/get-ugv-manual-route", response.getUGVManualRoute);

    // get Assignment Rules
    router.get("/get-assignment-rules", response.getAssignmentRules);

    // Save/Update Assignment Rules
    router.post("/save-assignment-rules", response.saveAssignmentRules);

    // Get RNDF Configuration
    router.get("/get-rndf", response.getRndfConfig);

    // Send Zone Info to WEB ROS
    router.post("/send-zone-info-to-ros", response.sendZoneInfoToWebRos);

    // Assign to command to UAV
    router.post("/assign-uav-command", response.sendCommands);

    // Assign to response like UAV, UGV, QRT
    router.post("/assign-to-response", response.assignToResponse);

    // Assign waypoints to response like UGV
    router.post("/assign-access-to-waypoints", response.assignAccessToWaypoints);

    // Save RNDF Configuration
    router.post("/save-rndf", response.saveRndfConfig);

    // Set Default RNDF Configuration
    router.put("/set-default-rndf/:id", response.setDefaultRndfConfig);
    
    // Delete RNDF Configuration
    router.delete("/delete-rndf/:id/:filename", response.deleteRndfConfig);

    // Update RNDF Config
    router.put("/update-rndf", response.updateRndfConfig);

    // Get Assigned Wayppoints
    router.post("/assign-waypoints", response.assignWaypoints);

    // Check two area are collide or not
    router.post("/check-area-collision", response.checkAreaCollision);

    router.post("/radar/tracks", response.tracks);

    router.get("/uav_track", response.uavTrack);

    // Main routes
    // app.use('/api/response', router);

    module.exports = router;