module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      my_target: {
        files: {
          'everything.min.js': ['aiService.js', 'gameLogic.js', 'game.js']
        }
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-protractor-coverage');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);

};