//gruntfiel
module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    express: {
      dev: {
        options: {
          script: './app.js'
        }
      }
    },
    watch: {
      express: {
        files: ['./*.js', './routes/*.js', './models/*.js', './config/*.js'], //Files to be watched
        tasks: ['express:dev'], //(Re)start the server
        options: { //Server options
          spawn: false //Must have for reload
        }
      },
      static: {
        files: ['./views/*', './public/scripts/*.js', './public/style/*.css'], //Files to be watched
        tasks: ['uglify:build', 'cssmin:build'],
        options: { //Server options
          spawn: false, //Must have for reload
          livereload: true //Enable LiveReload
        }
      }
    },
    open: {
      dev: {
        path: 'http://localhost:3000'
      }
    },
    // configure jshint to validate js files -----------------------------------
    jshint: {
      options: {
        reporter: require('jshint-stylish') // use jshint-stylish to make our errors look and read good
      },
      // when this task is run, lint the Gruntfile and all js files in src
      build: ['Gruntfile.js', '/**/*.js']
    },
    uglify: {
     options: {
     },
     build: {
       files: {
         'public/scripts/dist/libraries.min.js': ['public/scripts/angular.min.js','public/scripts/jquery.min.js','public/scripts/bootstrap.min.js','public/scripts/socket.io.client.js'],
         'public/scripts/dist/client.min.js': 'public/scripts/client.js'
       }
     }
   },
   // configure cssmin to minify css files ------------------------------------
   cssmin: {
     options: {
     },
     build: {
       files: {
         'public/style/dist/libraries.min.css': ['public/style/bootstrap.min.js', 'public/style/bootstrap-theme.min.css'],
         'public/style/dist/app.style.min.css':'public/style/app.css'
       }
     }
   }
  });
  grunt.registerTask('dev', ['uglify:build', 'cssmin:build', 'express:dev', 'open:dev', 'watch']);
  grunt.registerTask('default', ['express:dev', 'open:dev', 'watch']);
};
