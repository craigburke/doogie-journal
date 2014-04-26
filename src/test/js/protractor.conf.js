// An example configuration file.
exports.config = {

  seleniumAddress: 'http://localhost:4444/wd/hub',

  capabilities: {
    'browserName': 'chrome'
  },

  specs: ['e2e/*.js'],

  baseUrl: 'http://localhost:5050'
};
