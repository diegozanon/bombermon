'use strict';

const awsIot = require('aws-iot-device-sdk');

const roleName = 'bombermon-iot';
const MQTT_TOPIC = '/game/pubsub';

var client;
var IoT = {};
window.IoT = IoT;

IoT.connect = function(iotEndpoint, awsAccessKey, awsSecretAccessKey, sessionToken) {

    client = awsIot.device({
        region: getRegion(iotEndpoint),
        protocol: 'wss',
        accessKeyId: awsAccessKey,
        secretKey: awsSecretAccessKey,
        sessionToken: sessionToken,
        port: 443,
        host: iotEndpoint
    });

    client
        .on('connect', function() {
            console.log('Successfully connected to AWS IoT');
            client.subscribe(MQTT_TOPIC);
            IoT.handleConnected();
        });

    client
        .on('message', function(topic, message) {
            IoT.handleReceivedMessage(message);
        });

    client
        .on('close', function(topic, message) {
            console.log('Failed to connect to AWS IoT');
        });        
};

IoT.handleConnected = function() {};
IoT.handleReceivedMessage = function() {};

IoT.send = function(message) {
    client.publish(MQTT_TOPIC, message);
};

function getRegion(iotEndpoint) {
    var partial = iotEndpoint.replace('.amazonaws.com', '');
    var iotIndex = iotEndpoint.indexOf("iot"); 
    return partial.substring(iotIndex + 4);
};