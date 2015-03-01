var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/User');

module.exports = function(passport) {

  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  //passport strategy for local signups
  passport.use('local-signup', new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
      console.log("Using passport strategy");
      // asynchronous
      // User.findOne wont fire unless data is sent back
      process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        console.log("Getting database usernames");

        User.findOne({
          'username': username
        }, function(err, user) {
          // if there are any errors, return the error
          if (err){
            console.log("An error occured retrieving usernames");
            return done(err);
          }


          // check to see if theres already a user with that email
          if (user) {
            console.log("A username with the naem has been found");

            return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
          } else {

            // if there is no user with that email
            // create the user
            var newUser = new User();

            // set the user's local credentials
            console.log("username: "+username);
            console.log("password: "+password);
            console.log("hashedpassword: "+newUser.generateHash(password));
            console.log("date: "+Date.now());
            console.log("name: "+req.body.name);


            newUser.username = username;
            newUser.password = newUser.generateHash(password);
            newUser.createdAt=Date.now();
            newUser.name=req.body.name;
            // newUser.profilePictureURL=req.body.pic;
            console.log("Saving Users Info");
            // save the user to the database
            newUser.save(function(err) {
              if (err)
                throw err;
              return done(null, newUser);
            });
          }

        });

      });

    }));

};
