const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
  // "xyz": "https://www.microsoft.com"
};
// urlDatabase["xyz"] => "https://www.microsoft.com"



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// app.get("/test/:name/:job")
// //http://localhost:3000/test/rohit/manager => req.params.name | req.params.job

app.get("/urls/:id", (req, res) => {
  //http://localhost:3000   /urls/x26dh => req.params.id
  
  const IDs = req.params.id;
  const templateVars = { id: IDs, longURL: urlDatabase[IDs] };
  console.log("test ", templateVars); // assigned req.params.id to a variable IDs 
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});