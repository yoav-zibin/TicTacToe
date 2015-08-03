exports.config = {
  specs: ['ts_output_readonly_do_NOT_change_manually/src/end_to_end_tests.js'],
  allScriptsTimeout: 11000,
  directConnect: true, // only works with Chrome and Firefox
  capabilities: {
    'browserName': 'chrome'
  },
  baseUrl: 'http://localhost:9000/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
