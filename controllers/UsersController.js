const sha1 = require('sha1');
const dbClient = require('../utils/db.js');
const redisClient = require('../utils/redis.js');

async function postNew(req, res) {
  let { email, password } = req.body;
  if (!email) {
    res.status(400).json({'error': 'Missing email'});
  }
  if (!password) {
    res.status(400).json({'error': 'Missing password'});
  }
  // create a collection using database_client
  const collection = dbClient.db.collection('users');
  let user = await collection.find({'email': email}).toArray();
  //console.log(user[0]._id);
  if (user.length !== 0) {
    res.status(400).json({'error': 'Already exist'});
  } else {
    // hash password in SHA1
    let hashed_pass = sha1(password);
    // insert the email and hashed password to collection('users')
    let saved_user = await collection.insertOne({'email': email, 'password': hashed_pass});
    res.status(201).json({'id': saved_user.ops[0]._id, 'email': email});
  }
}

async function getMe(req, res) {
  //Write code
  const token = req.headers['x-token'];
  //console.log(token);
  const collection = dbClient.db.collection('users');
  const key = `auth_${token}`;
  const id = await redisClient.get(key);
  //let user = await collection.find({'_id': id}).toArray();
  let objects = await collection.find().toArray();
  let isUser = false;
  for (let object of objects) {
    if (object._id.toString() === id.toString()) {
      isUser = true;
      res.json({'id': id, 'email': object.email});
    }
  }
  if (isUser === false) res.status(401).json({'error': 'Unauthorized'});
}

module.exports = { postNew, getMe };
