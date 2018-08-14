var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://localhost:2522';

var options = {
    transports: ['websocket'],
    'force new connection': true
};

should.Assertion.add('haveSameItems', function(other) {
    this.params = { operator: 'to be have same items' };

    this.obj.forEach(item => {
        //both arrays should at least contain the same items
        other.should.containEql(item);
    });
    // both arrays need to have the same number of items
    this.obj.length.should.be.equal(other.length);
});

var user1 = 'greenmeercat893';
var user2 = 'tinymouse526';
var user3 = 'sadbutterfly417';

describe("Matchmatching Server", function() {
    it('Should connect client if username is in database', function(done) {
        var player1 = io.connect(socketURL, options);

        player1.on('connect', function(data) {
            player1.emit('add user', user1);
        });
        player1.on('login success', function(data) {
            data.username.should.equal(user1);
            data.MMR.should.be.exactly(1250);
            player1.disconnect();
            done();
        });
    });

    it('Should not connect client if username is not in database', function(done) {
        var player1 = io.connect(socketURL, options);

        player1.on('connect', function(data) {
            player1.emit('add user', 'radishhorse');
        });

        player1.on('login failure', function(data) {
            data.reason.should.equal('Username not found');
            player1.disconnect();
            done();
        })
    });

    it('Should be able to enter queue once connected', function(done) {
        var player1 = io.connect(socketURL, options);

        player1.on('connect', function(data) {
            player1.emit('add user', user1);

        });

        player1.on('login success', function() {
            player1.emit('joinQueue');
        });

        player1.on('join queue success', function(data) {
            data.username.should.equal(user1);
            data.status.should.equal('queue');
            player1.disconnect();
            done();
        });
    });

    it('Should pair two players in the queue if their goodness of match is below threshold', function(done) {
        var player1 = io.connect(socketURL, options);

        player1.on('connect', function(data) {
            player1.emit('add user', user1);

            player1.on('login success', function(data) {
                data.username.should.equal(user1);
                data.MMR.should.be.exactly(1250);
                player1.emit('joinQueue');
            });

            //now that the first player has connected, we connect the second player
            var player2 = io.connect(socketURL, options);

            player2.on('connect', function(data) {
                player2.emit('add user', user2);
            });

            player2.on('login success', function() {
                player2.emit('joinQueue');
            });

            player2.on('join queue success', function(data) {
                data.username.should.equal(user2);
                data.status.should.equal('queue');

            });

            player2.on('game created', function(data) {
                data.players.should.haveSameItems([user1, user2]);
                player2.disconnect();

            });


            player1.on('join queue success', function(data) {
                data.username.should.equal(user1);
                data.status.should.equal('queue');
            });


            player1.on('game created', function(data) {
                data.players.should.haveSameItems([user1, user2]);
                player1.disconnect();
                done();
            });

        });

    }).timeout(15000);

    it('If two players are in queue and their GOF is above threshold, over time they should eventually match due to increasing threshold (~8 seconds)', function(done) {
        var player1 = io.connect(socketURL, options);

        player1.on('connect', function(data) {
            player1.emit('add user', user1);

            player1.on('login success', function(data) {
                data.username.should.equal(user1);
                data.MMR.should.be.exactly(1250);
                player1.emit('joinQueue');
            })


            player1.on('join queue success', function(data) {
                data.username.should.equal(user1);
                data.status.should.equal('queue');
            });

            //now that the first player has connected, we connect the second player
            var player2 = io.connect(socketURL, options);

            player2.on('connect', function(data) {
                player2.emit('add user', user3);
            });

            player2.on('login success', function() {
                player2.emit('joinQueue');
            });

            player2.on('join queue success', function(data) {
                data.username.should.equal(user3);
                data.status.should.equal('queue');

            });

            player2.on('game created', function(data) {
                data.players.should.haveSameItems([user1, user3]);
                player2.disconnect();

            });

            player1.on('game created', function(data) {
                data.players.should.haveSameItems([user1, user3]);
                player1.disconnect();

                done();
            });

        });

    }).timeout(30000);
});