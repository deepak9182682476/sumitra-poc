const maingate = require("../controllers/maingate");
const router = require("express").Router();

// Get All Cameras Info  
router.get("/get-cameras-list", maingate.camerasList);

// Create Visitor Entry   
router.post("/create-visitor-entry", maingate.create);

//Update Cameras details
router.put("/camera-update/:id", maingate.cameraUpdate);

// Main routes
// app.use('/api/maingate', router);

module.exports = router;