
const { createLogger, format, transports } = require('winston');
const path = require('path');

class LoggerService {
    constructor(route) {
        this.log_data = null;
        this.route = route;
        const logger = createLogger({
            transports: [
                new transports.Console(),
                new transports.File({
                    filename: path.join(__dirname, `../../logs/${route}.log`),
                    maxsize: 100000000 // 100MB
                })
            ],
            format: format.combine(
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                format.printf((info) => {
                    if (this.log_data) {
                        let message = `${info.level.toUpperCase()} | ${info.timestamp} | ${this.log_data.root_module} | ${this.log_data.sub_module} | ${this.log_data.method} | log_message:${JSON.stringify(this.log_data.data)}`;
                        return message;
                    }
                })
            )
        });
        this.logger = logger;
    }
    setLogData(log_data) {
        this.log_data = log_data;
    }
    async info(message) {
        this.logger.log('info', message);
    }
    async infoObj(message, obj) {
        this.logger.log('info', message, { obj });
    }
    async debug(message) {
        this.logger.log('debug', message);
    }
    async debugObj(message, obj) {
        this.logger.log('debug', message, { obj });
    }
    async error(message) {
        this.logger.log('error', message);
    }
    async errorObj(message, obj) {
        this.logger.log('error', message, { obj });
    }
    async warn(message) {
        this.logger.log('warn', message);
    }
    async warnObj(message, obj) {
        this.logger.log('warn', message, { obj });
    }
}

module.exports = LoggerService