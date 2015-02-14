var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

//executs when a user connects
io.on('connection', function(socket){
    console.log('a user connected');

    //When a new chat message has been received
    socket.on('chat message', function(msg){
	console.log('message: ' + msg);
	io.emit('chat message',msg);
    });
    
    //executes when a user disconnects
    socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
