'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Users', [{
                username: 'bluefrog786',
                MMR: 200,
                location: [38.65554, -121.613070],
                WL: 0.05,
                status: 'offline',
                currentGameId: null
            }, {
                username: 'tinymouse526',
                MMR: 1000,
                location: [41.3787, -72.716026],
                WL: 0.18,
                status: 'offline',
                currentGameId: null
            },
            {
                username: 'sadbutterfly417',
                MMR: 700,
                location: [39.207177, -98.185703],
                WL: 0.24,
                status: 'offline',
                currentGameId: null
            },
            {
                username: 'greenmeercat893',
                MMR: 1250,
                location: [42.383867, -71.114548],
                WL: 0.43,
                status: 'offline',
                currentGameId: null
            },
            {
                username: 'tinybutterfly958',
                MMR: 1250,
                location: [-51.0250, 35.0338],
                WL: 0.47,
                status: 'offline',
                currentGameId: null
            },
            {
                username: 'fastcar753',
                MMR: 1250,
                location: [12.6804, 166.5828],
                WL: 0.47,
                status: 'offline',
                currentGameId: null
            },
            {
                username: 'greenostrich159',
                MMR: 3730,
                location: [-33.1456, 44.2833],
                WL: 0.87,
                status: 'offline',
                currentGameId: null
            },
            {
                username: 'bluedog194',
                MMR: 3421,
                location: [-52.1512, 166.3233],
                WL: 0.9,
                status: 'offline',
                currentGameId: null
            },
            {
                username: 'organgegiraffe786',
                MMR: 4000,
                location: [42.3445, -71.081],
                WL: 0.97,
                status: 'offline',
                currentGameId: null
            }
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Users', null, {});
    }
};