# Serverless Multiplayer Game
A multiplayer game (Bomberman-like) using Serverless concepts

This project was created to validate if it is possible to develop a multiplayer game using only serverless services.

You can try it using your desktop and your phone.

Demo: [bombermon.zanon.io](http://bombermon.zanon.io)

<p align="center">
  <img src="https://github.com/zanon-io/serverless-multiplayer-game/blob/master/frontend/assets/game.png?raw=true" alt="game">
</p>

To create the multiplayer feature, I've used IoT notifications. You can read how it was done [here](zanon.io/posts/serverless-notifications-on-aws).

The [Serverless Framework](serverless.com) was used to manage Lambda functions that handle the avatar selection and IoT keys.

If you want to host this game in your AWS account, you need to execute the **index.js** file that is inside the **initializer** folder to create the SimpleDB domain and the IoT role.

## Credits

The Bomberman code was adapted from [this](https://phaser.io/news/2015/11/bomberman-tutorial-part1) tutorial.

Sprites from: [1](http://wesleyfg.deviantart.com/art/Hoenn-People-OW-in-BW-style-274475232), [2](http://chaoticcherrycake.deviantart.com/art/Pokemon-Tileset-From-Public-Tiles-358379026), [3](https://www.pinterest.com/pin/474566879457682866/) and [4](https://www.spriters-resource.com/resources/sheets/36/39327.png).
