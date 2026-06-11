const axios = require('axios');
const env = require('../../config/env');

/**
 * Handling Logs Data
 * @param request 
 * @param response
 */
exports.logs = (req, res) => {
    axios.post(env.log_api_url, req.body);
};
