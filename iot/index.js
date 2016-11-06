'use strict';

const awsIot = require('aws-iot-device-sdk');

let client, iotTopic;
global.IoT = { 

    connect: (topic, iotEndpoint, region, accessKey, secretKey, sessionToken) => {

        iotTopic = topic;

        client = awsIot.device({
            region: region,
            protocol: 'wss',
            accessKeyId: accessKey,
            secretKey: secretKey,
            sessionToken: sessionToken,
            port: 443,
            host: iotEndpoint
        });

        client.on('connect', onConnect);
        client.on('message', onMessage);            
        client.on('close', onClose);     
    },

    send: (message) => {
        client.publish(iotTopic, message);
    }
}; 

global.handleConnected = () => {};
const onConnect = () => {
    client.subscribe(iotTopic);
    console.log('Successfully connected to AWS IoT');
    handleConnected();
};

global.handleReceivedMessage = (message) => {};
const onMessage = (topic, message) => {
    handleReceivedMessage(message);
};

const onClose = () => {
    console.log('Failed to connect to AWS IoT');
};