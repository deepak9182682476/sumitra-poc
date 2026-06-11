module.exports = (sequelize, Sequelize) => {
    const Users = sequelize.define("users", {
        user_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_name: {
            type: 'VARCHAR'
        },
        password: {
            type: 'VARCHAR'
        },
        user_role: {
            type: 'VARCHAR',
            allowNull: false
        },
        failed_attempts: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        lastlogin_attempt: {
            type: Sequelize.TIME,
            allowNull: true
        },
        is_logged_in: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },
        theme: {
            type: 'VARCHAR',
            allowNull: true
        }
    });

    Users.sync({ force: false }).then(() => console.log("User table is connected")).catch(err => {
        console.log(err)
    });


    return Users;
};