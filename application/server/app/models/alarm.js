module.exports = (sequelize, Sequelize) => {
    const Alarms = sequelize.define("alarms", {
        alarm_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        alarmmsg_time: {
            type: Sequelize.TIME,
            allowNull: false
        },
        alarm_type: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        event_id: {
            type: 'VARCHAR',
            allowNull: false
        },
        camera_id: {
            type: 'VARCHAR',
            allowNull: false
        },
        location: {
            type: 'POINT',
            allowNull: false
        },
        sensors_triggered: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    });

    Alarms.sync({ force: false }).then(() => console.log("Alarm table created")).catch(err => {
        console.log(err)
    });

    return Alarms;
};