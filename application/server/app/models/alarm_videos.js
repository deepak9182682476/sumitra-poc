// ALARM Videos
module.exports = (sequelize, Sequelize) => {
    const AlarmVideos = sequelize.define("alarm_videos", {
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
        camera_id: {
            type: 'VARCHAR',
            allowNull: false
        },
        video_url: {
            type: 'TEXT',
            allowNull: true
        },
        start_time: {
            type: Sequelize.TIME,
            allowNull: true
        },
        end_time: {
            type: Sequelize.TIME,
            allowNull: true
        },
        created_on: {
            type: Sequelize.DATE,
            allowNull: true
        }
    });

    AlarmVideos.sync({ force: false }).then(() => console.log("Alarm videos table created")).catch(err => {
        console.log(err)
    });

    return AlarmVideos;
};