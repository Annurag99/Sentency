const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

// Init App
const app = express();

// DB Connection, mongo atlas db as a service //need todo
mongoose.connect(
    'mongodb+srv://dbAdmin:'+
    process.env.MONGO_ATLAS_PW +
    '@sentency-hxywh.mongodb.net/test?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useFindAndModify:false,
        useUnifiedTopology: true
    });

// Bring in Models
let Sentence = require('./models/sentence');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// to parse req body
app.use(bodyParser.urlencoded({ extended: false })); //false for simple body, true for rich body
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
    secret: 'secret sentency',
    resave: true,
    saveUninitialized: true
}));

// Express Messages Middleware
app.use(flash());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});

// Handling CORS in browers
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// Home Route
app.get('/', function(req, res){
    Sentence.find({}, function(err, sentences){
      if(err){
        console.log(err);
      } else {
        res.render('index', {
          title:'Sentences',
          sentences: sentences
        });
      }
    });
  });

// Route Files
let sentences = require('./routes/sentences');
let users = require('./routes/users');
app.use('/sentences', sentences);
app.use('/users', users);

module.exports = app;
