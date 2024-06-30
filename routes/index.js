const express = require('express');
const getStats = require('../controllers/AppController.js').getStats;
const getStatus = require('../controllers/AppController.js').getStatus;
const postNew = require('../controllers/UsersController.js').postNew;

const getConnect = require('../controllers/AuthController.js').getConnect;
const getDisconnect = require('../controllers/AuthController.js').getDisconnect;
const getMe = require('../controllers/UsersController.js').getMe;

const postUpload = require('../controllers/FilesController.js').postUpload;
const getShow = require('../controllers/FilesController.js').getShow;
const getIndex = require('../controllers/FilesController.js').getIndex;

const router = express.Router();
// Ensure the server can parse incoming JSON and URL-encoded data
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/status', (req, res) => {
  let value = getStatus();
  res.json(value);
});
router.get('/stats', async (req, res) => {
  let value = await getStats();
  res.json(value);
});

router.post('/users', postNew);

router.get('/connect', getConnect);
router.get('/disconnect', getDisconnect);
router.get('/users/me', getMe);

router.post('/files', postUpload);

router.get('/files/:id', getShow);
router.get('/files', getIndex);

module.exports = router;
