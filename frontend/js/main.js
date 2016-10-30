// config
var apiGateway = 'https://z50m189rv0.execute-api.us-east-1.amazonaws.com/dev/'; 

var Bombermon = Bombermon || {};

var game = new Phaser.Game(240, 240, Phaser.CANVAS);
game.state.add("BootState", new Bombermon.BootState());
game.state.add("LoadingState", new Bombermon.LoadingState());
game.state.add("TiledState", new Bombermon.TiledState());
game.state.start("BootState", true, false, "assets/level.json", "TiledState");

// IoT
Bombermon.sendMessage = function(message) {
  var msgObj = {
    playerId: Bombermon.my_player_id,
    message: message
  };

  IoT.send(JSON.stringify(msgObj));
}

Bombermon.players = getPlayersEmptyArray();

Bombermon.handleReceivedMessage = function(message) {
  var rcvMsg = JSON.parse(message.toString());
  if (rcvMsg.playerId !== Bombermon.my_player_id) {
    Bombermon.players[rcvMsg.playerId - 1] = { x: rcvMsg.message.x, y: rcvMsg.message.y, visible: rcvMsg.message.visible, facing: rcvMsg.message.facing, bomb: rcvMsg.message.bomb };
    console.log(rcvMsg) 
  }
}

IoT.handleReceivedMessage = Bombermon.handleReceivedMessage;
IoT.handleConnect = handleConnect();

// connect
(function connect() {
  var start_time = new Date().getTime();
  $.ajax({
    method: 'GET',
    url: apiGateway + 'iot/keys',
    success: function(res) {
      var connect_start_time = new Date().getTime();
      var request_time = new Date().getTime() - start_time;
      console.log('Time to load keys (in milliseconds): ' + request_time);

      IoT.connect(res.iotEndpoint, res.awsAccessKey, res.awsSecretAccessKey, res.sessionToken);

      var connect_time = new Date().getTime() - connect_start_time;
      console.log('Time to connect (in milliseconds): ' + connect_time);
    }
  });
})();

function handleConnect() {
  // start game
  var start_time = new Date().getTime();
  $.ajax({
    method: 'POST',
    url: apiGateway + 'avatars/available',
    success: function(res) {
      Bombermon.my_player_id = res.avatarId;
      var request_time = new Date().getTime() - start_time;
      console.log('Time to load avatar (in milliseconds): ' + request_time);
    }
  });
}

function getPlayersEmptyArray() {
  var players = [];
  [1, 2, 3, 4, 5, 6, 7, 8].forEach(function(i) {
    players.push({
      x: 0,
      y: 0,
      visible: false,
      facing: 0
    });
  });

  return players;
}

// end
Bombermon.died_sent = false;
Bombermon.died = function() {
  if (!Bombermon.died_sent) {
    Bombermon.died_sent = true;
    var start_time = new Date().getTime();
    $.ajax({
      method: 'PUT',
      data: { id: Bombermon.my_player_id },
      url: apiGateway + 'avatars/available',
      success: function(res) {
        var request_time = new Date().getTime() - start_time;
        console.log('Time to release avatar (in milliseconds): ' + request_time);
      }
    });

    Bombermon.sendMessage({ x: 0, y: 0, visible: false, facing: 0 });
  }
}