const db_config = require('../config/env').db_config;
const Sequelize = require("sequelize");
const path = require('path');
const fs = require('fs');
const { Kafka } = require('kafkajs');
const maingate = require("../service/topic");


const sequelize = new Sequelize(db_config.database, db_config.username, db_config.password, {
  host: db_config.host,
  port: db_config.port,
  dialect: db_config.dialect,
  pool: db_config.pool,
  define: {
    timestamps: false,
    freezeTableName: true
  },
  logging: false
});

const db = {};

db.Sequelize = Sequelize
db.sequelize = sequelize

sequelize
  .authenticate()
  .then(function (err) {
    console.log('Connection has been established successfully.');

    fs.readdirSync(__dirname)
      .filter((file) =>
        file !== 'index.js'
      )
      .forEach((file) => {
        var model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model
      })

    db.notification = require("./notification")(sequelize, Sequelize);
    maingate.callingRadarKafka();

    // const kafka = new Kafka({
    //   clientId: 'radar-app',
    //   brokers: ['127.0.0.1:9092'],
    // });
    
    // const consumer = kafka.consumer({ groupId: 'radar-group' });
    
    // const run = async () => {
    //   await consumer.connect();
    //   console.log('Connected to Kafka');
    
    //   await consumer.subscribe({
    //     topic: 'radar_processed',
    //     fromBeginning: true,
    //   });
    
    //   await consumer.run({
    //     eachMessage: async ({ topic, partition, message }) => {
    //       console.log({
    //         value: message.value.toString(),
    //       });
    //     },
    //   });
    // };
    
    // run().catch(console.error);
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });


module.exports = db;

