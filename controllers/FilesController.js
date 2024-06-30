const uuid = require('uuid');
const dbClient = require('../utils/db.js');
const redisClient = require('../utils/redis.js');

async function postUpload(req, res) {
  const token = req.headers['x-token'];
  let userCollection = dbClient.db.collection('users');
  let fileCollection = dbClient.db.collection('files');
  const key = `auth_${token}`;
  const id = await redisClient.get(key);
  let objects = await userCollection.find().toArray();
  for (let object of objects) {
    if (object._id.toString() === id.toString()) {
      //write code
      let { name, type, parentId, isPublic, data } = req.body;
      if (!name) res.status(400).json({'error': 'Missing name'});
      if (!type) res.status(400).json({'error': 'Missing type'});
      if (type) {
        let tracker = false;
        const allowedType = ['folder', 'file', 'image'];
        for (let item of allowedType) {
          if (item === type) tracker = true
	}
	if (tracker === false) res.status(400).json({'error': 'Missing type'});
      }
      if (!data) {
        if (type !== 'folder') res.status(400).json({'error': 'Missing data'});
      }
      if (!parentId) {
        parentId = 0;
      } else {
        //let fileCollection = dbClient.db.collection('files');
	let savedFile = await fileCollection.find({'parentId': parentId}).toArray();
	if (savedFile.length === 0) res.status(400).json({'error': 'Parent not found'});
	if (savedFile[0].type !== 'folder') res.status(400).json({'error': 'Parent is not a folder'});
      }
      if (!isPublic) isPublic = false;
      if (type === 'folder') {
        // add document in DB
        let savedFolder = await fileCollection.insertOne({'userId': id.toString(), 'name': name, 'type': type, 'isPublic': isPublic, 'parentId': parentId});
	res.status(201).json({'id': savedFolder.ops[0]._id, 'userId': id.toString(), 'name': name, 'type': type, 'isPublic': isPublic, 'parentId': parentId});
      } else {
	//save locally
	let folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
	let filename = uuid.v4();
	let decodedData = Buffer.from(data, 'base64').toString();
	//*****GOOGLE HOW TO SAVE decodedData to folderPAth as filename
	let localPath = folderPath + '/' + filename
        let savedFile = await fileCollection.insertOne({'userId': id.toString(), 'name': name, 'type': type, 'isPublic': isPublic, 'parentId': parentId, 'localPath': localPath});
	res.status(201).json({'id': savedFile.ops[0]._id, 'userId': id.toString(), 'name': name, 'type': type, 'isPublic': isPublic, 'parentId': parentId});
      }
      //end code
    }
  }
  //no user associated with that token
  res.status(401).json({'error': 'Unauthorized'})
}
async function getShow(req, res) {
  console.log('param id is: '+ id);
  const token = req.headers['x-token'];
  let userCollection = dbClient.db.collection('users');
  let fileCollection = dbClient.db.collection('files');
  const key = `auth_${token}`;
  const userId = await redisClient.get(key);
  console.log('userid is ' + userID);
  let objects = await userCollection.find().toArray();
  console.log('objects are ' + objects);
  for (let object of objects) {
    if (object._id.toString() === userId.toString()) {
      //write code
      let files = await fileCollection.find().toArray();
      console.log(files);
      let fileArray = [];
      let tracker  = false;
      for (let file of files) {
        if (file._id.toString() === id.toString()) {
	  fileArray.push(file);
	  tracker = true;
	}
      }
      if (tracker === false) {
        res.status(404).json({'error': 'Not found'});
      } else {
        res.send(fileArray)
      }
    }
  }
  //no user associated with that token
  res.status(401).json({'error': 'Unauthorized'})
}

async function getIndex(req, res) {
  let { parentId, page } = req.query;
  if (!parentId) parentId = 0
  if (!page) page = 0;
  const token = req.headers['x-token'];
  let userCollection = dbClient.db.collection('users');
  let fileCollection = dbClient.db.collection('files');
  const key = `auth_${token}`;
  const id = await redisClient.get(key);
  let objects = await userCollection.find().toArray();
  for (let object of objects) {
    if (object._id.toString() === id.toString()) {
      //write code
      let files = await fileCollection.find({'parentId': parentId}).toArray();
      //paginate. GOOGLE aggregate in node-mongo
    }
  }
  //no user associated with that token
  res.status(401).json({'error': 'Unauthorized'})
}

module.exports = { postUpload, getShow, getIndex };
