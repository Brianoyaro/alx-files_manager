const {MongoClient} = require('mongodb');
//console.log(process.env.USERNAME);
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${host}:${port}`;
const client = new MongoClient(url);


class DBClient {
  constructor() {
    this.client = new MongoClient(url);
    this.connectDB();
  }
  // My custom helper function to connect this.client
  // because otherwise will result in using this.client in an unconnected state
  async connectDB() {
    await this.client.connect();
    console.log('Successfully connected to the server');
    this.db = this.client.db(database);
  }
  isAlive() {
    return this.client.s.options.directConnection;
  }
  async nbUsers() {
    const collection = this.db.collection('users');
    // collection.remove({});
    const count = await collection.countDocuments();
    return count;
  }
  async nbFiles() {
    const collection = this.db.collection('files');
    const count = await collection.countDocuments();
    return count;
  }
}
const dbClient = new DBClient();
module.exports = dbClient;
