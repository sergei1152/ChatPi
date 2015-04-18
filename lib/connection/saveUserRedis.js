//Saves the user mongoose model to the redis database. Used in the registration and login process, and in the socket handshake process
var logger=require('../../logger.js');
var SERVER_SETTINGS=require('../../config/server-config.js');

module.exports=function(user,RedisClientUserDB){
  var newUser=[
    'user:'+user.username, //the key name
    '_id', user._id, //field:value pairs
    'username', user.username,
    'password', user.password,
    'name',user.name,
    'profile_picture',user.profile_picture,
    'online_status', user.online_status,
    'subscribed_public_channels',user.subscribed_public_channels,
    'private_groups',user.private_groups,
    'contacts',user.contacts
  ];
  RedisClientUserDB.HMSET(newUser, function (err) {
    if (err) {
      logger.error('There was an error in saving a user to the redis database after a registration/login \n',{'error': error});
    }
    else{
      RedisClientUserDB.expire('user:' + user._id, SERVER_SETTINGS.userTTL);
    }
  });
};