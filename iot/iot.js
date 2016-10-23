'use strict';

import v4 from 'aws-signature-v4';
import crypto from 'crypto';
import MqttClient from './node_modules/mqtt/lib/client';
import websocket from 'websocket-stream';

const MQTT_TOPIC = '/game/pubsub';

let client;

let IoT = {};
window.IoT = IoT;

IoT.connect = (iotEndpoint, awsAccessKey, awsSecretAccessKey) => {
    client = new MqttClient(() => {
        let url = v4.createPresignedURL(
            'GET',
            iotEndpoint.toLowerCase(),
            '/mqtt',
            'iotdevicegateway',
            crypto.createHash('sha256').update('', 'utf8').digest('hex'),
            {
                'key': awsAccessKey,
                'secret': awsSecretAccessKey,
                'protocol': 'wss',
                'expires': 15
            }
        );

        return websocket(url, [ 'mqttv3.1' ]);
    });

    client.on('connect', () => {
        console.log('Successfully connected to AWS IoT');
        client.subscribe(MQTT_TOPIC);
        IoT.handleConnected();
    });

    client.on('close', () => {
        console.log('Failed to connect to AWS IoT');
        client.end();  // don't reconnect
        client = undefined;
    });

    client.on('message', (topic, message) => {
        IoT.handleReceivedMessage(message);
    });
};

IoT.handleConnected = () => {};
IoT.handleReceivedMessage = () => {};

IoT.send = (message) => {
    client.publish(MQTT_TOPIC, message);
};
