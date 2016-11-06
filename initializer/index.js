const AWS = require('aws-sdk');
const simpledb = new AWS.SimpleDB();
const iam = new AWS.IAM();
const sts = new AWS.STS();

const domainName = 'bombermon';
const numberOfPlayers = 8;

const attr = {
  avatarId: 'avatar_id',
  available: 'available',
  lastTimeUsed: 'last_time_used'
};

// create domain
simpledb.createDomain({ DomainName: domainName }, (err, data) => {
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

  const sdbParams = {
    DomainName: domainName,
    Items: items
  };
  
  // insert data
  simpledb.batchPutAttributes(sdbParams, (err, data) => {
    if (err) console.log(err, err.stack);
    else     console.log('Finished creating SimpleDB data');          
  });
});

const roleName = 'bombermon-iot';

// get the account id
sts.getCallerIdentity({}, (err, data) => {
  if (err) return console.log(err, err.stack);

  const createRoleParams = {
    AssumeRolePolicyDocument: `{
      "Version":"2012-10-17",
      "Statement":[{
          "Effect": "Allow",
          "Principal": {
            "AWS": "arn:aws:iam::${data.Account}:root"
          },
          "Action": "sts:AssumeRole"
        }
      ]
    }`,
    RoleName: roleName
  };

  iam.createRole(createRoleParams, (err, data) => {
    if (err) return console.log(err, err.stack);

    const attachPolicyParams = {
      PolicyDocument: `{
        "Version": "2012-10-17",
        "Statement": [{
          "Action": ["iot:Connect", "iot:Subscribe", "iot:Publish", "iot:Receive"],
          "Resource": "*",
          "Effect": "Allow"
        }]
      }`,
      PolicyName: roleName,
      RoleName: roleName
    };

    iam.putRolePolicy(attachPolicyParams, (err, data) => {
      if (err) console.log(err, err.stack);
      else     console.log(`Finished creating IoT Role: ${roleName}`);          
    });
  });
});