//This module has everything to do with the socket.io stuff with the regular usage

var logger = require('./../../logger'); //for pretty console outputs

var PublicChannel=require('./../../models/PublicChannel');
var Message = require('./../../models/Message');
var checkPublicChannelName=require('./checkPublicChannelName');
var createPublicChannel=require('./createPublicChannel');
var saveMessageToRoom=require('./saveMessageToRoom');
var async=require('async');
var getPublicChannelsList=require('./getPublicChannelsList');
var validator=require('./../validator');
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
    saveMessageToRoom(newMessage,data.destination,RedisClient.ChannelMessagesDB); //saves the new message to the chat history
    logger.debug('Sending message to ' + data.destination._id);
  });
  
  socket.on('getPublicChannelsList', function(data) {
    getPublicChannelsList(socket,RedisClient.MainDB);
  });

  socket.on('joinRoom', function(data) { //TODO Room id and authorization validation
    RedisClient.MainDB.HGET('channellist',data.name,function(err,result){
      if(!err){
        if(result[0]){ //if the channel was found
          var channel={ //TODO CHANGE THIS TO NOT INCLUDE THE CHAT HISTORY ITEM
            _id: result[0],
            description:result[3],
            name: result[4]
          };
          socket.emit('roomJoined',channel);
          socket.join(channel._id);
        }
      }
    });
  });
  socket.on('subscribeToChannel', function(channel) {
    socket.user_changes.changed=true;
    socket.user_changes.new_subscriptions.push(channel);
  });

  socket.on('CreatePublicChannel', function(channel) {
    createPublicChannel(channel,socket,RedisClient.MainDB);
  });
  //checks that database to see whether a name with the channel exists
  socket.on('checkPublicChannelName', function(channelName) {
    if(validator.validatePublicChannelName(channelName)){
      async.series([
          function(callback){
            checkPublicChannelName(channelName,RedisClient.MainDB,callback);
          }
        ],
        //callback for after the result is retrieved
        function(err, results){
          socket.emit("PublicChannelNameStatus",results[0]);
        });
    }
  });
};
