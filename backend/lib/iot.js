'use strict';

const utils = require('./utils');
const AWS = require('aws-sdk');
const iotClient = new AWS.Iot();

module.exports.getIoTKeys = (callback) => {

  iotClient.describeEndpoint({}, (err, data) => {
    if (err) return utils.errorHandler(err, callback);

    const iotEndpoint = data.endpointAddress;

    return callback(null, { 
        statusCode: 200, 
        headers: utils.headers, 
        body: JSON.stringify({
          iotEndpoint: iotEndpoint,
          awsAccessKey: '',
          awsSecretAccessKet: ''
        }) 
    });
  });
};