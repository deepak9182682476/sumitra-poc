const zones = require("../controllers/zone");
const middleware = require('../service/middleware');
var router = require("express").Router();

// Retrieve all data    
router.get("/all", zones.findAll);

// create
router.post("/create", zones.create);

// Enable or disable of zone
router.post("/enable-disable-zone", zones.enableDisableZone);

// Delete one zone (Zones menu -> click a zone -> Delete zone)
router.delete("/:id", zones.deleteZone);


// // Update
// router.put("/:id/update", middleware.validateToken, zones.update);

// // Delete
// router.delete("/:id", middleware.validateToken, zones.delete);

// app.use('/api/zone', router);

module.exports = router;