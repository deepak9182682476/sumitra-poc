// Response Video
module.exports = (sequelize, Sequelize) => {
    const ResponseVideo = sequelize.define("response_video", {
        response_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            foreignKey: true,
            references: {
                model: 'response_master',
                key: 'response_id'
            },
            allowNull: false
        },
        video_url: {
            type: 'VARCHAR',
            allowNull: false
        },
        start_time: {
            type: 'VARCHAR',
            allowNull: false
        },
        end_time: {
            type: 'VARCHAR',
            allowNull: false
        }
    });

    ResponseVideo.sync({ force: false }).then(() => console.log("Response Video table created")).catch(err => {
        console.log(err)
    });

    return ResponseVideo;
};