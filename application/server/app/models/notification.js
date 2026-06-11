module.exports = (sequelize, Sequelize) => {
    const Notification = sequelize.define("notification", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        type: {
            type: 'VARCHAR',
            allowNull: false
        },
        origin: {
            type: 'VARCHAR'
        },
        time: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW(),
            allowNull: false
        },
        data: {
            type: Sequelize.JSON,
            allowNull: false
        },
        read_by: {
            type: Sequelize.ARRAY(Sequelize.INTEGER),
            allowNull: true
        },
        cleared_by: {
            type: Sequelize.ARRAY(Sequelize.INTEGER),
            allowNull: true
        }
    });

    Notification.sync({ force: false }).then(() => console.log("Notification table is created")).catch(err => {
        console.log(err)
    });


    return Notification;
};