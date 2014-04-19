module.exports = function(config) {
  config.set({
    basePath: '../../',
    frameworks: ['jasmine'],

    files: [
        'ratpack/public/vendor/angularjs/angular.min.js',
        'ratpack/public/vendor/angularjs/angular-route.min.js',
        'ratpack/public/vendor/angularjs/angular-animate.min.js',
        'ratpack/public/vendor/angular-strap/*.js',
        'ratpack/public/vendor/*.js',

        'ratpack/public/scripts/*.js',
        'test/karma/lib/angular-mocks.js',
        'test/karma/lib/jquery-2.1.0.min.js',
        'test/karma/unit/*.js'
    ],

    exclude: [    ],
    preprocessors: { },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false
  });
};
