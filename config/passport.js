var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/User');
var fs = require('fs');
var path=require('path');
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
  passport.use('signup', new LocalStrategy({
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
          if (err) {
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
            newUser.username = username;
            newUser.password = newUser.generateHash(password);
            newUser.createdAt = Date.now();
            newUser.name = req.body.name;
            console.log(req.files);
            //checks if the user uploaded a profile picture

            var imagePath=req.files.profile_picture.path;
            if (imagePath){
              newUser.profile_picture = req.files.profile_picture.path;
              //saves the profile image (if any) to the resources folder
              var extension=req.files.profile_picture.mimetype.replace(/(.*)\//,"");//image/jpg ==> jpg
              console.log(extension);
              if(extension=="jpg" || extension=="png" || extension == "jpeg"){
              fs.readFile(imagePath, function(err, data) {
                var newPath = path.join(__dirname,"../public/resources/profiles/"+username+"."+extension);
                console.log(newPath);
                fs.writeFile(newPath, data, function(err) {
                  if (err)
                    console.error(err);
                });
              });
            }
            else{
              newUser.profile_picture = "default.png";
            }
            }
            else{
              newUser.profile_picture = "default.png";
            }
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

  passport.use('login', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with email and password from our form

      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({
        'username': username
      }, function(err, user) {
        // if there are any errors, return the error before anything else
        if (err)
          return done(err);

        // if no user is found, return the message
        if (!user)
          return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

        // if the user is found but the password is wrong
        if (!user.validPassword(password)) {
          console.log("wrong password");
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
        }
        // all is well, return successful user
        return done(null, user);
      });

    }));

};
