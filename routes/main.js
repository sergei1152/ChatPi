var express = require('express');
var router = express.Router(); //creating an instance of the router object

router.get('/', function(req, res,next) {
  res.render('login.html'); //renders the login page and sends the outputted html to the client
});

module.exports = router;
