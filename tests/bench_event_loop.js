//Used for benchmarking the io loop
var blocked = require('blocked');
var logger=require('../logger.js');

module.exports = function() {
  var num=0;
  var avg=0;
  var total=0;

  setInterval(function() {
    Array(10000000).join('a');
  }, 500);

  setInterval(function() {
    Array(100000000).join('a');
  }, 3000);

  blocked(function(ms) {
    num++;
    total+=ms;
    avg=Math.round(total/num);
    logger.debug('EVENT LOOP BLOCKED FOR %sms', ms | 0);
    logger.debug('AVERAGE TIME BLOCKED: '+avg+"ms");
  });
};
