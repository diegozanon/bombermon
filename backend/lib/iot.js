'use strict';

const utils = require('./utils');
const AWS = require('aws-sdk');
const iotClient = new AWS.Iot();
const sts = new AWS.STS();
const roleName = 'bombermon-iot';

module.exports.getIoTKeys = (callback) => {

    // get the endpoint address
    iotClient.describeEndpoint({ endpointType: 'iot:Data-ATS' }, (err, data) => {
        if (err) return utils.errorHandler(err, callback);

        const iotEndpoint = data.endpointAddress;

        // get the account id which will be used to assume a role
        sts.getCallerIdentity({}, (err, data) => {
            if (err) return utils.errorHandler(err, callback);

            const params = {
                RoleArn: `arn:aws:iam::${data.Account}:role/${roleName}`,
                RoleSessionName: utils.getRandomInt(0, Number.MAX_SAFE_INTEGER).toString()
            };

            // assume role returns temporary keys
            sts.assumeRole(params, (err, data) => {
                if (err) return utils.errorHandler(err, callback);

                return callback(null, {
                    statusCode: 200,
                    headers: utils.headers,
                    body: JSON.stringify({
                        iotEndpoint: iotEndpoint,
                        region: utils.getRegion(iotEndpoint),
                        awsAccessKey: data.Credentials.AccessKeyId,
                        awsSecretAccessKey: data.Credentials.SecretAccessKey,
                        sessionToken: data.Credentials.SessionToken
                    })
                });
            });
        })
    });
};