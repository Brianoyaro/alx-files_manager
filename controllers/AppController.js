const database = require('../utils/db.js');
const redisClient = require('../utils/redis.js');

function getStatus(req, res) {
  let dbAlive = database.isAlive();
  let redisAlive = redisClient.isAlive();
  res.status(200).json({ 'redis': redisAlive, 'db': dbAlive });
}
async function getStats(req, res) {
  let users = await database.nbUsers();
  let files = await database.nbFiles();
  // return { 'users': 1, 'files': 12 };
  res.status(200).json({ 'users': users, 'files': files });
}

module.exports = {getStatus, getStats}
