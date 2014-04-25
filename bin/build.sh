#/bin/bash

# Twitter 
cat << EOF > ../src/ratpack/twitter4j.properties
	oauth.consumerKey=$TWITTER_CONSUMER_KEY
	oauth.consumerSecret=$TWITTER_CONSUMER_SECRET
	oauth.accessToken=$TWITTER_ACCESS_TOKEN
	oauth.accessTokenSecret=$TWITTER_ACCESS_TOKEN_SECRET
EOF

# Karma tests
sudo npm install -g karma
sudo npm install -g karma-cli
sudo npm install --save-dev
sudo start xvfb
karma start src/test/karma/karma.conf.js --single-run

# Groovy tests
./gradlew test

# Build
./gradlew installApp
