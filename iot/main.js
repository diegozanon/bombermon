'use strict';

const v4 = require('aws-signature-v4');
const crypto = require('crypto');
const MqttClient = require('./node_modules/mqtt/lib/client');
const websocket = require('websocket-stream');

const roleName = 'bombermon-iot';
const MQTT_TOPIC = '/game/pubsub';

var client;
var IoT = {};
window.IoT = IoT;

IoT.connect = function(iotEndpoint, awsAccessKey, awsSecretAccessKey, sessionToken) {

    client = new MqttClient(function() {
        var url = v4.createPresignedURL(
            'GET',
            iotEndpoint.toLowerCase(),
            '/mqtt',
            'iotdevicegateway',
            crypto.createHash('sha256').update('', 'utf8').digest('hex'),
            {
                'key': awsAccessKey,
                'secret': awsSecretAccessKey,
                'protocol': 'wss',
                'expires': 3600
            }
        );
        
        url += '&X-Amz-Security-Token=' + encodeURIComponent(sessionToken);

        return websocket(url, [ 'mqttv3.1' ]);
    });

    client.on('connect', function() {
        console.log('Successfully connected to AWS IoT');
        client.subscribe(MQTT_TOPIC);
        IoT.handleConnected();
    });

    client.on('close', function(err) {
        console.log(err);
        console.log('Failed to connect to AWS IoT');
        client.end();  // don't reconnect
        client = undefined;
    });

    client.on('message', function(topic, message) {
        IoT.handleReceivedMessage(message);
    });
};

IoT.handleConnected = function() {};
IoT.handleReceivedMessage = function() {};

IoT.send = function(message) {
    client.publish(MQTT_TOPIC, message);
};