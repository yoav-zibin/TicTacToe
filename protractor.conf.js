exports.config = {
  specs: ['ts_output_readonly_do_NOT_change_manually/src/end_to_end_tests.js'],
  allScriptsTimeout: 11000,
  directConnect: true, // only works with Chrome and Firefox
  capabilities: {
    'browserName': 'chrome',
    "loggingPrefs": {"driver": "INFO", "server": "OFF", "browser": "WARNING"}
  },
  baseUrl: 'http://localhost:9000/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  },
  onPrepare: function () {
    console.log('jasmine-version:' + jasmine.version ? jasmine.version : jasmine.getEnv().versionString());
    var originalAddExpectationResult = jasmine.Spec.prototype.addExpectationResult;
    jasmine.Spec.prototype.addExpectationResult = function() {
      if (!arguments[0]) {
        console.log(this.description, arguments[1].message, this);
        browser.pause();
      }
      return originalAddExpectationResult.apply(this, arguments);
    };
    jasmine.getEnv().addReporter(new function() {
      this.specDone = function(spec) {
        if (spec.failedExpectations.length > 0) {
          for (var i = 0; i < spec.failedExpectations.length; i++) {
            console.error(spec.failedExpectations[i].message);
            console.error(spec.failedExpectations[i].stack);
          }
          browser.pause();
        }
      };
    });
  }
};
