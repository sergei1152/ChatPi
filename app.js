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

app.use('/',mainRoute);

//404 Error Router
app.use(function (req, res){
  res.render("404.html");
});

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

http.listen(3000, function(){
  console.log('listening on *:3000');
});
