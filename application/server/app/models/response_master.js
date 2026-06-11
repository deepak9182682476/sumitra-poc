// Response Master
module.exports = (sequelize, Sequelize) => {
    const ResponseMaster = sequelize.define("response_master", {
        response_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        response_type: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    });

    ResponseMaster.sync({ force: false }).then(() => console.log("Response master table created")).catch(err => {
        console.log(err)
    });

    return ResponseMaster;
};