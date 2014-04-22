package com.craigburke.doogie

import com.google.inject.AbstractModule

import twitter4j.Twitter
import twitter4j.TwitterFactory

class TwitterModule extends AbstractModule {

    @Override
    protected void configure() {
        bind(Twitter).toInstance(TwitterFactory.getSingleton())
    }
}
