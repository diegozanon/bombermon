var Bombermon = Bombermon || {};

Bombermon.Player = function (game_state, name, position, properties) {
    "use strict";
    Bombermon.Prefab.call(this, game_state, name, position, properties);
    
    this.anchor.setTo(0.5);
    
    this.walking_speed = +properties.walking_speed;
    this.bomb_duration = +properties.bomb_duration;

    var nb_of_frames = 16;
    this.player_id = Number(this.name);
    var k = (this.player_id * nb_of_frames) - nb_of_frames;
    
    this.animations.add("walking_down", [0 + k, 1 + k, 2 + k, 3 + k], 10, true);
    this.animations.add("walking_left", [4 + k, 5 + k, 6 + k, 7 + k], 10, true);
    this.animations.add("walking_right", [8 + k, 9 + k, 10 + k, 11 + k], 10, true);
    this.animations.add("walking_up", [12 + k, 13 + k, 14 + k, 15 + k], 10, true);
    
    this.stopped_frames = [0 + k, 4 + k, 8 + k, 12 + k, 0 + k];
    this.revive_positions = [{ x: 26, y: 18 }, { x: 216, y: 18 }, { x: 26, y: 208 }, { x: 216, y: 208 }, { x: 88, y: 84 }, { x: 152, y: 84 }, { x: 88, y: 146 }, { x: 152, y: 146 }];
    this.game_state.game.physics.arcade.enable(this);
    this.body.setSize(10, 10, 7, 14);
    this.cursors = this.game_state.game.input.keyboard.createCursorKeys();
    this.previous_position = { x: 0, y: 0 };
    this.number_of_bombs = 5;
};

Bombermon.Player.prototype = Object.create(Bombermon.Prefab.prototype);
Bombermon.Player.prototype.constructor = Bombermon.Player;

Bombermon.current_bomb_index = 0;
Bombermon.started = false;

Bombermon.Player.prototype.update = function () {
    "use strict";
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision);
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.bombs);
    this.game_state.game.physics.arcade.overlap(this, this.game_state.groups.explosions, this.kill, null, this);

    if (Bombermon.my_player_id === this.player_id) {
        // start
        if (!this.visible && this.alive) {
            var pos = this.revive_positions[this.player_id - 1];
            this.reset(pos.x, pos.y);
            Bombermon.sendMessage({ x: pos.x, y: pos.y, visible: true, facing: 0 });
        }

        if (!this.alive) {
            Bombermon.died();
        }        
		
		var width = 240;
		var height = 240;
		var touchX = this.game_state.game.input.pointer1.x;
		var touchY = this.game_state.game.input.pointer1.y;
		var touchActive = this.game_state.game.input.pointer1.isDown;
		var touchLeft = touchActive && ((touchX / width) < 0.33);
		var touchRight = touchActive && ((touchX / width) > 0.66);
		var touchUp = touchActive && ((touchY / height) < 0.33);
		var touchDown = touchActive && ((touchY / height) > 0.66);
		var touchCenter = touchActive && (((touchX / width) >= 0.33) && ((touchX / width) <= 0.66) && ((touchY / height) >= 0.33) && ((touchY / height) <= 0.66));
			 
        if ((this.cursors.left.isDown && this.body.velocity.x <= 0) || touchLeft) {
            // move left
            this.body.velocity.x = -this.walking_speed;
            if (this.body.velocity.y === 0) {
                this.animations.play("walking_left");
            }
        } else if ((this.cursors.right.isDown && this.body.velocity.x >= 0) || touchRight) {
            // move right
            this.body.velocity.x = +this.walking_speed;
            if (this.body.velocity.y === 0) {
                this.animations.play("walking_right");
            }
        } else {
            this.body.velocity.x = 0;
        }

        if ((this.cursors.up.isDown && this.body.velocity.y <= 0) || touchUp) {
            // move up
            this.body.velocity.y = -this.walking_speed;
            if (this.body.velocity.x === 0) {
                this.animations.play("walking_up");
            }
        } else if ((this.cursors.down.isDown && this.body.velocity.y >= 0) || touchDown) {
            // move down
            this.body.velocity.y = +this.walking_speed;
            if (this.body.velocity.x === 0) {
                this.animations.play("walking_down");
            }
        } else {
            this.body.velocity.y = 0;
        }
        
        if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
            // stop current animation
            this.animations.stop();
            this.frame = this.stopped_frames[this.body.facing];
        }
        
        if ((this.game_state.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || touchCenter) && Bombermon.current_bomb_index < this.number_of_bombs) {
            var colliding_bombs = this.game_state.game.physics.arcade.getObjectsAtLocation(this.x, this.y, this.game_state.groups.bombs);
            
            // drop the bomb only if it does not collide with another one
            if (colliding_bombs.length === 0) {
                this.drop_bomb(true);
            }
        }

        var myPlayerPos = { x: this.position.x, y: this.position.y, visible: true, facing: this.body.facing };
        Bombermon.players[Bombermon.my_player_id - 1] = myPlayerPos;

        if (!Bombermon.started && Bombermon.my_player_id) {
            Bombermon.started = true;
            Bombermon.sendMessage(myPlayerPos);
        }
        
        var min_dist = 5;        
        if ((Math.abs(this.previous_position.x - this.position.x) > min_dist || Math.abs(this.previous_position.y - this.position.y) > min_dist) && this.alive) {
            Bombermon.sendMessage(myPlayerPos);
            this.previous_position = { x: this.position.x, y: this.position.y };
        }
    } else {
        var p = Bombermon.players[this.player_id - 1];
        this.visible = this.alive && p.visible;
        this.position.x = p.x;
        this.position.y = p.y;
        this.frame = this.stopped_frames[p.facing];

        if (p.bomb) {
            this.drop_bomb(false);
        }
    }
};

Bombermon.Player.prototype.drop_bomb = function (alert_others) {    
    "use strict";
    if (this.visible) {
        var bomb, bomb_name, bomb_position, bomb_properties;
        // get the first dead bomb from the pool
        bomb_name = this.name + "_bomb_" + this.game_state.groups.bombs.countLiving();
        bomb_position = new Phaser.Point(this.x, this.y);
        bomb_properties = {"texture": "bomb_spritesheet", "group": "bombs", bomb_radius: 3};
        bomb = Bombermon.create_prefab_from_pool(this.game_state.groups.bombs, Bombermon.Bomb.prototype.constructor, this.game_state, bomb_name, bomb_position, bomb_properties);

        if (alert_others) {
            Bombermon.sendMessage({ x: this.position.x, y: this.position.y, visible: true, facing: this.body.facing, bomb: true });
            Bombermon.current_bomb_index += 1;
        }
    }
};