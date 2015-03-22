//Will add a number of public channel entries to the mongodb database
var logger = require('../logger.js'); //for pretty console outputs
var mongoose = require('mongoose'); //for interacting with the mongodatabase
var MongoDBConfig = require('../config/mongo-config.js')(mongoose); //configures the mongoDB database
var PublicChannel = require('../models/PublicChannel.js');

//when connected to the database
mongoose.connection.on('connected', function() {
  var numChannels = 10;
  var saveCounter = 0;
  logger.info('Adding ' + numChannels + " public channels into the database");
  for (var i = 0; i < numChannels; i++) {
    var channel = new PublicChannel({
      chat_history: [],
      name: 'test'
    });
    channel.save(function(err) {
      if (err) {
        logger.error('There was an error in saving the public channels to the database');
      } else {
        saveCounter++;
      }
    });
  }
  logger.info('Successfully saved ' + numChannels + " public channels into the database");
});
