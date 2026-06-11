const env = require('../config/env');
const request = require('request');
const db = require('../models');

exports.authendicateToken = (req, response, next) => {
    const authHeader = req.headers['auth-token'];

    if (authHeader || req.headers && req.headers['private']) {
        if (authHeader) {
            request(env.base_url + `/api/auth/get-token/${authHeader}`, { json: true }, (err, res, body) => {
                console.log(res.body);
                if (res && res.body && res.body.isValidToken) {
                    next();
                } else {
                    response.status(403).send({ error: true, statusCode: 403, message: 'Token is invalid' });
                }
            });
        } else if (req.headers['private']) {
            next();
        }
    } else {
        response.status(401).send({ error: true, statusCode: 401, message: 'Token is invalid' });
    }
}

exports.checkActiveTime = (req, res, next) => {
    if (req.headers && req.headers['check_active_time']) {
        next();
    }
    else {
        db.sequelize.query('select * from active_time_config', { type: db.sequelize.QueryTypes.SELECT }).then((result) => {
            if (result && result.length) {
                const end_time = Math.round(new Date(result[0].end_time).getTime() / 1000);
                const active_time = Math.round(new Date().getTime() / 1000);
                if (end_time > active_time) {
                    next();
                } else {
                    res.status(403).send({ error: true, statusCode: 403, message: 'Access Denied, Timeout to access the server' })
                };
            }
            else {
                res.status(401).send({ error: true, statusCode: 401, message: 'Active Time not defined in system' });
            }
        }).catch((error) => {
            res.status(400).send({ error: true, statusCode: 400, message: error.message });
        });
    }    
}
