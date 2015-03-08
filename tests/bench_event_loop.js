//Used for benchmarking the io loop
var blocked = require('blocked');
var logger=require('../logger.js');

module.exports = function() {
  setInterval(function() {
    Array(10000000).join('a');
  }, 500);

  setInterval(function() {
    Array(100000000).join('a');
  }, 3000);

  blocked(function(ms) {
    logger.debug('EVENT LOOP BLOCKED FOR %sms', ms | 0);
  });
};
