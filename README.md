# Serverless Multiplayer Game
A multiplayer game (Bomberman-like) using Serverless concepts

This project was created to validate if it is possible to develop a multiplayer game using only serverless services.

Demo: [bombermon.zanon.io](http://bombermon.zanon.io)

![game](https://github.com/zanon-io/serverless-multiplayer-game/blob/master/frontend/assets/game.png?raw=true)

To create the multiplayer feature, I've used IoT notifications. You can read how [here](zanon.io/posts/serverless-notifications-on-aws).

The [Serverless Framework](serverless.com) was used to manage Lambda functions that handle the avatar selection and IoT keys.

## Credits

The Bomberman code was adapted from [this](https://phaser.io/news/2015/11/bomberman-tutorial-part1) tutorial.

Sprites from: [1](http://wesleyfg.deviantart.com/art/Hoenn-People-OW-in-BW-style-274475232), [2](http://chaoticcherrycake.deviantart.com/art/Pokemon-Tileset-From-Public-Tiles-358379026), [3](https://www.pinterest.com/pin/474566879457682866/) and [4](https://www.spriters-resource.com/resources/sheets/36/39327.png).