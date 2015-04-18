//Retrieves the entire list of public channels from the Redis Database and sends it to the client
var logger=require('../../logger.js');

module.exports=function(socket,RedisClientMainDB){
  RedisClientMainDB.HVALS('channellist',function(err,channellist){
		if (err){
			logger.error('There was an error in retrieving the public channels list from the redis database \n',{error:err});
		}
		else{
			if (!channellist){
				socket.emit('publicChannelsList', '');
			}
			if(channellist){
				logger.debug('Retrieving list of public channels and sending to client \n',{username: socket.username});
				socket.emit('publicChannelsList', channellist);
			}
		}
	});
};