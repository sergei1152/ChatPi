//Retrieves the entire list of public channels and sends the client the data
var logger=require('../../logger.js');

module.exports=function(socket,RedisClientMainDB){
	//get all the values from  the hash 'channellist'
  RedisClientMainDB.HVALS('channellist',function(err,channellist){
		if (err){
			logger.error('There was an error in retrieving the channels list from the redis database \n',{error:err});
		}
		else{
			if (!channellist){
				logger.debug('A user tried to retrieve the public channels list, however none were found');
				socket.emit('publicChannelsList', '');
			}
			if(channellist){
				logger.debug('Retrieving list of public channels and sending to client \n',{username: socket.username});
				socket.emit('publicChannelsList', channellist);
			}
		}
	});
};