import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.flushdb();
    this.client.on('error', (err) => {
      console.log('Failed to connect to redis: ', err)
    });
    /*this.client.on('connect', () => {
      console.log('Redis client connected')
    });*/
    //this.client.on('ready', () => { console.log('client is ready')});
  }
  isAlive() {
    // HOW TO FORCE REDIS TO CONNECT? 
    // THIS APPROACH DELAYS BECAUSE REDIS TAKES A WHILE TO CONNECT THUS WILL RETURN FALSE
    return this.client.connected
  }
  get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, val) => {
        if (err) reject(err);
        else resolve(val);
      });
    });
  }
  set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, 'EX', duration, (err, val) => {
        /*if (err) {
          reject(err);
	} else {
          resolve(val);
	}*/
	resolve(val);
      });
    });
  }
  del(key) {
    return new Promise((resolve, reject )=> {
      this.client.del(key, (err, val) => {
        if (err) reject(err);
        else resolve(val);
      });
    });
  }
}
const redisclient = new RedisClient();

module.exports = redisclient;
