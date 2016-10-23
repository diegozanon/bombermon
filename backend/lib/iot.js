'use strict';

const utils = require('./utils');
const AWS = require('aws-sdk');
const iotClient = new AWS.Iot();
const sts = new AWS.STS();

module.exports.getIoTKeys = (callback) => {

  iotClient.describeEndpoint({}, (err, data) => {
    if (err) return utils.errorHandler(err, callback);

    const iotEndpoint = data.endpointAddress;

    const params = {
      RoleArn: 'arn:aws:iam:us-east-1:account:user/MyUser',
      RoleSessionName: utils.getRandomInt(0, Number.MAX_SAFE_INTEGER).toString()
    };

    sts.assumeRole(params, (err, data) => {
      if (err) return utils.errorHandler(err, callback);

      return callback(null, { 
        statusCode: 200, 
        headers: utils.headers, 
        body: JSON.stringify({
          iotEndpoint: iotEndpoint,
          awsAccessKey: data.Credentials.AccessKeyId,
          awsSecretAccessKet: data.Credentials.SecretAccessKey
        }) 
      });
    });
  });
};