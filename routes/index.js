const express = require('express');
const getStats = require('../controllers/AppController.js').getStats;
const getStatus = require('../controllers/AppController.js').getStatus;
const postNew = require('../controllers/UsersController.js').postNew;

const router = express.Router();
router.get('/status', (req, res) => {
  let value = getStatus();
  res.json(value);
});
router.get('/stats', async (req, res) => {
  let value = await getStats();
  res.json(value);
});
router.post('/users', async (req, res) => {
  // google how to get form datain nodejs
  let email = req.params.email;
  console.log(req);
  // Google how to pass status code 400
  if (!email) res.json({'error': 'Missing email'});
  let password = req.params.pasword;
  // Google how to pass status code 400
  if (!password) res.json({'error': 'Missing password'});
  let user = await postNew(email, password);
  res.json(user);
})

module.exports = router;
