//This file contains connection and configuration settings for the Redis Database that is used for session storage
var logger = require("../logger.js"); //for pretty console log outputs

//Input your redis database settings here
var redisDatabase = {
  databaseNumber: 2,
  portNumber: 6379,
  host: "localhost"
};

//Configures the redis client
redisDatabase.configure = function(RedisClient) {
  RedisClient.select(this.databaseNumber, function() {
    logger.info("Redis Client is using database #" + redisDatabase.databaseNumber + " and a port number of " + redisDatabase.portNumber);
  });
  RedisClient.on("error", function(err) {
    logger.error("An error with the redis database.\n " + err);
  });
};

module.exports = redisDatabase;
