'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
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
            updatedAt: Sequelize.DATE

        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Users');
    }
};