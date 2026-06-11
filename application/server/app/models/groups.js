module.exports = (sequelize, Sequelize) => {
    const Groups = sequelize.define("groups", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        group_name: {
            type: 'VARCHAR',
            allowNull: false
        }
    });

    Groups.sync({ force: false }).then(() => console.log("Groups table is connected")).catch(err => {
        console.log(err)
    });


    return Groups;
};