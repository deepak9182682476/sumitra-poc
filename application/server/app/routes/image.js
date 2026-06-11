/**
 * Name : Nagaraju
 * Date of creation: 29-09-2020
 * E-Mail: g-nagaraju@lntecc.com
 */

const image = require("../controllers/image");
const events = require('events');
const router = require("express").Router();
const middleware = require('../service/middleware');

// Retrieve Image Info
router.get('/image-info', image.findImageInfo);

// Get image from database
router.get('/image-from-database', image.findImageInfofromDataBase);

// Extract frames from video
router.post('/extract-frames', image.extractFrames);

// app.use('/api/image', router);

router.get('/getImage', image.getImage);

router.get('/getVideo', image.getVideo);


module.exports = router;