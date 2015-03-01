module.exports = function(app, passport) {

  app.get('/', isLoggedIn, function(req, res) {
      res.redirect('/app'); //redirect to the app page
  });

  app.get('/app',isLoggedIn, function(req, res) {
      res.render('app'); //renders the app page
  });

  app.get('/login', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('login', {
      message: req.flash('loginMessage')
    });
  });

  app.get('/register', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('register', {
      message: req.flash('signupMessage')
    });
  });

  app.post('/register', passport.authenticate('local-signup', {
    successRedirect: '/app', // redirect to the app page
    failureRedirect: '/register', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  app.get('/logout', function(req, res) {
    req.logout(); //using the passport method for logging out
    res.redirect('/login');
  });
};

//checks if user is authenticated using passports isAuthenticated method
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
	  return next();

  // if they aren't redirect them to the login page
  res.redirect('/login');
}
