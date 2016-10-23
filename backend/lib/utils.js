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
