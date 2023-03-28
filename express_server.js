const express = require("express");
const morgan = require('morgan');
const bcrypt = require("bcryptjs");
const app = express(); // Create server connection - initialize app 
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const helpers = require('./helpers');
const {urlDatabase, users} = require('./database');
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['secret'],
}));
app.use(morgan('dev')); //(req,res,next)  
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");




//home page route
app.get("/", (req, res) => {
  res.send("This is the home page for TinyApp!! " + "Login or Register <a href=/login>Here!</a");
});


//redirect /u/smallUrls to their long URL value
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});


app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(401).send("You Must Register or Login Before You Can View URLs " + "Login or Register <a href=/login>Here!</a");
  };
  const usersURLS = helpers.urlsForUser(userID);

  const templateVars = { urls: usersURLS, user: users[req.session.user_id] };
  res.render("urls_index", templateVars);
});



app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  const cookies = req.session;
  if (!cookies.user_id) {
    return res.render('login');
  }
  res.render("urls_new", templateVars);
});



// app.get("/test/:name/:job")
// //http://localhost:3000/test/rohit/manager => req.params.name | req.params.job

app.get("/urls/:id", (req, res) => {
  const IDs = req.params.id;
  const userId = req.session.user_id;

  // check if param id matches a shortURL in the db
  if (!urlDatabase[IDs]) {
    return res.send('The selected short URL does not exist');
  }

  //if current cookie user ID !== userid of UrlDatabse key
  if (urlDatabase[IDs].userID !== userId) {

    res.send('You do not have access to this URL.');
  }

  const templateVars = {
    user: users[req.session.user_id],
    id: IDs, longURL: urlDatabase[IDs].longURL
  };
  console.log("templateVars: ", templateVars); // assigned req.params.id to a variable IDs 
  res.render("urls_show", templateVars);
});


app.get('/register', (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.session.user_id };

  //if already logged in - redirect to urls 
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  res.render('register', templateVars);
});



app.get('/login', (req, res) => {
  //if already logged in - redirect to urls 
  if (req.session.user_id) {
    return res.redirect('/urls');
  }

  res.render('login');
});



app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.send('You must log in before addding a URL');
  }

  if(!req.body.longURL) {
    res.status(406).send('You must sumbit a valid URL. ' + 'Please try again <a href="/urls/new">here</a>')
  }
  const id = helpers.generateRandomString();
  urlDatabase[id] = {};
  urlDatabase[id].longURL = req.body.longURL;
  urlDatabase[id].userID = req.session.user_id;
  res.redirect(`/urls/${id}`);
});


//submitted from the delete button on myURLs page
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;

  if (!urlDatabase[id]) {
    return res.status(400).send('The requested URL does not exist.');
  }

  const userId = req.session.user_id;
  if (urlDatabase[id].userID !== userId) {

    return res.status(401).send('You do not have access to this URL. ' + '<a href="/urls">View your URLs</a>');
  }

  delete urlDatabase[id];
  res.redirect('/urls');
});


//submitted from edit buttin on myurls page
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const userId = req.session.user_id;

   if(!req.body.Edit) {
    res.status(406).send('You must sumbit a valid URL. ' + 'Please try again <a href="/urls">here</a>')
  }

  if (!urlDatabase[shortURL]) {
    return res.status(400).send('The requested URL does not exist.');
  }

  if (urlDatabase[shortURL].userID !== userId) {

    return res.status(401).send('You do not have access to this URL.');
  }

  console.log('shortURL: ', shortURL);
  urlDatabase[shortURL].longURL = req.body.Edit;
  res.redirect('/urls');
});


app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = helpers.getUserByEmail(email, users);

  if (!user) {
    return res.status(403).send('Email does not exist.\n' + 'Please try again with a valid email <a href="/login">Login Page</a>');
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send('Incorrect Password. ' + 'Please try again <a href="/login">Login Page</a>');
  }

  req.session.user_id = user.id;
  res.redirect('/urls');

});


app.post('/logout', (req, res) => {
  req.session = null; // removing the session cookie
  res.redirect('/login');
});


//registering a new user in the db and asigning cookie
app.post('/register', (req, res) => {
  console.log('REQ: ', req.body);
  let email = req.body.email;
  let password = req.body.password;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  //check if empty email or password entered in register form
  if (!email || !password) {
    return res.status(400).send('Invalid email or Password');
  }

  // check if user email already exists

  if (helpers.getUserByEmail(email, users)) {
    return res.status(400).send('Email already exists!');
  }


  //assign a random user id and add user to DB
  let id = helpers.generateRandomString();
  users[id] = {
    id: id,
    email: req.body.email,
    password: hashedPassword
  };

  //add users cookie as user_id
  req.session.user_id = id;
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

