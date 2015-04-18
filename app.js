//=======Initializing Required Modules=======
require('look').start();
var express = require('express');
var app = express(); //the instance of express
var http = require('http').Server(app);
var passport = require('passport'); //for user authentication
var flash = require('connect-flash'); //for sending flash messages to the user at the login and registration screen
var cookieParser = require('cookie-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session); //used to store session data in the redis database
var morgan = require('morgan'); //for logging http request details
var logger = require('./logger.js'); //configuration for winston logger
var fs = require('fs'); //for file system management. Used to manage the tmp directory
var compression=require('compression'); //for compressing files before serving them
var async=require('async');

//======Database Settings and Configuration======
var MongoDBConfig = require('./config/mongo-config.js');
var RedisDBConfig = require('./config/redis-config.js');
var RedisClient={};
RedisClient.MainDB=RedisDBConfig.createClient("mainDB");
RedisClient.ChannelMessagesDB=RedisDBConfig.createClient("channelMessagesDB");
RedisClient.GroupMessageDB=RedisDBConfig.createClient("groupMessagesDB");
RedisClient.UserDB=RedisDBConfig.createClient("userDB");
RedisClient.SessionDB=RedisDBConfig.createClient("sessionDB");

MongoDBConfig();

//======Configuring the Server=======
var SERVER_SETTINGS=require('./config/server-config.js'); //custom server settings

require('./config/passport-config.js')(passport,RedisClient.UserDB); //configures the passport module

//setting the port number for the server to use
app.set('port', process.env.port || SERVER_SETTINGS.serverPort);

//settings the views directory for the templating engine
app.set('views', __dirname + '/views');

//setting ejs as the templating engine
app.set('view engine', 'ejs');

//tells the server to serve html files through ejs
app.engine('html', require('ejs').renderFile);

//======Configuration of Middleware===========

if(SERVER_SETTINGS.logRequests){
  //Using morgan middle ware to log all requests and pipe them to winston
  app.use(require('morgan')('tiny', {
    "stream": logger.stream
  }));
}
//compresses all requests before sending them
app.use(compression());

//Setting the public folder to server lib content(images, javascript, stylesheets)
app.use(express.static(__dirname + "/public", {
  index:false, //disable directory indexing
  maxAge: SERVER_SETTINGS.userCacheTTL //how long to cache the content on client side (1 day)
}));

//for parsing cookies. Allows http cookies only
app.use(cookieParser(SERVER_SETTINGS.sessionKey, {
  httpOnly: true
}));

//Setting up sessions and using redis as the session store
app.use(session({
  store: new RedisStore({
    host: RedisDBConfig.host,
    port: RedisDBConfig.sessionDB.port,
    db: RedisDBConfig.sessionDB.dbnumber,
    prefix: "sessions:", //ie all keys will have the prefix 'sessions:' in them
    pass: RedisDBConfig.databasePassword,
    ttl: SERVER_SETTINGS.sessionTTL //time to live for the session in seconds (1 day)
  }),
  unset: "destroy", //delete the session from the database when it is unset (ie after a logout)
  name: SERVER_SETTINGS.sessionIDName,
  secret: SERVER_SETTINGS.sessionSecretKey, //used to sign and unsign the cookies
  cookie: {
    maxAge: SERVER_SETTINGS.cookieTTL //how long the client will keep the cookie before it expires
  },
  saveUninitialized: false, //do not save uninitialized (new but not modified) sessions to the database (so we don't get empty session keys in the db)
  resave: false //do not resave the session if it was unmodified
}));

app.use(passport.initialize()); //initializing passport
app.use(passport.session()); // for persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./routes/routes.js')(app, passport); //configuring routes
require("./lib/connection/socket-connect.js")(http, RedisClient); //configuring socket.io

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
  logger.info('ChatPi Server Started. Listening on Port: ' + SERVER_SETTINGS.serverPort);
});
