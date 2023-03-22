const express = require("express");
const app = express(); // Create server connection - initialize app 
const PORT = 8080; // default port 8080

const cookieParser = require('cookie-parser');
app.use(cookieParser());



//generate a random string code for short URLS
function generateRandomString() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}


app.set("view engine", "ejs");

//needed to parse the bidy of a post request to be human readable 
app.use(express.urlencoded({ extended: true }));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
  // "xyz": "https://www.microsoft.com"
};
// urlDatabase["xyz"] => "https://www.microsoft.com"


//home page route
app.get("/", (req, res) => {
  console.log('URLS DB: ', urlDatabase);
  res.send("Hello!");
});


//redirect /u/smallUrls to their long URL value
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});



app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});



// app.get("/test/:name/:job")
// //http://localhost:3000/test/rohit/manager => req.params.name | req.params.job

app.get("/urls/:id", (req, res) => {
  //http://localhost:3000   /urls/x26dh => req.params.id

  const IDs = req.params.id;
  const templateVars = {
    username: req.cookies["username"],
    id: IDs, longURL: urlDatabase[IDs]
  };
  console.log("test ", templateVars); // assigned req.params.id to a variable IDs 
  res.render("urls_show", templateVars);
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  console.log(`id is: ${id} and url is ${req.body.longURL}`);
  console.log(urlDatabase);
  res.redirect(`/urls/${id}`); // Respond with 'Ok' (we will replace this)
});


app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  console.log('Parsed cookie: ', req.cookies["username"]);
  res.redirect('/urls');

});

app.post('/logout', (req, res) => {
  console.log(req.cookies['username'])
  res.clearCookie("username")
  res.redirect('/urls')
})




app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  console.log('shortURL: ', shortURL);
  urlDatabase[shortURL] = req.body.Edit;
  res.redirect('/urls');
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

