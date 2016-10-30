'use strict';

const avatar = require('./lib/avatar');
const iot = require('./lib/iot');
const utils = require('./lib/utils');

module.exports.game = (event, context, callback) => {

  try {
    switch(event.httpMethod + ' ' + event.resource) {
      case 'GET /iot/keys':        
        iot.getIoTKeys(callback);
        break;
      case 'POST /avatars/available':        
        avatar.setAvatar(callback);
        break;
      case 'PUT /avatars/available':
        const id = JSON.parse(event.body).id;
        avatar.releaseAvatar(id, callback);
        break;
      default:
        utils.invalidHandler(callback);
    }
  }
  catch (err) {
    utils.errorHandler(err, callback);
  }
};
