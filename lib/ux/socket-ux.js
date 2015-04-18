//Socket.io UX stuff, like getting public channels, sending messages, etc.

var logger = require('../../logger'); //for pretty console outputs
var PublicChannel=require('../../models/PublicChannel');
var validator=require('./../validator');

module.exports=function(io,socket,RedisClient){
  socket.on('subscribeToChannel', function(channel) {
    require('./subscribeToChannel')(socket, channel, RedisClient.MainDB);
  });

  socket.on('getPublicChannelsList', function() {
    require('./getPublicChannelsList')(socket,RedisClient.MainDB);
  });

  socket.on('createPublicChannel', function(channel) {
    require('./createPublicChannel')(socket,channel,RedisClient.MainDB);
  });

  socket.on('checkPublicChannelName', function(channelName) {
    require('./checkPublicChannelName')(socket, channelName,RedisClient.MainDB);
  });

  socket.on('joinRoom', function(room) {
    require('./joinRoom')(socket, room,RedisClient);
  });

  socket.on('message', function(message) {
    require('./sendMessage')(socket,message,io, RedisClient);
  });
};
