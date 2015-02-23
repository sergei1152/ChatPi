//Initializing Required Default Modules
var express=require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//Initializing custom objects
var ChatRoom=require('./ChatRoom.js');
var mainRoute = require('./routes/main.js');

//settings the views directory
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs'); //setting ejs as the templating engine
app.engine('html', require('ejs').renderFile); //tells the server to serve html files through ejs

//Setting the public folder to server static content(images, javacsript, stylesheets)
app.use(express.static(__dirname+"/public"));

//Using the route
app.use('/',mainRoute);


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
    res.render('error', {
        message: err.message,
        error: {}
    });
});

http.listen(3000, function(){
  console.log('ChatPi Server Started. Listening on Port: '+ app.address().port);
});
