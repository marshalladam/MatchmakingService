// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 2522;
var fs = require('fs');
var db = require('./models/index');
var Sequelize = require('sequelize-values')();

let geoLib = require('geo-lib');
let moment = require('moment');
const Op = Sequelize.Op;

//Parameters that change the behaviour of the searching and matching algorithms.
const timeIntervalBetweenSearches = 1000;
const weightMMR = 2; //how much the matching algoithm weights the MMR
const weightDistance = 1; //how much the matching algoithm weights the Distance between players
const defaultThreshold = 1000; //The threshold before time based transforms
const rateOfIncreaseOfThreshold = 10000; //Increase in goodness of match threshold per minute of combined wait time. (Set very high for testing reasons. In production this would be in the 100's)


app.use(express.static(path.join(__dirname, 'public')));

/**
 * @description Starts up the server
 * @param {string} port 
 **/
server.listen(port, () => {
    console.log('Server listening at port %d', port);
    //Set all users' status to offline
    db.User.update({
        status: "offline",
        currentGameId: null
    }, {
        where: {}
    });
});

/**
 * @description A find match worker. Checks for new player combos every timeINtervalBetweenSearches milliseconds.
 * @param {string}   username of user 
 **/
setInterval(function() {
    findMatches();
}, timeIntervalBetweenSearches);

/**
 * 
 * @description A helper function that sets the status of multiple players.
 * @param {array}    players
 * @param {string}   stat
 **/
function setStatus(players, stat) {
    db.User.update({
        status: stat
    }, {
        where: {
            username: players
        },
        attributes: ['username', 'status']
    }).then(function() {
        console.log("Set status of [" + players + "] to " + stat);
    });

}


/**
 * @description Builds a game. This meants adding a row to the Game table with player information, as well as setting their statuses to "game" so they are not considered
 *              for further matches.
 * @param {string}    username of player 1
 * @param {string}    username of player 2
 **/
function buildGame(Player1, Player2) {
    var players = [Player1, Player2]

    db.Game.create({
        playerOne: Player1,
        playerTwo: Player2,
        gameStatus: "In Progress"
    }).then(function(Game) {
        db.User.update({
            currentGameId: Game.id
        }, {
            where: {
                username: players
            }
        })

        setStatus(players, "game");

        io.sockets.emit('game created', {
            players: [Player1, Player2]
        });
    })

};


/**
 * @description Gets all possible matchings for inputted players.
 * @param {array}   array of users
 **/
function getAllPairs(array) {
    let results = [];

    // Since you only want pairs, there's no reason
    // to iterate over the last element directly
    for (let i = 0; i < array.length - 1; i++) {
        // This is where you'll capture that last value
        for (let j = i + 1; j < array.length; j++) {
            results.push([array[i], array[j]]);
        }
    }
    return results
}

/**
 *
 * @description Finds matches.
 * Gets all users whose status is "queue," finds possible matches and calculates the goodness of match for each. If the goodness of match is below the calculated threshold, a game is started.
 **/
function findMatches() {
    db.User.findAll({
        where: {
            status: "queue",
        },
        attributes: ['username', 'MMR', 'location', 'updatedAt'],
    }).then(function(users) {
        //Only need to find potential matches if there is more than one user in the queue
        if (users.length > 1) {
            potentialPairings = getAllPairs(Sequelize.getValues(users));

            for (var i = 0; i < potentialPairings.length; i++) {
                var pair = potentialPairings[i];
                var playerOne = pair[0];
                var playerTwo = pair[1];

                //get the time each player has been in the queue using moment.js. This allows us to increase the threshold as wait time increases.
                var playerOneTimeInQueue = (moment.duration(moment().diff(playerOne.updatedAt))).asMinutes();
                var playerTwoTimeInQueue = (moment.duration(moment().diff(playerTwo.updatedAt))).asMinutes();

                var gomOfPair = calculateGOM(playerOne, playerTwo);

                var threshold = defaultThreshold + rateOfIncreaseOfThreshold * (playerOneTimeInQueue + playerTwoTimeInQueue);
                console.log("GOM = " + gomOfPair + " (Threshold is " + threshold + ")");
                if (gomOfPair < threshold) {
                    buildGame(playerOne.username, playerTwo.username);
                    return 0;
                }
            }
        }
    })
}

