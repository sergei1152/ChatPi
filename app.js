//=======Initializing Required Modules=======
var express=require('express');
var app = express();
var http = require('http').Server(app);
var mongoose=require('mongoose');
var passport=require('passport');
var flash=require('connect-flash');
var cookieParser=require('cookie-parser');
var bodyParser=require('body-parser');
var session=require('express-session');
var io = require('socket.io')(http);
var randomstring = require("randomstring"); //used for session secret key

//Initializing custom objects
var configDB=require('./config/database.js'); //contains database settings
var ChatRoom=require('./models/ChatRoom.js');
var route = require('./routes/main.js'); //routes will go through this

//======Configuration of the Server=======

mongoose.connect(configDB.url); //have mongoose connect to the MongoDB database
require('./config/passport')(passport); // pass passport for configuration


//setting the port number for the server to use
var PORTNUMBER=3000;
app.set('port', process.env.PORT || PORTNUMBER);

//settings the views directory for the templating engine
app.set('views',__dirname + '/views');

//setting ejs as the templating engine
app.set('view engine', 'ejs');

//tells the server to serve html files through ejs
app.engine('html', require('ejs').renderFile);

//======Configuration of Middleware===========

//Setting the public folder to server static content(images, javacsript, stylesheets)
app.use(express.static(__dirname+"/public"));

app.use(cookieParser());//enable the user of cookies
app.use(bodyParser()); //get info from html forms

//enables the use of sessions in the app
app.use(session({
  secret:randomstring.generate(128),
  cookie: {
    maxAge: 2678400000 // 31 days
  }
}));
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(passport.initialize()); //initializing passport
app.use(passport.session()); // for persistent login sessions

//=======Routes======
require('./routes/main.js')(app, passport);

//Creating the chatroom object
var chat=new ChatRoom(254,"testuser");
var authorized_user="test";
var onlineUsers=[];

//executes when a user connects
io.on('connection', function(socket){
  onlineUsers.push(socket);
  console.log("A user connected");
  console.log("Currently online users: "+onlineUsers.length);

  //When a user attempts to join a chatroom
  socket.on('login', function(data){

    if (data.username==authorized_user){ //checks if the username is valid
      console.log(data.username+ " has logged in");
      io.emit("login_status",true); //tells the client that the login was successful
    }
    else{
      io.emit("login_status",false);//tells the client that the login was unsuccessful
    }
  });

    //When a new chat message has been received
    socket.on('message', function(data){

        io.emit('message',msg);
    });

    //executes when a user disconnects
    socket.on('disconnect', function(){
	    console.log('user disconnected');
    });
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('404.html', {
        message: err.message,
        error: {}
    });
});

http.listen(3000, function(){
  console.log('ChatPi Server Started. Listening on Port: '+PORTNUMBER);
});
