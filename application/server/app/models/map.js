module.exports = (sequelize, Sequelize) => {
    const SiteDim = sequelize.define("site_dim", {
        site_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        site_area: {
            type: 'POLYGON',
            allowNull: false
        }
    });

    SiteDim.sync({ force: false }).then(() => console.log("Site dim table created")).catch(err => {
        console.log(err)
    });

    return SiteDim;
};