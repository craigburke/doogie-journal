Doogie Howser Journal Generator
=====

This is a Ratpack / AngularJS application that allows you to make your own Doogie Howser style journals.

[See the live site](doogie.interwebs.io)


**Requirements**
  * MongoDB running locally
  * JDK (7 or 8)

**Starting the app**
  
    ./gradlew run

**Running tests**

Spock tests (Groovy)

    ./gradlew test

Karma tests (Javascript). You might need to run npm update if you don't have karma installed.
    
    karma start src/test/karma/karma.conf.js 
