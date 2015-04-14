//This modules saves the user properties to the socket object and emits the metadata back to the client
var logger=require('../logger.js'); //for pretty console outputs

module.exports=function(user,socket){
  //setting properties about the socket
  socket.user_id = user._id;
  socket.name = user.name;
  socket.username = user.username;
  socket.profile_picture = user.profile_picture;
  socket.user_changes = {
    changed: false,
    new_subscriptions:[]
  };

  //send metadata back to the client
  socket.emit("metadata", {
    name: user.name,
    username: user.username,
    profile_picture: user.profile_picture,
    onlineStatus: user.online_status,
    subscribed_public_channels: user.subscribed_public_channels,
    private_groups: user.private_groups,
    contacts: user.contacts
  });
  logger.info("User " + user.name + " successfully connected to the chat");
};