//Grunt file for some easy automation when developing the application
var SERVER_SETTINGS = require('./config/server-config.js');
module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt); //will load all the grunt plugins installed in the package.json

  grunt.initConfig({
    //to read the package.json for app versions
    pkg: grunt.file.readJSON('package.json'),

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
        files: ['./*.js', './routes/*.js', './models/*.js', './config/*.js', './static/*.js'], //Files to be watched
        tasks: ['jshint:server', 'express:dev'], //(Re)start the server
        options: { //Server options
          spawn: false //Must have for reload
        }
      },
      //will watch for any changes in client side javascript
      staticJS: {
        files: ['./public/scripts/*.js'], //Files to be watched
        tasks: ['jshint:client', 'uglify:dist', 'concat:js'], //will hint the files and then minify and concatinate
        options: { //Server options
          spawn: false, //Must have for reload
          livereload: true //Enable LiveReload
        }
      },
      staticCSS: {
        files: ['./public/styles/*.css'], //All css files in the styles directory
        tasks: ['cssmin:dist', 'concat:css'], //will hint the files and then minify and concatinate
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
      server: ['./*.js', './routes/*.js', './models/*.js', './config/*.js', './static/*.js'],
      client: ['./public/scripts/*.js']
    },

    //for concatinating all the minified css and javascript libraries into one file
    concat: {
      options: {
        // define a string to put between each file in the concatenated output
        separator: ';'
      },
      libscript: {
        // the files to concatenate
        src: [
          './bower_components/angular/angular.min.js',
          './bower_components/jquery/dist/jquery.min.js',
          './bower_components/bootstrap/dist/js/bootstrap.min.js',
          './bower_components/sockjs-client/dist/sockjs.min.js'],
        // the location of the resulting JS file
        dest: './public/scripts/dist/libraries.min.js'
      },
      libcss: {
        // the files to concatenate
        src: ['src/**/*.js'],
        // the location of the resulting JS file
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    //will minify all client side js files
    uglify: {
      options: {
        banner: '/*!<%= pkg.Name %> V<%= pkg.Version %> \n <%= pkg.description %> \nMinified on: <%=grunt.template.today("dd-mm-yyyy") %> */\n',
        mangle:false
      },
      //for minifying the libraries (done once since libraries don't really change often)
      socketio: {
        files: {
          './bower_components/sockjs-client/dist/sockjs.min.js': ['./bower_components/sockjs-client/dist/sockjs.js']
        }
      },
      //will minify all non-library or custom scripts
      client: {
        files: {
          './public/scripts/dist/app.min.js': ['./public/scripts/*.js']
        }
      }
    },
    // configure cssmin to minify css files ------------------------------------
    cssmin: {
      options: {},
      build: {
        files: {
          'public/style/dist/libraries.min.css': ['public/style/bootstrap.min.js', 'public/style/bootstrap-theme.min.css'],
          'public/style/dist/app.style.min.css': 'public/style/app.css'
        }
      }
    },

  });
  grunt.registerTask('setup', ['uglify:socketio','concat:libscript','uglify:client']);
  grunt.registerTask('default', ['express:dev', 'open:dev', 'watch']);
};
