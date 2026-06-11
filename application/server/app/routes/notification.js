const notification = require("../controllers/notification");
const middleware = require('../service/middleware');

var router = require("express").Router();
// Get perimeter data    
router.post("/persist", notification.persist);

// Retrieve all data    
router.get("/all", notification.findAll);

// Change Notification Status   
router.put("/change-status/:id", notification.changeStatus);

// app.use('/api/notification', router);

module.exports = router;