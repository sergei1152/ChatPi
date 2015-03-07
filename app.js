//=======Initializing Required Modules=======
var express = require('express');
var app = express(); //the instance of express
var http = require('http').Server(app);
var mongoose = require('mongoose'); //for interacting with the mongodatabase
var passport = require('passport'); //for user authentication
var flash = require('connect-flash'); //for sending flash messages to the user at the login and registration screen
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser'); //for parsing non-multipart/form-data forms
var multer = require('multer'); //for parsing multipart/form-data forms
var session = require('express-session');
var randomstring = require("randomstring"); //used for session secret key
var RedisClient = require("redis").createClient(); //the redis client
var RedisStore = require('connect-redis')(session); //used to store session data in the redis database
var morgan = require('morgan'); //for logging request details
var logger = require('./logger.js');
//======Initializing custom required modules======
var MongoDBConfig = require('./config/mongo.js')(mongoose); //configures the mongoDB database
var RedisDBConfig = require('./config/redis.js'); //contains Redis database settings

//======Configuring the Server=======

//setting up the redis client
RedisClient.select(RedisDBConfig.databaseNumber, function() {
  logger.info("Redis Client is using database #" + RedisDBConfig.databaseNumber + " and a port number of " + RedisDBConfig.portNumber);
});
RedisClient.on("error", function(err) {
  logger.error("An error with the redis database.\n " + err);
});

require('./config/passport')(passport); //configure the passport module

//setting the port number for the server to use
var PORTNUMBER = 3000;
app.set('port', process.env.PORT || PORTNUMBER);

//settings the views directory for the templating engine
app.set('views', __dirname + '/views');

//setting ejs as the templating engine
app.set('view engine', 'ejs');

//tells the server to serve html files through ejs
app.engine('html', require('ejs').renderFile);

//======Configuration of Middleware===========
app.use(require('morgan')('tiny', {
  "stream": logger.stream
}));

//Setting the public folder to server static content(images, javacsript, stylesheets)
app.use(express.static(__dirname + "/public"));
app.use(cookieParser()); //enable the user of cookies
app.use(bodyParser()); //get info from html forms
app.use(multer({
  dest: './tmp/'
}));
app.use(session({
  store: new RedisStore({
    host: RedisDBConfig.host,
    port: RedisDBConfig.portNumber,
    db: RedisDBConfig.databaseNumber
  }),
  secret: randomstring.generate(128),
  cookie: {
    maxAge: 2678400000 // 31 days
  }
}));

app.use(passport.initialize()); //initializing passport
app.use(passport.session()); // for persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//=======Routes======
require('./routes/main.js')(app, passport);
//Everything to do with the socket controller
require("./socket.js")(http, RedisClient);

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

http.listen(3000, function() {
  logger.info('ChatPi Server Started. Listening on Port: ' + PORTNUMBER);
});
