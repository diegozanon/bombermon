var Bombermon = Bombermon || {};

var game = new Phaser.Game(240, 240, Phaser.CANVAS);
game.state.add("BootState", new Bombermon.BootState());
game.state.add("LoadingState", new Bombermon.LoadingState());
game.state.add("TiledState", new Bombermon.TiledState());
game.state.start("BootState", true, false, "assets/level.json", "TiledState");

var players = [];
[1, 2, 3, 4, 5, 6, 7, 8].forEach(function(i) {
    players.push({ x: 0, y: 0, visible: false, facing: 0 });
});

Bombermon.players = players;

// config
var apiGateway = 'https://z50m189rv0.execute-api.us-east-1.amazonaws.com/dev/'; 

// send message
Bombermon.sendMessage = function(message) {

    message.timestamp = new Date().getTime();
    var msgObj = {
        playerId: Bombermon.my_player_id,
        message: message
    };

    IoT.send(JSON.stringify(msgObj));
};

// receive message
window.handleReceivedMessage = function(message) {
    const rcvMsg = JSON.parse(message.toString());
    if (rcvMsg.playerId !== Bombermon.my_player_id) {
        Bombermon.players[rcvMsg.playerId - 1] = { x: rcvMsg.message.x, y: rcvMsg.message.y, visible: rcvMsg.message.visible, facing: rcvMsg.message.facing, bomb: rcvMsg.message.bomb };
    }
    
    console.log('Time to receive message (in milliseconds): ' + (new Date().getTime() - rcvMsg.message.timestamp))
};

// connect
var timestamp = new Date().getTime();
var iotTopic = '/game/pubsub';
$.ajax({
    method: 'GET',
    url: apiGateway + 'iot/keys',
    success: function(res) {
        console.log('Time to load keys (in milliseconds): ' + (new Date().getTime() - timestamp));

        IoT.connect(iotTopic, res.iotEndpoint, res.region, res.awsAccessKey, res.awsSecretAccessKey, res.sessionToken);
    }
});

// handle connection
window.handleConnected = function() {
    // start game
    var timestamp = new Date().getTime();  
    $.ajax({
        method: 'POST',
        url: apiGateway + 'avatars/available',
        success: function(res) {
            Bombermon.my_player_id = res.avatarId;
            console.log('Time to load avatar (in milliseconds): ' + (new Date().getTime() - timestamp));
        }
    });
};

// die
Bombermon.died_sent = false;
Bombermon.died = function() {
    if (!Bombermon.died_sent) {
        Bombermon.died_sent = true;
        $.ajax({
            method: 'PUT',
            data: { id: Bombermon.my_player_id },
            url: apiGateway + 'avatars/available',
            success: function(res) {
            }
        });

        Bombermon.sendMessage({ x: 0, y: 0, visible: false, facing: 0 });
    }
};