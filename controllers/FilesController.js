const mime = require('mime-types');
const fs = require('node:fs');
const uuid = require('uuid');
const dbClient = require('../utils/db.js');
const redisClient = require('../utils/redis.js');

async function postUpload(req, res) {
  let isUser = false;
  const token = req.headers['x-token'];
  let userCollection = dbClient.db.collection('users');
  let fileCollection = dbClient.db.collection('files');
  const key = `auth_${token}`;
  const id = await redisClient.get(key);
  let objects = await userCollection.find().toArray();
  for (let object of objects) {
    if (object._id.toString() === id.toString()) {
      //write code
      isUser = true;
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
	/*let locationFile = folderPath + '/' + filename;
	fs.writeFile(locationFile, decodedData, (err) => {
	  if (err) console.log('Error saving file');
	});*/
	let localPath = folderPath + '/' + filename
        let savedFile = await fileCollection.insertOne({'userId': id.toString(), 'name': name, 'type': type, 'isPublic': isPublic, 'parentId': parentId, 'localPath': localPath});
	res.status(201).json({'id': savedFile.ops[0]._id, 'userId': id.toString(), 'name': name, 'type': type, 'isPublic': isPublic, 'parentId': parentId});
      }
      //end code
    }
  }
  //no user associated with that token
  if (isUser === false ) res.status(401).json({'error': 'Unauthorized'})
}
async function getShow(req, res) {
  let isUser = false;
  let id = req.params.id;
  const token = req.headers['x-token'];
  let userCollection = dbClient.db.collection('users');
  let fileCollection = dbClient.db.collection('files');
  const key = `auth_${token}`;
  const userId = await redisClient.get(key);
  let objects = await userCollection.find().toArray();
  for (let object of objects) {
    if (object._id.toString() === userId.toString()) {
      //write code
      isUser = true;
      let files = await fileCollection.find().toArray();
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
        //res.send(fileArray[0])
	let file = fileArray[0];
        let object = {'id': file._id, 'userId': file.user_id, 'name': file.name, 'type': file.type, 'isPublic': file.isPublic, 'parentId': file.parentId};
	res.send(object);
      }
    }
  }
  //no user associated with that token
  if (isUser === false ) res.status(401).json({'error': 'Unauthorized'})
}

async function getIndex(req, res) {
  let isUser = false;
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
      isUser = true;
      let files = await fileCollection.find({'parentId': parentId}).toArray();
      //paginate. GOOGLE aggregate in node-mongo*****************************
      let paginatedFiles = [];
      // if parentId isn't linked to any user folder return an empty list
      if (files.length === 0) res.send(paginatedFiles);
      let startIndex = Number(page) * Number(20);
      let endIndex = Number(startIndex) + Number(20);
      if (files.length < endIndex) endIndex = files.length;
      //if we're on next page which has no items return an empty list
      if (files.length < startIndex) res.send(paginatedFiles);
      //custom pagination
      paginatedFiles = files.slice(startIndex, endIndex);
      //res.send(paginatedFiles);
      let filesArray = [];
      for (let page of paginatedFiles) {
        let object = {'id': page._id, 'userId': page.user_id, 'name': page.name, 'type': page.type, 'isPublic': page.isPublic, 'parentId': page.parentId};
        filesArray.push(object);
      }
      res.send(filesArray);
    }
  }
  //no user associated with that token
  if (isUser === false ) res.status(401).json({'error': 'Unauthorized'})
}

