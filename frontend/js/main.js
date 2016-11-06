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
    } else {
        console.log('Time to send+receive message (in milliseconds): ' + (new Date().getTime() - rcvMsg.message.timestamp))
    }
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
        data: JSON.stringify({ id: 0 }),
        url: apiGateway + 'avatars/available',
        success: function(res) {
            console.log('Time to load avatar (in milliseconds): ' + (new Date().getTime() - timestamp));
            Bombermon.my_player_id = res.avatarId;
            
            if (res.avatarId === 0) {
                loadMaxPlayersMsg();
            }
        }
    });
};

// die
Bombermon.died_sent = false;
Bombermon.died = function() {
    if (!Bombermon.died_sent) {
        Bombermon.died_sent = true;
        var timestamp = new Date().getTime();  
        $.ajax({
            method: 'PUT',
            data: JSON.stringify({ id: Bombermon.my_player_id }),
            contentType: 'application/json',
            url: apiGateway + 'avatars/available',
            success: function(res) {
                console.log('Time to inform player death (in milliseconds): ' + (new Date().getTime() - timestamp));
                setTimeout(function() { window.location.reload(false); }, 2000);
            }
        });

        Bombermon.sendMessage({ x: 0, y: 0, visible: false, facing: 0 });
    }
};

// keep alive - inform that this player is still in use
setInterval(function() {
    $.ajax({
        method: 'POST',
        data: JSON.stringify({ id: Bombermon.my_player_id }),
        url: apiGateway + 'avatars/available'
    });
}, 60 * 1000); // 1 minute

function loadMaxPlayersMsg() {

    setTimeout(function() { // TODO: discover how to know when game has loaded
        var overlay = game.add.graphics();
        overlay.beginFill(0x000000, 0.5);
        overlay.drawRect(0, 0, 240, 240);

        var textBox = game.add.graphics();
        textBox.beginFill(0x5d5d60, 0.8);
        textBox.drawRect(0, 105, 240, 45);

        var style = { font: "12px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        var line1 = game.add.text(0, 0, 'Sorry, the maximum number of players', style);
        line1.setTextBounds(0, 0, 240, 240);

        var line2 = game.add.text(0, 0, 'have been reached', style);
        line2.setTextBounds(0, 20, 240, 240);
    }, 1000);
}