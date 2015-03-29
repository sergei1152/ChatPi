//This modules saves the user properties to the socket object and emits the metadata back to the client
var logger=require('../logger.js'); //for pretty console outputs

module.exports=function(socket,user){
  //setting properties about the socket
  socket.userId = user.id;
  socket.name = user.name;
  socket.username = user.username;
  socket.profile_picture = user.profile_picture;
  socket.authorized = true;
  socket.userChanges = {
    changed: false,
    newSubscriptions:[]
  };

  //send metadata back to the client
  socket.emit("metadata", {
    clientName: user.name,
    clientUsername: user.username,
    clientProfilePic: user.profile_picture,
    clientOnlineStatus: user.onlineStatus,
    subscribedChannels: user.subscribed_public_channels,
    privateGroups: user.private_groups,
    contacts: user.contacts
  });
  logger.info("User " + user.name + " successfully connected to the chat");
};