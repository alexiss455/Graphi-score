//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// cookies and session
const passportLocalMongoose = require('passport-local-mongoose');
const session = require('express-session');
const passport = require('passport');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/userDB',{ useNewUrlParser: true});

// register user db
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  displayName:String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
})
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

app.use(function(req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.prof = true;
    res.locals.storeName = req.user.displayName;
  } else { 
    res.locals.prof = false;
  }
  next();
});


app.get("/", function(req, res){
  res.render("content")
})

app.get("/login", function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.render("login");
  }
});

app.get("/register", function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.render("register", { error: null });
  }
});

app.get('/review', (req, res) => {
  if (req.isAuthenticated()) {
    res.render("review");
  }else{
    res.render("login");
  }
});

app.get('/graphiscore', (req, res, next) => {
  res.render("graphiscore");
});


app.post("/register", function(req, res) {
  const { username, password, display_name } = req.body;

      User.register({ username: username, displayName: display_name }, password, function(err, user) {
        if (err) {
          if (err.name === "UserExistsError") { // handle UserExistsError
            res.render("register", { error: "A user with the given username is already registered" });
          } else {
            console.log(err);
            res.render("register", { error: "Server error" });
          }
        } else {
          passport.authenticate("local", {failureRedirect: "/register"})(req, res, function() {
            res.redirect("/");
          });
        }
      });
    });

app.post("/login", function(req, res) {
  const user = new User ({
    username: req.body.username,
    password: req.body.password
});
req.login(user, function(err) {
    if (err) {
        console.log(err);
    } else {
        passport.authenticate("local", { failureRedirect: '/login' })(req, res, function() {
            req.session.prof = true
            req.session.storeName = req.user.displayName;
          res.redirect("/");
        });
    }
});
});


app.get("/logout", function(req, res) {
  req.logout(function(err) {
      if (err) {
        console.error(err);
        return res.status(500).send('An error occurred while logging out.');
      }
      req.session.destroy(function (err) {
          res.redirect("/");
        });
    });
});






app.listen(3000, function() {
  console.log("Server started on port 3000");
});
