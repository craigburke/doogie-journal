package com.craigburke.doogie

import com.craigburke.doogie.dbo.Journal
import com.craigburke.doogie.dbo.Credits
import com.google.inject.Inject
import com.mongodb.WriteConcern
import org.mongodb.morphia.Morphia
import org.mongodb.morphia.Datastore
import com.mongodb.Mongo
import org.bson.types.ObjectId

import twitter4j.Twitter

class JournalService {

    private Datastore datastore

    @Inject
    private Twitter twitter

    JournalService() {
        Morphia morphia = new Morphia()
        morphia.mapPackage("com.craigburke.doogie.dbo")

        Mongo mongo = new Mongo()
        datastore = morphia.createDatastore(mongo, "doogie")
    }

    Journal getJournal(def id) {
        return datastore.get(Journal, new ObjectId(id))
    }

    String saveFromTweet(Long tweetId) {
        def tweet = twitter.showStatus(tweetId)

        Journal journal = new Journal(
            title: "Personal Journal of ${tweet.user?.name}",
            date: tweet.createdAt,
            text: tweet.text,
            credits: new Credits(
                person: "@tweet.user?.screenName",
                title: "Executive Producer"
            )
        )

        return saveJournal(journal)
    }

    String saveJournal(Journal journal) {
        datastore.save(journal, WriteConcern.SAFE)
        return journal.id.toString()
    }






}
