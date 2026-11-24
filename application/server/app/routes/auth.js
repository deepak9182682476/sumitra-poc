const auth = require("../controllers/auth");
const log = require('../utils/log');
const middleware = require('../service/middleware');

var router = require("express").Router();

//Login
// router.post("/login", auth.validateLogin);

//Register
// router.post("/register", auth.create);

//Find all
router.get("/users", auth.findAll);


//Get Authendication Token
router.get("/get-token/:token", auth.getauthenticationToken);

//Verify Access Token
router.get("/verfiy-token/:token", auth.verifyToken);

//Find by id
// router.get("/users/:id", middleware.validateToken, auth.findById);

//Update
// router.put("/users/:id", middleware.validateToken, auth.update);

//Update user details
// signed-in users only (stops anyone on the network changing a password)
router.put("/update-user/:id", middleware.requireLogin, auth.updateUser);

//Delete User
// router.delete("/users/:id", middleware.validateToken, auth.delete);


/********************************************** 
           User Role Management 
**********************************************/
// router.post('/create/role', middleware.validateToken, auth.createRole);

// router.get('/role/all', middleware.validateToken, auth.getAllRoles);

/********************************************** 
           Group Creation
**********************************************/
// router.post('/create/group', auth.createGroup);

// router.get('/group/all', middleware.validateToken, auth.getAllGroups);


// Handling logs
router.post('/logs', log.logs);


// Main Routes
// app.use('/api/auth', router);

module.exports = router;