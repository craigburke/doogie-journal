package com.craigburke.doogie

import com.google.inject.AbstractModule
import com.google.inject.Scopes
import twitter4j.Twitter
import twitter4j.TwitterFactory

class DoogieModule extends AbstractModule {

    @Override
    protected void configure() {
        bind(Twitter).toInstance(TwitterFactory.getSingleton())
        bind(JournalService).in(Scopes.SINGLETON)
    }
}
