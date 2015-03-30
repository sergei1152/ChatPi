//This file contains the mongoDB database configuration and connection settings
var logger=require('../logger.js');

//Edit this line for custom mongoDB server options
var MongoDBConfig={
  url:'mongodb://127.0.0.1:27017'
};

module.exports=function(mongoose,callback){
  mongoose.connect(MongoDBConfig.url); //have mongoose connect to the MongoDB database

  //if mongoose fails to connect to the database
  mongoose.connection.on('connected', function() {
    logger.info("Successfully connected to the mongoDB database");
    callback();
  });
  //if mongoose is disconnected from the database
  mongoose.connection.on('disconnected', function() {
    logger.warn("The connection at the mongodb database at "+MongoDBConfig.url+" has been disconnected");
  });
  //if mongoose fails to connect to the database
  mongoose.connection.on('error', function(err) {
    logger.error("An error occured connecting to the mongoDB database.\n"+err);
  });
  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', function() {
    mongoose.connection.close(function () {
      logger.warn('MongoDB database has been disconnected through app termination');
      process.exit(0);
    });
  });
};
