//This file contains connection and configuration settings for the Redis Database that is used for session storage
//Edit this if the default redis configuration isn't working out for you

//INPUT YOUR CUSTOM REDIS CONFIGURATION HERE
var redisDatabaseConfig = {
  host: "127.0.0.1", //aka localhost. Change if you are using another computer to host the redis database
  databasePassword: null, //if the redis db is locked with a password, input it here

  mainDB: { //used to store the public channels list, private groups list, etc..
    dbnumber:0,
    port:6379
  },
  channelMessagesDB: { //used only to store the messages from public channels
    dbnumber:1,
    port:6379
  },
  groupMessagesDB: {//used only to store the messages from private groups
    dbnumber:2,
    port:6379
  },
  userDB: {//used only to store users
    dbnumber:3,
    port:6379
  }
};

var logger = require("../logger.js"); //for pretty console log outputs
var redis=require('redis'); //node-redis module used for interacting with the redis server

//creates the client based on the settings above
redisDatabaseConfig.createClient=function(type,callback){
  var RedisClient= redis.createClient(
    this[type].port,
    this.host,
    {
      auth_pass:this.databasePassword
    }
  );
  //setting up status callbacks
  var dbnumber=this[type].dbnumber;
  RedisClient.select(dbnumber, function() {
    logger.info("Connected to redis database #" + dbnumber);
  });
  RedisClient.on("connect", function(err) {
    callback(null);
  });
  RedisClient.on("error", function(err) {
    logger.error("An error occurred with the redis client\n"+err);
    callback(err);
  });
  return RedisClient;
};

module.exports = redisDatabaseConfig;
