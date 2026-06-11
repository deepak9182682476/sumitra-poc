// ALARM Events
module.exports = (sequelize, Sequelize) => {
    const AlarmEvents = sequelize.define("alarm_events", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        alarm_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'alarms',
                key: 'alarm_id'
            },
            allowNull: false
        },
        event_type: {
            type: 'VARCHAR',
            allowNull: false
        },
        timeofevent: {
            type: Sequelize.TIME,
            allowNull: false
        },
        location: {
            type: 'POINT',
            allowNull: false
        }
    });

    AlarmEvents.sync({ force: false }).then(() => console.log("Alarm Events table created")).catch(err => {
        console.log(err)
    });

    return AlarmEvents;
};