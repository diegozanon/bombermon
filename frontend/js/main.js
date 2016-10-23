var Bombermon = Bombermon || {};

var game = new Phaser.Game(240, 240, Phaser.CANVAS);
game.state.add("BootState", new Bombermon.BootState());
game.state.add("LoadingState", new Bombermon.LoadingState());
game.state.add("TiledState", new Bombermon.TiledState());
game.state.start("BootState", true, false, "assets/level.json", "TiledState");

Bombermon.died_sent = false;
Bombermon.died = function() {
  if (!Bombermon.died_sent) {
    Bombermon.died_sent = true;
    $.ajax({
      url: "https://beo6tmdkj5.execute-api.us-east-1.amazonaws.com/dev/end/" + Bombermon.my_player_id,
      success: function(res) {
      }
    });

    Bombermon.sendMessage({ x: 0, y: 0, visible: false, facing: 0 });
  }
}

// hidden command
Bombermon.reset_sent = false;
Bombermon.reset = function() {
  if (!Bombermon.reset_sent) {
    Bombermon.reset_sent = true;
    $.ajax({
      url: "https://beo6tmdkj5.execute-api.us-east-1.amazonaws.com/dev/restart",
      success: function(res) {
        console.log('reset');
      }
    });
  }
}

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

// TODO: pass IoT keys here
IoT.connect('', '', '');

function handleConnect() {
  // start game
  $.ajax({
    url: "https://beo6tmdkj5.execute-api.us-east-1.amazonaws.com/dev/start",
    success: function(res) {
      Bombermon.my_player_id = res.value;
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