var ChatRoom = require('./models/ChatRoom.js');
var User = require('./models/User.js');
var Message = require('./models/Message.js');

module.exports=function(http,RedisClient){
  var io = require('socket.io')(http);

//Creating the chatroom object
var chat = new ChatRoom();
chat.authorized_users = ['serge'];
var onlineUsers = 0;
// //executes when a user connects

io.on('connection', function(socket) {
  console.log("a connection has been made");
  onlineUsers++;
  console.log('Online Users: ' + onlineUsers);
  socket.on('session', function(data) {
    //checking for whether the sessionID is found in the database before letting the user connect
    RedisClient.get("sess:"+data, function(err, reply) {
      if(err){
        return console.err(err);
      }
      if (reply) {
        User.findOne({'_id':JSON.parse(reply).passport.user},function(err,result){
          if(err)
            console.err(err);
          socket.name=result.name;
          socket.username=result.username;
          socket.authorized = true;
          socket.emit("credentials",{name:result.name, username:result.username}); //sends the user his name and username
        });

      } else {
        //disconnects the user if session handshake failed
        socket.emit('disconnect',"Sorry, you've been disconnected because of authorization reasons");
        socket.disconnect();
        socket.authorized = false;
      }
    });
  });

  //When a new chat message has been received
  socket.on('message', function(data) {
    if (socket.authorized) {
      var newMessage=new Message();
      newMessage.senderUsername=socket.username;
      newMessage.senderName=socket.name;
      newMessage.contents=data.contents;
      newMessage.type=data.type;
      newMessage.dateSent=Date.now();
      newMessage.dateSentInMinutes=Math.ceil(newMessage.dateSent.getTime()/1000/60);
      io.emit('message', newMessage);
    }
  });

  //executes when a user disconnects
  socket.on('disconnect', function() {
    onlineUsers--;
    console.log('Online Users: ' + onlineUsers);
  });
});
};
