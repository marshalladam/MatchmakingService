'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Games', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            playerOne: {
                type: Sequelize.STRING
            },
            playerTwo: {
                type: Sequelize.STRING
            },
            gameStatus: {
                type: Sequelize.ENUM,
                values: ['In Progress', 'Forfeited', 'Completed']
            },
            winner: {
                type: Sequelize.STRING,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Games');
    }
};