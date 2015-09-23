module.exports = function(config) {
  config.set({

    basePath : './',

    files : [
      'http://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular.js',
      'http://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular-touch.js',
      'http://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.12.1/ui-bootstrap-tpls.js',
      'http://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular-mocks.js',
      'ts_output_readonly_do_NOT_change_manually/src/gameLogic.js',
      'ts_output_readonly_do_NOT_change_manually/src/game.js',
      'ts_output_readonly_do_NOT_change_manually/src/aiService.js',
      'http://yoav-zibin.github.io/emulator/dist/turnBasedServices.3.js',
      'ts_output_readonly_do_NOT_change_manually/src/gameLogic_test.js',
      'ts_output_readonly_do_NOT_change_manually/src/aiService_test.js'
    ],

    reporters: ['progress', 'coverage'],

    preprocessors: {
      // Source files, that you wanna generate coverage for.
      // (these files will be instrumented by Istanbul)
      // Do not include tests or libraries.
      'ts_output_readonly_do_NOT_change_manually/src/gameLogic.js': ['coverage']
    },

    // optionally, configure the reporter
    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    },

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-jasmine',
            'karma-coverage'
            ]

  });
};
