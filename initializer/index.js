const AWS = require('aws-sdk');
const simpledb = new AWS.SimpleDB();

const domainName = 'bombermon';
const numberOfPlayers = 8;

const attr = {
  avatarId: 'avatar_id',
  available: 'available',
  lastTimeUsed: 'last_time_used'
};

// create domain
simpledb.createDomain({ DomainName: domainName }, function(err, data) {
  if (err) return console.log(err, err.stack);

  // [1, 2, ..., N]
  const avatarIds = Array.from(Array(numberOfPlayers)).map((obj, index) => index + 1 );

  const items = avatarIds.map((id) => {
    return {
      Attributes: [
        {
          Name: attr.avatarId,
          Value: id.toString()
        },
        {
          Name: attr.available,
          Value: 'true'
        },
        {
          Name: attr.lastTimeUsed,
          Value: new Date().getTime().toString()
        },
      ],
      Name: id.toString()
    };
  });

  var params = {
    DomainName: domainName,
    Items: items
  };
  
  // insert data
  simpledb.batchPutAttributes(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else     console.log('Finished creating SimpleDB data');          
  });
});