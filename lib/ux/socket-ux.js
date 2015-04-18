//Socket.io UX stuff, like getting public channels, sending messages, etc.

var logger = require('../../logger'); //for pretty console outputs
var PublicChannel=require('../../models/PublicChannel');
var async=require('async');
var validator=require('./../validator');

module.exports=function(io,socket,RedisClient){
  //When a new chat message has been received
  socket.on('message', function(message) {
    require('./sendMessage')(socket,message,io, RedisClient.ChannelMessagesDB);
  });
  
  socket.on('getPublicChannelsList', function(data) {
    require('./getPublicChannelsList')(socket,RedisClient.MainDB);
  });

  socket.on('joinRoom', function(room) {
    require('./joinRoom')(socket, room,RedisClient);
  });
  socket.on('subscribeToChannel', function(channel) {
    require('./subscribeToChannel')(socket, channel, RedisClient.MainDB);
  });
  socket.on('CreatePublicChannel', function(channel) {
    require('./createPublicChannel')(channel,socket,RedisClient.MainDB);
  });
  //checks that database to see whether a name with the channel exists
  socket.on('checkPublicChannelName', function(channelName) {
    if(validator.validatePublicChannelName(channelName)){
      async.series([
          function(callback){
            require('./checkPublicChannelName')(channelName,RedisClient.MainDB,callback);
          }
        ],
        //callback for after the result is retrieved
        function(err, results){
          socket.emit("PublicChannelNameStatus",results[0]);
        });
    }
  });
};
