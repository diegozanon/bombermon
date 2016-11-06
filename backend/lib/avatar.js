'use strict';

const utils = require('./utils');
const AWS = require('aws-sdk');
const simpledb = new AWS.SimpleDB();

// Set an available avatar as not available and return its ID
module.exports.setAvatar = (id, callback) => {

    if (id > 0) {
        setAvatarNotAvailable(id, callback);
    } else { // get new avatar
        const utcTimestamp = new Date().getTime();
        const twoMinutes = 2 * 60 * 1000; // milliseconds
        const expiredLimit = utcTimestamp - twoMinutes;
        const query = `select ${attr.avatarId} from ${domainName} where ${attr.available} = 'true' or ${attr.lastTimeUsed} < '${expiredLimit}'`;

        // retrieve available avatars
        queryData(query, (err, response) => {
            if (err) return utils.errorHandler(err, callback);            

            if (response.Items) {
                let availables = [];
                response.Items.map((item) => {
                    availables.push(Number(item.Attributes[0].Value));
                });
                
                let index = utils.getRandomInt(0, availables.length - 1);
                const avatarId = availables[index];
                setAvatarNotAvailable(avatarId, callback);
            } else {
                callback(null, { statusCode: 200, headers: utils.headers, body: JSON.stringify({ avatarId: 0 }) });
            }
        });
    }
};

const setAvatarNotAvailable = (id, callback) => {
    updateAvatarStatus(id, (err, response) => {
        if (err) return utils.errorHandler(err, callback);
        
        callback(null, { 
            statusCode: 200, 
            headers: utils.headers, 
            body: JSON.stringify({
                avatarId: id
            }) 
        });
    });
}

// Set avatar as available
module.exports.releaseAvatar = (id, callback) => {

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
        if (err) return utils.errorHandler(err, callback);
        
        callback(null, { 
            statusCode: 200, 
            headers: utils.headers, 
            body: JSON.stringify({
                avatarId: id
            })
        });
    });
};

// Constants
const domainName = 'bombermon';

const attr = {
    avatarId: 'avatar_id',
    available: 'available',
    lastTimeUsed: 'last_time_used'
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
const updateAvatarStatus = (id, callback) => {

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
