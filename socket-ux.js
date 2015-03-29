//This module has everything to do with the socket.io stuff with the regular usage

var logger = require('./logger.js'); //for pretty console outputs

var PublicChannel=require('./models/PublicChannel.js');
var Message = require('./models/Message.js');
var checkPublicChannelName=require('./static/checkPublicChannelName.js');
var createPublicChannel=require('./static/createPublicChannel.js');
var saveMessageToRoom=require('./static/saveMessageToRoom.js');
var async=require('async');

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
      //will send to the buffer in this line, before setting the profile picture
      io.sockets.in(data.destination._id).emit('message', newMessage);
      saveMessageToRoom(newMessage,data.destination,RedisClient); //saves the new message to the chat history
      logger.debug('Sending message to ' + data.destination._id);
  });
  socket.on('getPublicChannelsList', function(data) {
    logger.debug('Retrieving list of public channels and sending to client \n',{username: socket.username});
    //get all channels keys stored in redis database
    RedisClient.keys('channel:*',function(err,keys){
      if (err){
        logger.error('There was an error in retrieving the channels list from the redis database');
      }
      else{
        //get all the values of those keys
        RedisClient.mget(keys,function(err,channels){
          if (err){
            logger.error('There was an error in retrieving the channels list from the redis database');
          }
          if(channels){
            socket.emit('publicChannelsList', channels);
          }
        });
      }
    });
  });
  socket.on('joinRoom', function(data) { //TODO Room id and authorization validation
    if (data) {
      socket.join(data._id);
    }
    logger.debug('User '+socket.username+' joined channel '+data.name);
  });
  socket.on('subscribeToChannel', function(channel) {
    socket.userChanges.changed=true;
    socket.userChanges.newSubscriptions.push(channel);
  });

  socket.on('CreatePublicChannel', function(channel) {
    //check to make sure that the name is not taken
    if(channel.name){
      async.series([
          function(callback){
            checkPublicChannelName(channel.name,RedisClient,callback);
          }
        ],
        //callback for after the function has finished
        function(err, results){
          if(results[0]===true) { //if name taken
            socket.emit("PublicChannelNameStatus", results[0]);
          }
          else{//if the name is not taken, create the channel
            createPublicChannel(channel,socket,RedisClient);
          }
        });
    }
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