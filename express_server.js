const express = require("express");
const morgan = require('morgan');
const bcrypt = require("bcryptjs");
const app = express(); // Create server connection - initialize app 
const PORT = 8080; // default port 8080

const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(morgan('dev')); //(req,res,next)  

app.set("view engine", "ejs");


//generate a random string code for short URLS
function generateRandomString() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}


//helper funtion to get users
const getUserByEmail = (email) => {

  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }

  return null;
};

//helper function to get urls for specific user
const urlsForUser = function(id) {
  const newObj = {};

  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      newObj[key] = {
        longURL: urlDatabase[key].longURL
      };
    }

  }
  return newObj;
};


//needed to parse the body of a post request to be human readable 
app.use(express.urlencoded({ extended: true }));

//Databases

const users = {
  user1: {
    id: "user1",
    email: "user@a.com",
    password: "1234",
  },
  user2: {
    id: "user2",
    email: "user2@a.com",
    password: "1234k",
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
  // "xyz": "https://www.microsoft.com"
};
// urlDatabase["xyz"] => "https://www.microsoft.com"


//home page route
app.get("/", (req, res) => {
  console.log('URLS DB: ', urlDatabase);
  res.send("This is the home page for TinyApp!!");
});


//redirect /u/smallUrls to their long URL value
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});


app.get("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  if (!userID) {
    return res.status(401).send('You must Register or Login before you can view URLs');
  };

  const usersURLS = urlsForUser(userID);


  const templateVars = { urls: usersURLS, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});



app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] };
  const cookies = req.cookies;

  // if(Object.keys(cookies).length === 0) {
  //   return res.render('login');
  // }

  if (!cookies.user_id) {
    return res.render('login');
  }
  res.render("urls_new", templateVars);

});



// app.get("/test/:name/:job")
// //http://localhost:3000/test/rohit/manager => req.params.name | req.params.job

app.get("/urls/:id", (req, res) => {
  //http://localhost:3000   /urls/x26dh => req.params.id

  const IDs = req.params.id;
  const userId = req.cookies.user_id;

  // check if param id matches a shortURL in the db
  if (!urlDatabase[IDs]) {
    return res.send('The selected short URL does not exist');
  }

  //if current cookie user ID !== userid of UrlDatabse key
  if (urlDatabase[IDs].userID !== userId) {

    res.send('You do not have access to this URL.');
  }


  const templateVars = {
    user: users[req.cookies.user_id],
    id: IDs, longURL: urlDatabase[IDs].longURL
  };
  console.log("templateVars: ", templateVars); // assigned req.params.id to a variable IDs 
  res.render("urls_show", templateVars);
});



// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });



app.get('/register', (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };

  //if already logged in - redirect to urls 
  if (req.cookies.user_id) {
    return res.redirect('/urls');
  }


  res.render('register', templateVars);
});



app.get('/login', (req, res) => {

  //if already logged in - redirect to urls 
  if (req.cookies.user_id) {
    return res.redirect('/urls');
  }


  res.render('login');
});



app.post("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    return res.send('You must log in before addding a URL');
  }

  const id = generateRandomString();
  urlDatabase[id] = {};
  urlDatabase[id].longURL = req.body.longURL;
  urlDatabase[id].userID = req.cookies.user_id;
  console.log(`id is: ${id} and url is ${req.body.longURL}`);
  console.log(urlDatabase);
  res.redirect(`/urls/${id}`);
});


//submitted from the detel button on myURLs page
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;

  if(!urlDatabase[id]){
    res.status(400).send('The requested URL does not exist.');
  }

  const userId = req.cookies.user_id;
  if (urlDatabase[id].userID !== userId) {

    return res.status(401).send('You do not have access to this URL.');
  }

  delete urlDatabase[id];
  res.redirect('/urls');
});


//submitted from edit buttin on myurls page
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const userId = req.cookies.user_id;

  if(!urlDatabase[shortURL]){
    res.status(400).send('The requested URL does not exist.');
  }

  if (urlDatabase[shortURL].userID !== userId) {

    return res.status(401).send('You do not have access to this URL.');
  }
  
  console.log('shortURL: ', shortURL);
  urlDatabase[shortURL] = req.body.Edit;
  res.redirect('/urls');
});


app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = getUserByEmail(email);
 
  if (!user) {
    return res.status(403).send('User does not exist');
  }

  if (!bcrypt.compareSync(password, user.password)){
    return res.status(403).send('Incorrect Password');
  }

  res.cookie('user_id', user.id);
  res.redirect('/urls');

});

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/login');
});








//registering a new user in the db and asigning cookie
app.post('/register', (req, res) => {
  // console.log(req.body.email)
  // console.log(req.body.password)
  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  //check if empty email or password entered in register form
  if (!email || !password) {
    return res.status(400).send('Invalid email or Password');
  }

  // check if user email already exists

  if (getUserByEmail(email)) {
    return res.status(400).send('Email already exists!');
  }


  //assign a randon user id and add user to DB
  let id = generateRandomString();
  users[id] = {
    id: id,
    email: req.body.email,
    password: hashedPassword
  };

  //add users cookie as user_id
  res.cookie('user_id', id);

  console.log(users);
  res.redirect('/urls');
});






app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

