'use strict';

// CORS Headers
module.exports.headers = {
  'Access-Control-Allow-Origin': '*'
};

// Invalid HTTP method
module.exports.invalidHandler = (callback) => {
  callback(null, {
    statusCode: 400,
    headers: module.exports.headers,
    body: JSON.stringify({
      message: 'Invalid HTTP method'
    })
  });
};

// Internal Server Error
module.exports.errorHandler = (err, callback) => {
  callback(null, {
    statusCode: 500,
    headers: module.exports.headers,
    body: JSON.stringify({
      message: 'Internal Server Error',
      error: err.toString()
    })
  });
};

// OPTIONS verb
module.exports.optionsHandler = (callback) => {
  callback(null, {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'origin, content-type, accept',
      'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS'
    }
  });
};

// Get random Int
module.exports.getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Get region from iotEndpoint
module.exports.getRegion = (iotEndpoint) => {
  const partial = iotEndpoint.replace('.amazonaws.com', '');
  const iotIndex = iotEndpoint.indexOf("iot"); 
  return partial.substring(iotIndex + 4);
};