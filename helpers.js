const db = require('./database');

//helper funtion to get a users databse object with an email and selected db
const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
};

//generate a random string code for short URLS
function generateRandomString() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

//helper function to get stored urls for specific user
const urlsForUser = function(id) {
  const newObj = {};
  for (let key in db.urlDatabase) {
    if (db.urlDatabase[key].userID === id) {
      newObj[key] = {
        longURL: db.urlDatabase[key].longURL
      };
    }
  }
  return newObj;
};



module.exports = { getUserByEmail, generateRandomString, urlsForUser };