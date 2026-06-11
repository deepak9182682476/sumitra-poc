// ALARM Tail
module.exports = (sequelize, Sequelize) => {
    const AlarmTail = sequelize.define("alarm_tail", {
        uid: {
            type: 'VARCHAR',
            primaryKey: true
        },
        ea_alarm_id: {
            type: 'VARCHAR',
            references: {
                model: 'alarms',
                key: 'alarm_id'
            },
            allowNull: false
        },
        ca_alarm_id: {
            type: 'VARCHAR',
            references: {
                model: 'alarms',
                key: 'alarm_id'
            },
            allowNull: true
        },
        tail: {
            type: Sequelize.GEOMETRY
        }
    });

    AlarmTail.sync({ force: false }).then(() => console.log("Alarm Tail table created")).catch(err => {
        console.log(err)
    });

    return AlarmTail;
};