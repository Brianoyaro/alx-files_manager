const {MongoClient} = require('mongodb');
//console.log(process.env.USERNAME);

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;
    this.client = new MongoClient(url);
    this.client.on('connect', () => console.log('connected to mongsh'));
    this.client.db(database);
  }
}
