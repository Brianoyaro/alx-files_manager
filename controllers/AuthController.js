const dbClient = require('../utils/db.js');
const redisClient = require('../utils/redis.js');
const uuid = require('uuid');
const sha1 = require('sha1');

async function getConnect(req, res) {
  //write code
  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const strAuth = Buffer.from(b64auth, 'base64').toString();
  const splitIndex = strAuth.indexOf(':');
  const email = strAuth.substring(0, splitIndex);
  const password = strAuth.substring(splitIndex + 1);
  let user = await dbClient.db.collection('users').find({'email': email, 'password': sha1(password)}).toArray();
  if (user.length === 0) {
    res.status(401).json({'error': 'Unauthorized'});
  } else {
    let token = uuid.v4();
    let key = `auth_${token}`;
    //let userId = user[0]._id;
    let userId = user[0]._id.toString();
    await redisClient.set(key, userId, 86400);
    //await redisClient.set(key, userId, 86400000);
    res.status(200).json({'token': token});
  }
}

async function getDisconnect(req, res) {
  //write code
  const token = req.headers['x-token'];
  //GOOGLE HOW TO NODE_REDIS DELETE A KEY
  //*************************************
  const userCollection = dbClient.db.collection('users');
  let userId = await redisClient.get(`auth_${token}`);
  if (userId === null) userId = '';
  let users = await userCollection.find().toArray();
  let isUser = false;
  for (let user of users) {
    if (user._id.toString() === userId.toString()) {
      isUser = true;
      await redisClient.del(`auth_${token}`);
      res.status(204).send();
    }
  }
  if (isUser === false) {
    res.status(401).json({'error': 'Unauthorized'});
  }
}

module.exports = { getConnect, getDisconnect};
