const language = require("../controllers/language");
const router = require("express").Router();
const middleware = require('../service/middleware');

// Upload file    
router.post("/upload", language.upload);

// Read file
router.get('/excel-json', language.getExcelJsonData);

// app.use('/api/language', router);

module.exports = router;