//Passport configuration that is used for authentication of users

var LocalStrategy = require('passport-local').Strategy; //importing passports local strategy module
var User = require('../models/User');
var fs = require('fs'); //for managing profile picture uploads
var path = require('path'); //for managing profile picture uploads
var logger = require('../logger'); //for pretty console outputs
var validator = require('../lib/validator'); //validates the input forms
var saveUserRedis=require('../lib/connection/saveUserRedis'); //saves the new user object to the database
var bcrypt = require('bcrypt-nodejs');
module.exports = function(passport,RedisClientUserDB) {
  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.username);
  });

  // used to deserialize the user
  passport.deserializeUser(function(username, done) {
    User.findOne({username:username}, function(err, user) {
      done(err, user);
    });
  });

  //passport strategy for registration
  passport.use('register', new LocalStrategy({
    usernameField: 'username', //the name of the username field in the POST request
    passwordField: 'password', //the name of the password field in the POST request
    passReqToCallback: true // allows us to pass back the entire request to the callback function (below)
  },
  function(req, username, password, done) {
    process.nextTick(function() {
      //validating all the fields, including the profile picture (if exists)
      if (validator.validateRegistration(req)){
        //searches the mongodb database for the username to check if it already exists
        User.findOne({
          'username': username
        }, function(err, user) {
          // if there are any errors, return the error
          if (err) {
            logger.error("An error occured while retrieving usernames from the mongo database at the register screen\n %j", {
              'error': error
            }, {});
            return done(err);
          }
          // if there is an existing user with the same username
          if (user) {
            return done(null, false, req.flash('signUpMessage', 'That username is already taken'));
          }
          //if the username is unique
          var newUser = new User();

          // set the user's local credentials
          newUser.username = username;
          newUser.password = newUser.generateHash(password);
          newUser.createdAt = Date.now();
          newUser.name = req.body.name;
          newUser.online_status = 'Online';

          //if a profile picture was uploaded (validation already done from above)
          if (req.files.profile_picture) {
            var imagePath = req.files.profile_picture.path;
            var newPath = path.join(__dirname, "../public/resources/profiles/" + username + "." + req.files.profile_picture.extension);

            //moves the profile picture to a permanent directory
            fs.rename(imagePath, newPath, function(err) {
              if (err) {
                logger.error('There was an error in reading a profile picture from the tmp/ folder\n %j', {
                  'error': err
                }, {});
                return done(null, false, req.flash('signUpMessage', 'Error saving your profile pic. Please try again.'));
              }
              else{
                newUser.profile_picture = username + "." + req.files.profile_picture.extension;
                return saveUser(newUser, done);
              }
            });
          } else { //if no profile picture was uploaded
            newUser.profile_picture = "default.png";
            saveUserRedis(newUser, RedisClientUserDB); //saving the user to the redis database
            return saveUser(newUser, done);
          }
        });
      } else { //if the validation failed
        return done(null, false, req.flash('signUpMessage', 'Validation failed. \n Please make sure your password is at least 8 characters long. \n Your profile picture (if any) is under 500kb. \n Your username or name has no special characters and is at least 3 characters long'));
      }
    });
  }));


  passport.use('login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  },
  function(req, username, password, done) { // callback with email and password from our form

    //If server side validation is passed
    if(validator.validateLogin(req)){
      RedisClientUserDB.HMGET(['user:'+username,'username','password'],function(err,result){
        if (err){ //if an error occurs, should continue to look up in mongodb instead
          logger.error('There was an error in looking up a user in the redis database.\n',{error:err});
        }
        if(result[0]&&result[1]){//if username is found in the redis database
          var user=new User();
          user.username=result[0];
          if(bcrypt.compareSync(password,result[1])){ //check if password is correct
            logger.debug('Redis: Successfully logged in user: '+username);
            return done(null, user);
          }
          else{
            logger.debug('Redis: A user tried to login with an incorrect password');
            return done(null, false, req.flash('loginMessage', 'Incorrect Username/Password')); // req.flash is the way to set flashdata using connect-flash
          }
        }
        else { //if user is not found in the redis database, look up in mongo instead
          User.findOne({
            'username': username
          }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err){
              logger.error('Mongo: There was an error in looking up a user in the mongo database \n',{error:err});
              return done(err);
            }

            // if no user is found
            if (!user){
              logger.debug('Mongo: Someone tried to login with a username that does not exist');
              return done(null, false, req.flash('loginMessage', 'Incorrect Username/Password'));
            }

            // if the user is found but the password is wrong
            if (!user.validPassword(password)) {
              logger.debug('Mongo: Someone tried to login with an incorrect password.');
              return done(null, false, req.flash('loginMessage', 'Incorrect Username/Password'));
            }

            //if the credentials are good
            saveUserRedis(user,RedisClientUserDB);
            logger.debug('Mongo: Successfully logged in user: '+username);
            return done(null, user);
          });
        }
      });
    }
    else { //if the validation failed
      return done(null, false, req.flash('loginMessage','Please make sure your username and password are valid'));
    }    
    }));
  };
  //custom save function for the user object since we need to return the done object after successful completion
  function saveUser(user,done){
    user.save(function(err) {
      if (err) {
        logger.error("There was an error saving a new users info into the database \n %j", err, {});
        return done(null, false, req.flash('signUpMessage', 'Error saving profile. Please try again'));
      }
      return done(null, user);
    });
  }
