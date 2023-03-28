//Databases
const users = {
  user1: {
    id: "user1",
    email: "user@a.com",
    password: "$2a$10$4.4rnNVIzEqOj/DtCkhZxuPFozIOElhcejYRjFi11UpKJuW6SngfK", // 1234 for tester
  },
  user2: {
    id: "user2",
    email: "user2@a.com",
    password: "$2a$10$4.4rnNVIzEqOj/DtCkhZxuPFozIOElhcejYRjFi11UpKJuW6SngfK", // 1234 for tester
  },
};


const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'user1'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2"
  }
};

module.exports = { urlDatabase, users}