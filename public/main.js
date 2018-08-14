$(function() {
    var $window = $(window);
    var $usernameInput = $('.usernameInput'); // Input for username
    var $loginPage = $('.login.page'); // The login page
    var $lobbyPage = $('.lobby.page'); // The lobby page
    var $joinQueue = $('.joinQueue'); // The join queue button

    // Prompt for setting a username
    var username;
    var $currentInput = $usernameInput.focus();

    var socket = io();

    ///////////Client Events///////////////
    $window.keydown(event => {
        // Auto-focus the current input when a key is typed
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $currentInput.focus();
        }
        // When the client hits ENTER on their keyboard, submit username
        if (event.which === 13) {
            setUsername();
        }
    });

    const setUsername = () => {
        username = cleanInput($usernameInput.val().trim());
        if (username) {
            // Tell the server your username
            socket.emit('add user', username);
        }
    }

    // Prevents input from having injected markup
    const cleanInput = (input) => {
        return $('<div/>').text(input).html();
    }

    $loginPage.click(() => {
        $currentInput.focus();
    });

    $joinQueue.click(function() {
        joinQueue();
    })

    function joinQueue() {
        socket.emit('joinQueue');
    };


    ///////////Socket Events///////////////
    socket.on('login success', (data) => {
        $loginPage.fadeOut();
        $lobbyPage.show();
        $loginPage.off('click');
        alert("Welcome " + data.username + ". Your MMR is " + data.MMR);
    });

    socket.on('login failure', (data) => {
        $loginPage.fadeOut();
        //$loginPage.off('click');
        alert(data.reason);
    });

    socket.on('join queue success', (data) => {
        alert('Queue joined');
    });

    socket.on('game created', (data) => {
        alert("Game started between " + data.players[0] + " and " + data.players[1]);
    });

    socket.on('disconnect', () => {
        log('you have been disconnected');
    });

    socket.on('reconnect', () => {
        log('you have been reconnected');
        if (username) {
            socket.emit('add user', username);
        }
    });

    socket.on('reconnect_error', () => {
        log('attempt to reconnect has failed');
    });
});