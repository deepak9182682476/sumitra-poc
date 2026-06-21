const { Sequelize } = require('sequelize');
const dbConfig = require('./app/config/env').db_config;

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: 'postgres',
  logging: false
});

async function main() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    
    const [alarms] = await sequelize.query("SELECT alarm_id, alarm_type, ST_AsText(location) as loc FROM alarms ORDER BY alarm_id DESC LIMIT 10");
    console.log('--- ALARMS ---');
    console.log(alarms);
    
    const [events] = await sequelize.query("SELECT alarm_id, event_type, ST_AsText(location) as loc, timeofevent FROM alarm_events ORDER BY timeofevent DESC LIMIT 10");
    console.log('--- EVENTS ---');
    console.log(events);
    
    await sequelize.close();
  } catch (err) {
    console.error(err);
  }
}

main();
