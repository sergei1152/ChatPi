var logger=require('../logger.js');
var SERVER_SETTINGS=require('../config/server-config.js');

module.exports=function(user,RedisClient){
  // all is well, save the user to redis, return successful user
  RedisClient.set('user:' + user._id, JSON.stringify({
    name: user.name,
    username: user.username,
    profile_picture: user.profile_picture,
    online_status: 'Online',
    subscribed_channels: user.subscribed_public_channels,
    private_groups: user.private_groups,
    contacts: user.contacts
  }), function (err) {
    if (err) {
      logger.error('There was an error in saving a user to the redis database \n',{'error': error});
    }
    RedisClient.expire('user:' + user._id, SERVER_SETTINGS.userTTL);
  });
};