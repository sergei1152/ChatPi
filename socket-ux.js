//This module has everything to do with the socket.io stuff with the regular usage

var logger = require('./logger.js'); //for pretty console outputs

var PublicChannel=require('./models/PublicChannel.js');
var Message = require('./models/Message.js');
var checkPublicChannelName=require('./static/checkPublicChannelName.js');
var createPublicChannel=require('./static/createPublicChannel.js');
var saveMessageToRoom=require('./static/saveMessageToRoom.js');
var async=require('async');
var getPublicChannels=require('./static/getPublicChannels.js');

module.exports=function(io,socket,RedisClient){
  //When a new chat message has been received
  socket.on('message', function(data) {
    //creating the message
    var newMessage = new Message();
    newMessage.senderUsername = socket.username;
    newMessage.senderName = socket.name;
    newMessage.contents = data.contents;
    newMessage.type = data.type;
    newMessage.dateSent = Date.now();
    newMessage.dateSentInMinutes = Math.ceil(newMessage.dateSent.getTime() / 1000 / 60);
    newMessage.senderProfilePicture = socket.profile_picture;
    newMessage.destination = data.destination._id;
    //will send to the buffer in this line, before setting the profile picture
    io.sockets.in(data.destination._id).emit('message', newMessage);
    saveMessageToRoom(newMessage,data.destination,RedisClient); //saves the new message to the chat history
    logger.debug('Sending message to ' + data.destination._id);
  });
  
  socket.on('getPublicChannelsList', function(data) {
    getPublicChannels(RedisClient, socket); 
  });

  socket.on('joinRoom', function(data) { //TODO Room id and authorization validation
    RedisClient.exists(data._id,function(err){
      if(!err){
        RedisClient.get('channel:'+data._id,function(err,channel){
          if(!err){
            socket.emit('roomJoined',channel);
            socket.join(data._id);
            logger.debug('User '+socket.username+' joined channel '+data.name);
          }
        });
      }
    });
  });
  socket.on('subscribeToChannel', function(channel) {
    socket.userChanges.changed=true;
    socket.userChanges.newSubscriptions.push(channel);
  });

  socket.on('CreatePublicChannel', function(channel) {
    createPublicChannel(channel,socket,RedisClient);
  });
  //checks that database to see whether a name with the channel exists
  socket.on('checkPublicChannelName', function(channelName) {
    if(channelName){
      async.series([
          function(callback){
            checkPublicChannelName(channelName,RedisClient,callback);
          }
        ],
        //callback for after the function has finished
        function(err, results){
          socket.emit("PublicChannelNameStatus",results[0]);
        });
    }
  });
};
