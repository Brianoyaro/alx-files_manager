const db = require('../utils/db.js');

async function postNew(email, password) {
  const collection = db.collection('users');
  let user = await collection.find({'email': email}).toArray();
  if (Object.keys(user).length === 0) {
    return {'error': 'Already exist'};
  }
  // hash password in SHA1
  let hashed_pass = password
  // insert the email and hashed password to collection('users')
  let saved_user = await collection.insertOne({'email': email, 'password': hashed_pass});
  // find _id
  // find email
  return {'id': saved_user._id, 'email': saved_user.email};
}

module.exports = postNew;
