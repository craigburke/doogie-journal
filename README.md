Doogie Howser Journal Generator
=====

This is a Ratpack / AngularJS application that allows you to make your own Doogie Howser style journals.

[See the live site](http://doogie.interwebs.io)


**Requirements**
  * MongoDB running locally
  * JDK (7 or 8)

**Starting the app**

    ./gradlew run

**Twitter integration**

In order to get the twitter integration working, you'll need to create an application and generate an access token on [Twitter's development site](https://dev.twitter.com/).

Create a file **src/ratpack/twitter4j.properties** that looks like this:

     oauth.consumerKey=*********************
     oauth.consumerSecret=******************************************
     oauth.accessToken=**************************************************
     oauth.accessTokenSecret=******************************************


**Running tests**

Spock tests (Groovy)

    ./gradlew test

Jasmine tests (Javascript). You might need to run npm update if you don't have karma installed.

    karma start src/test/karma/karma.conf.js
