Doogie Howser Journal Generator
===============================
[ ![Codeship Status for craigburke/doogie-journal](https://codeship.com/projects/cfd6a8e0-ba17-0132-5aff-163b0176f676/status?branch=master)](https://codeship.com/projects/71815)

This is a Ratpack / AngularJS application that allows you to make your own Doogie Howser style journals.

[See the live site](http://doogie.craigburke.com)


**Requirements**
  * MongoDB running locally
  * JDK (7 or 8)

Starting the app
----------------

    ./gradlew run

### Twitter setup

In order to get the twitter integration working, you'll need to create an application and generate an access token on [Twitter's development site](https://dev.twitter.com/).

Create a file **src/ratpack/twitter4j.properties** that looks like this:

     oauth.consumerKey=*********************
     oauth.consumerSecret=******************************************
     oauth.accessToken=**************************************************
     oauth.accessTokenSecret=******************************************


Running Tests
-------------

### Spock tests (Groovy)

#### Running the tests
    ./gradlew test

### Jasmine tests (Unit tests)

**Setup**

    npm install -g karma
    npm install -g karma-cli
    npm install

**Running the tests**

    karma start src/test/js/karma.conf.js

### Protractor tests (E2E tests)

**Setup**

    npm install -g protractor
    npm install
    webdriver-manager

    # Download and start selenium
    webdriver-manager update
    webdriver-manager start

See: [Protractor Readme](https://github.com/angular/protractor)

**Running the tests**

Make sure both the app and selenium are running, then type:

    protractor src/test/js/protractor.conf.js
