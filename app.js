//=======Initializing Required Modules=======
var express = require('express');
var app = express(); //the instance of express
var http = require('http').Server(app);
var mongoose = require('mongoose'); //for interacting with the mongodatabase
var passport = require('passport'); //for user authentication
var flash = require('connect-flash'); //for sending flash messages to the user at the login and registration screen
var cookieParser = require('cookie-parser');
var session = require('express-session');
var RedisClient = require("redis").createClient(); //the redis client
var RedisStore = require('connect-redis')(session); //used to store session data in the redis database
var morgan = require('morgan'); //for logging request details
var logger = require('./logger.js');
var fs = require('fs'); //for file system management. Used to manage the tmp directory

//======Database Settings and Configuration======
var MongoDBConfig = require('./config/mongo-config.js')(mongoose); //configures the mongoDB database
var RedisDBConfig = require('./config/redis-config.js'); //has the database configuration settings
RedisDBConfig.configure(RedisClient); //configures the Redis Database

//======Configuring the Server=======
var SERVER_SETTINGS = require("./config/server-config.js");
require('./config/passport-config.js')(passport); //configures the passport module

//setting the port number for the server to use
var PORTNUMBER = process.env.PORT || 3000; //setting to use the port set in the environment variable, or 3000 if its not defined
app.set('port', PORTNUMBER);

//settings the views directory for the templating engine
app.set('views', __dirname + '/views');

//setting ejs as the templating engine
app.set('view engine', 'ejs');

//tells the server to serve html files through ejs
app.engine('html', require('ejs').renderFile);

//======Configuration of Middleware===========
//Using morgan middle ware to log all requests and pipe them to winston
app.use(require('morgan')('tiny', {
  "stream": logger.stream
}));

//Setting the public folder to server static content(images, javacsript, stylesheets)
app.use(express.static(__dirname + "/public"));

app.use(cookieParser(SERVER_SETTINGS.sessionKey,{
  httpOnly:true
}));

app.use(session({
  store: new RedisStore({
    host: RedisDBConfig.host,
    port: RedisDBConfig.portNumber,
    db: RedisDBConfig.databaseNumber,
    prefix:"sessions:",
    pass:RedisDBConfig.databasePassword,
    ttl:86400 //time to live for the session in seconds (1 day)
  }),
  // unset:"destroy",
  name:SERVER_SETTINGS.sessionIDName,
  secret: SERVER_SETTINGS.sessionKey,
  cookie: {
    maxAge: 86400000 //for 1 day
  },
  saveUninitialized:false,
  resave:false
}));

app.use(passport.initialize()); //initializing passport
app.use(passport.session()); // for persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


require('./routes/main.js')(app, passport); //configuring routes
require("./socket.js")(http, RedisClient); //configuring socket.io

// catch 404 and render 404 page
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.status(err.status);
  res.render('404', {
    message: err.message,
    error: {}
  });
});

//Start the server and listen on the defined port
http.listen(app.get('port'), function() {
  logger.info('ChatPi Server Started. Listening on Port: ' + PORTNUMBER);
});
