var multer=require('../config/multer-config.js'); //for parsing forms with file uploads
var bodyParser=require('body-parser').urlencoded({ //for parsing forms with no file uploads
  extended: false
});
var logger=require('../logger.js'); //for pretty console outputs
var SERVER_SETTINGS=require('../config/server-config.js');
module.exports = function(app, passport) {

  app.get('/', isLoggedIn, function(req, res) {
      res.redirect('/app/'); //redirect to the app page
  });

  app.get('/app/',isLoggedIn, function(req, res) {
      res.render('app',{
        livereload: SERVER_SETTINGS.livereload //injects the live reload script (if true)
      }); //renders the app page
  });

  app.get('/login/', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('login', {
      loginMessage: req.flash('loginMessage')
    });
  });

  app.post('/login/', bodyParser, passport.authenticate('login', {
    successRedirect: '/app/', // redirect to the app page
    failureRedirect: '/login/', // redirect back to the signup page if there is an error
    failureFlash: true, // allow flash messages
  }));

  app.get('/register/',function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('register', {
      signUpMessage: req.flash('signUpMessage')
    });
  });

  app.post('/register/', multer,  passport.authenticate('register', {
    successRedirect: '/app/', // redirect to the app page
    failureRedirect: '/register/', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  app.get('/logout/', function(req, res) {
    req.session.destroy(); //deleting the session from the database
    req.logout(); //using the passport method for logging out
    res.redirect('/login/');
  });
};

//checks if user is authenticated using passports isAuthenticated method
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
	  return next();

  // if they aren't redirect them to the login page
  res.redirect('/login/');
}
