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
      files: ['./*.js','./routes/*.js','./models/*.js','./config/*.js'], //Files to be watched
      tasks: ['express:dev'], //(Re)start the server
      options: { //Server options
        spawn: false //Must have for reload
      }
    },
    static:{
      files: ['./*.js','./routes/*.js','./models/*.js','./config/*.js','./views/*','./public/*'], //Files to be watched
      tasks: [],
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
  }
});

grunt.registerTask('default', ['express:dev', 'open:dev','watch']);
};
