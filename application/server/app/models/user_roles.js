module.exports = (sequelize, Sequelize) => {
    const User_Roles = sequelize.define("user_roles", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        role_name: {
            type: 'VARCHAR',
            allowNull: false
        },
        permissions: {
            type: 'VARCHAR',
            allowNull: false
        },
        group_id: {
            type: 'INT',
            allowNull: false
        }
    });

    User_Roles.sync({ force: false }).then(() => console.log("User role table is connected")).catch(err => {
        console.log(err)
    });


    return User_Roles;
};