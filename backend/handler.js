'use strict';

const AWS = require('aws-sdk');
const simpledb = new AWS.SimpleDB();

module.exports.game = (event, context, callback) => {

  try {
    switch(event.httpMethod) {
      case 'POST':        
        postHandler(callback);
        break;
      case 'PUT':
        const id = JSON.parse(event.body).id;
        putHandler(id, callback);
        break;
      default:
        invalidHandler(callback);
    }
  }
  catch (err) {
    errorHandler(err, callback);
  }
};

// CORS Headers
const headers = {
  'Access-Control-Allow-Origin': '*'
};

// Constants
const domainName = 'bombermon';

const attr = {
  avatarId: 'avatar_id',
  available: 'available',
  lastTimeUsed: 'last_time_used'
};

// Set an available avatar as not available and return its ID
const postHandler = (callback) => {

  const utcTimestamp = new Date().getTime();
  const tenMinutes = 10 * 60 * 1000; // milliseconds
  const expiredLimit = utcTimestamp - tenMinutes;
  const query = `select ${attr.avatarId} from ${domainName} where ${attr.available} = 'true' or ${attr.lastTimeUsed} < '${expiredLimit}'`;

  // retrieve available avatars
  queryData(query, (err, response) => {
    if (err) return errorHandler(err, callback);

    let availables = [];
    response.Items.map((item) => {
      availables.push(Number(item.Attributes[0].Value));
    });

    let index = getRandomInt(0, availables.length - 1);
    const avatarId = availables[index];

    // set avatar as not available and return id
    putData(avatarId, (err, response) => {
      if (err) return errorHandler(err, callback);
      else     return callback(null, { 
        statusCode: 200, 
        headers: headers, 
        body: JSON.stringify({
          avatarId: avatarId
        }) 
      });
    })
  });
};

// Set avatar as available
const putHandler = (id, callback) => {

  var params = {
    Attributes: [
      {
        Name: attr.available,
        Value: 'true',
        Replace: true 
      },
      {
        Name: attr.lastTimeUsed,
        Value: new Date().getTime().toString(),
        Replace: true 
      }
    ],
    DomainName: domainName,
    ItemName: id.toString()
  };

  simpledb.putAttributes(params, (err, data) => {
    if (err) return errorHandler(err, callback);
    else     return callback(null, { statusCode: 200, headers: headers });
  });
};

// Invalid HTTP method
const invalidHandler = (callback) => {
  callback(null, {
    statusCode: 400,
    headers: headers,
    body: JSON.stringify({
      message: 'Invalid HTTP method'
    })
  });
};

// Internal Server Error
const errorHandler = (err, callback) => {
  callback(null, {
    statusCode: 500,
    headers: headers,
    body: JSON.stringify({
      message: 'Internal Server Error',
      error: err.toString()
    })
  });
};

// Query SimpleDB data
const queryData = (query, callback) => {
  var params = {
    SelectExpression: query,
    ConsistentRead: false,
    NextToken: ''
  };

  simpledb.select(params, callback);
};

// Insert data into SimpleDB domain
const putData = (id, callback) => {

  var params = {
    Attributes: [
      {
        Name: attr.available,
        Value: 'false',
        Replace: true 
      },
      {
        Name: attr.lastTimeUsed,
        Value: new Date().getTime().toString(),
        Replace: true 
      }
    ],
    DomainName: domainName,
    ItemName: id.toString()
  };

  simpledb.putAttributes(params, callback);
};

// Get random Int
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};