/**
 * 
 * @description Uses geo-lib library to calculate distance between two player locations.
 * @param {string}   username of first user
 * @param {string}  username of second user
 **/
function calculateDistance(playerOne, playerTwo) {
    return geoLib.distance([playerOne.location, playerTwo.location]).distance
}

/**
 *
 * @description Calculates the difference in MMR for two possible opponents.
 * @param {string}   username of first user
 * @param {string}  username of second user
 * 
 **/
function calculateDifferenceInMMR(playerOne, playerTwo) {
    return Math.abs(playerOne.MMR - playerTwo.MMR)
}

/**
 *
 * @description Calculates the goodness of match for two possible players.
 * @param {string}   username of first user
 * @param {string}  username of second user
 * 
 */

function calculateGOM(playerOne, playerTwo) {

    var dist = calculateDistance(playerOne, playerTwo);
    var diffMMR = calculateDifferenceInMMR(playerOne, playerTwo);

    var gom = weightMMR * diffMMR + weightDistance * dist;

    return (gom);
}

io.on('connection', (socket) => {

    /**
     *
     * @description Checks of user is in database. If yes, then set their status to "lobby." If no, then return an error message.

     * @param {string}   username of user
     * 
     */
    socket.on('add user', (username) => {
        //check database for username
        db.User.findOne({
            where: {
                username: username
            },
            attributes: ['username', 'MMR', 'location', 'status'],
        }).then(user => {
            if (!user) {
                socket.emit('login failure', {
                    reason: "Username not found"
                });
                socket.userExists = false;
            } else {
                if (user.dataValues.status == 'lobby') {
                    console.log("You are already logged in");
                } else {
                    //Store user info in socket.
                    socket.userExists = true;
                    socket.MMR = user.MMR;
                    socket.location = user.location;
                    socket.username = username;

                    //Set status of user to lobby
                    db.User.update({
                        status: 'lobby'
                    }, {
                        where: {
                            username: username
                        },
                        attributes: ['username', 'status']
                    }).then(function() {
                        console.log("Set status of [" + socket.username + "] to lobby");
                        //Tell client that they have successfully logged in to the lobby.
                        socket.emit('login success', {
                            username: socket.username,
                            MMR: socket.MMR
                        });
                    });
                }

            }

        })


    });

    /**
     *
     * @description Adds a user to the game queue by setting their status to "queue" in database. 
     **/

    socket.on('joinQueue', function() {
        //Find username in database and make sure their status is "lobby," because you should only be able to enter the queue if you are in the lobby (not in a game or offline).
        db.User.findOne({
            where: {
                username: socket.username,
                status: 'lobby'

            },
            attributes: ['username', 'MMR', 'location', 'status']
        }).then(user => {
            if (user) {
                //Update their status to "queue"
                db.User.update({
                    status: 'queue'
                }, {
                    where: {
                        username: socket.username
                    },
                    returning: true,
                    plain: true
                }).then(function(result) {
                    console.log("Set status of [" + socket.username + "] to queue");
                    console.log(result[1].dataValues);
                    var updatedUser = result[1];

                    //Record when they entered the queue, so we can know later how long the user has been in the queue.
                    socket.joinedQueue = updatedUser.dataValues.updatedAt;

                    socket.emit('join queue success', {
                        username: updatedUser.dataValues.username,
                        status: updatedUser.dataValues.status
                    });
                });
            }
        })


    });

    /**
     * @description Disconnects the user from the lobby.
     * @param {string}   socket of user
     */
    socket.on('disconnect', () => {
        if (socket.userExists) {
            db.User.update({
                status: 'offline'
            }, {
                where: {
                    username: socket.username
                }
            })
        }
    });
});