async function putPublish(req, res) {
  let userCollection = dbClient.db.collection('users');
  let fileCollection = dbClient.db.collection('files');
  let id = req.params.id;
  let token = req.headers['x-token'];
  let key = `auth_${token}`;
  let userId = await redisClient.get(key);
  let users = await userCollection.find().toArray();
  let isUser = false;
  for (let user of users) {
    if (user._id.toString() === userId.toString()) {
      isUser = true;
      //write code here
      let files = await fileCollection.find().toArray();
      let isFile = false;
      //console.log(files);
      for (let file of files) {
        if (file._id.toString() === id.toString()) {
	  isFile = true;
	  //update isPublic to true
	  //console.log(await fileCollection.findOne({'name': file.name, 'userId': file.userId, 'parentId': file.parentId, 'type': file.type}));
	  await fileCollection.updateOne({'name': file.name, 'userId': file.userId, 'parentId': file.parentId, 'type': file.type}, {'$set': {'isPublic': true}});
	  //console.log(await fileCollection.findOne({'name': file.name, 'userId': file.userId, 'parentId': file.parentId, 'type': file.type}));
	  file = await fileCollection.findOne({'name': file.name, 'userId': file.userId, 'parentId': file.parentId, 'type': file.type});
	  res.status(200).json({'id': file._id.toString(), 'userId': file.userId, 'name': file.name, 'type': file.type, 'isPublic': file.isPublic, 'parentId': file.parentId});
	}
      }
      if (isFile === false) {
        //no file linked to user and id parameter
	res.status(404).json({'error': 'Not found'});
      }
    }
  }
  //no user found
  if (isUser === false) res.status(401).json({'error': 'Unauthorized'});
}
async function putUnpublish(req, res) {
  let userCollection = dbClient.db.collection('users');
  let fileCollection = dbClient.db.collection('files');
  let id = req.params.id;
  let token = req.headers['x-token'];
  let key = `auth_${token}`;
  let userId = await redisClient.get(key);
  let users = await userCollection.find().toArray();
  let isUser = false;
  for (let user of users) {
    if (user._id.toString() === userId.toString()) {
      isUser = true;
      //write code here
      let files = await fileCollection.find().toArray();
      let isFile = false;
      //console.log(files);
      for (let file of files) {
        if (file._id.toString() === id.toString()) {
	  isFile = true;
	  //update isPublic to true
	  //console.log(await fileCollection.findOne({'name': file.name, 'userId': file.userId, 'parentId': file.parentId, 'type': file.type}));
	  await fileCollection.updateOne({'name': file.name, 'userId': file.userId, 'parentId': file.parentId, 'type': file.type}, {'$set': {'isPublic': false}});
	  file = await fileCollection.findOne({'name': file.name, 'userId': file.userId, 'parentId': file.parentId, 'type': file.type});
	  res.status(200).json({'id': file._id.toString(), 'userId': file.userId, 'name': file.name, 'type': file.type, 'isPublic': file.isPublic, 'parentId': file.parentId});
	}
      }
      if (isFile === false) {
        //no file linked to user and id parameter
	res.status(404).json({'error': 'Not found'});
      }
    }
  }
  //no user found
  if (isUser === false) res.status(401).json({'error': 'Unauthorized'});
}
async function getFile(req, res) {
  let userCollection = dbClient.db.collection('users');
  let fileCollection = dbClient.db.collection('files');
  let id = req.params.id;
  let token = req.headers['x-token'];
  let key = `auth_${token}`;
  let userId = await redisClient.get(key);
  //write code here
  let files = await fileCollection.find().toArray();
  let isFile = false;
  for (let file of files) {
    if (file._id.toString() === id.toString()) {
      isFile = true;
      //found our file! continue coding
      let isPub = file.isPublic;
      let fileUserId = file.userId;
      if (isPub === false && !fileUserId || fileUserId !== userId.toString()) {
        res.status(404).json({'error': 'Not found'});
      }
      // check if type is folder
      if (file.type === 'folder') {
        res.status(400).json({'error': "A folder doesn't have content"});
      }
      //check if file is locally present
      if (!file.localPath) {
        res.status(404).json({'error': 'Not found'});
      } else {
        let fileMime = mime.lookup(file.name);
        //GOOGLE How to read contents from file.localPath then send te content plus fileMime
        //CODE HERE
        fs.readFile(file.localPath, fileMime, (err, data) => {
          if (err) {
            res.send(err);
          } else {
            res.send(data);
          }
        })
      }
    }
  }
  if (isFile === False) {
    res.status(404).json({'error': 'Not found'});
  }
}

module.exports = { postUpload, getShow, getIndex, putPublish, putUnpublish, getFile };
