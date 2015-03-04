module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['Gruntfile.js', 'aiService.js', 'gameLogic.js', 'game.js']
    },
    uglify: {
      my_target: {
        files: {
          'everything.min.js': ['aiService.js', 'gameLogic.js', 'game.js']
        }
      }
    },
    processhtml: {
      dist: {
        files: {
          'game.min.html': ['game.html']
        }
      }
    },
    'http-server': {
        'dev': {
            // the server root directory
            root: '.',
            port: 9000,
            host: "0.0.0.0",
            cache: 1,
            showDir : true,
            autoIndex: true,
            // server default file extension
            ext: "html",
            // run in parallel with other tasks
            runInBackground: true
        }
    },
    protractor: {
      options: {
        configFile: "protractor.conf.js", // Default config file
        keepAlive: true, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        args: {
          // Arguments passed to the command
        }
      },
      all: {}
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-protractor-coverage');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'uglify', 'processhtml', 'http-server', 'protractor']);

};
