'use strict';
module.exports = (sequelize, Sequelize) => {
    var User = sequelize.define('User', {
        username: {
            type: Sequelize.STRING
        },
        MMR: {
            type: Sequelize.INTEGER
        },
        location: {
            type: Sequelize.ARRAY(Sequelize.FLOAT)
        },
        WL: {
            type: Sequelize.FLOAT
        },
        status: {
            type: Sequelize.ENUM,
            values: ['offline', 'lobby', 'queue', 'game']
        },
        currentGameId: {
            type: Sequelize.INTEGER
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    }, {});
    User.associate = function(models) {
        // associations can be defined here
    };
    return User;
};