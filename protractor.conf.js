exports.config = {
  specs: ['ts_output_readonly_do_NOT_change_manually/src/end_to_end_tests.js'],
  allScriptsTimeout: 11000,
  // TODO: test Safari&Chrome incognito and offline mode.
  multiCapabilities: [{
    'browserName': 'firefox'
  }, {
    'browserName': 'safari'
  }, {
    'browserName': 'chrome',
    // See: https://sites.google.com/a/chromium.org/chromedriver/mobile-emulation
    'chromeOptions': {
      // iPhone4 size (320x480) is the smallest size we support.
      "mobileEmulation": { "deviceName": "Apple iPhone 4" },
    },
  }],
  baseUrl: 'http://localhost:9000/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
