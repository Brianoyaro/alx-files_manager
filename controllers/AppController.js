const database = require('../utils/db.js');
const redisClient = require('../utils/redis.js');
function getStatus() {
  let dbAlive = database.isAlive();
  let redisAlive = redisClient.isAlive();
  return { 'redis': redisAlive, 'db': dbAlive }
}
async function getStats() {
  let users = await database.nbUsers();
  let files = await database.nbFiles();
  // return { 'users': 1, 'files': 12 };
  return { 'users': users, 'files': files };
}
module.exports = {getStatus, getStats}
