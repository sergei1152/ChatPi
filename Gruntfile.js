//Grunt file for some easy automation when developing the application
var SERVER_SETTINGS = require('./config/server-config.js');
module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt); //will load all the grunt plugins installed in the package.json

  grunt.initConfig({
    //is used to start and restart the express server
    express: {
      dev: {
        options: {
          script: './app.js'
        }
      }
    },

    //to open the webpage in the browser at first startup
    open: {
      dev: {
        path: 'http://localhost:' + SERVER_SETTINGS.serverPort
      }
    },
    //to watch for file changes and execute tasks
    watch: {
      //will watch for any server side javascript file changes
      express: {
        files: ['./*.js', './routes/*.js', './models/*.js', './config/*.js', './lib/**/*.js'], //Files to be watched
        tasks: ['jshint:server', 'express:dev'], //(Re)start the server
        options: { //Server options
          spawn: false //Must have for reload
        }
      },
      //will watch for any changes in client side javascript
      staticJS: {
        files: ['./public/scripts/*.js'], //Files to be watched
        tasks: ['jshint:client'], //will hint the files and then minify and concatinate
        options: { //Server options
          spawn: false, //Must have for reload
          livereload: true //Enable LiveReload
        }
      },
      staticCSS: {
        files: ['./public/style/*.css'], //All css files in the styles directory
        tasks: [], //will hint the files and then minify and concatinate
        options: { //Server options
          spawn: false, //Must have for reload
          livereload: true //Enable LiveReload
        }
      },
      //will watch for any file changes in any of the ejs files inside the views folder, and will live reload
      staticEJS: {
        files: ['./views/**/*'], //All files in the views directory to be watched
        tasks: [],
        options: { //Server options
          spawn: false, //Must have for reload
          livereload: true //Enable LiveReload
        }
      }
    },
    // configure jshint to validate js files -----------------------------------
    jshint: {
      options: {
        reporter: require('jshint-stylish') // use jshint-stylish to make our errors look and read good
      },
      // when this task is run, lint the Gruntfile and all js files in project root
      server: ['./*.js', './routes/*.js', './models/*.js', './config/*.js', './lib/*.js'],
      client: ['./public/scripts/*.js']
    }
  });
  grunt.registerTask('chrome',['express:dev', 'open:dev', 'watch']);
  grunt.registerTask('default', ['express:dev','watch']);
};
