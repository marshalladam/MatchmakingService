'use strict';
module.exports = (sequelize, DataTypes) => {
    var Game = sequelize.define('Game', {
        playerOne: DataTypes.STRING,
        playerTwo: DataTypes.STRING,
        gameStatus: DataTypes.STRING,
        winner: DataTypes.STRING
    }, {});
    Game.associate = function(models) {
        // associations can be defined here
    };
    return Game;
};