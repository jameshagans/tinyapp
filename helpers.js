//helper funtion to get a users databse object with an email and selected db
const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
};



module.exports = { getUserByEmail };