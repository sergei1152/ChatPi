var PublicChannel = require('../models/PublicChannel.js'); //mongoose public channel model
var logger = require('../logger.js'); //for pretty console outputs
var publicChannels;
module.exports.getPublicChannels = function(callback) {
  PublicChannel.find({}, function(err, list) {
    logger.info('Loading list of Public Channels into memory...');
    // if there are any errors, return the error
    if (err) {
      logger.error("An error occured while retrieving public channels from the database\n %j", {
        'error': error
      }, {});
      callback(err, null);
    }

    //creating custom (non-mongoose) object to store the public channels list
    function Channel() {
      this.id = '';
      this.description = '';
      this.name = '';
    }
    var channels = []; //the channels list to export

    for (var i = 0; i < list.length; i++) {
      var tmp = new Channel();
      tmp.id = list[i]._id;
      tmp.name = list[i].name;
      tmp.description = list[i].description;
      channels.push(tmp);
    }
    logger.info('Successfully loaded public channels into memory');
    callback(null, channels);
  });
};
