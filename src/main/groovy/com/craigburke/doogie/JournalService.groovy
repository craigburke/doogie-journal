package com.craigburke.doogie

import com.craigburke.doogie.dbo.Journal
import com.mongodb.WriteConcern
import org.mongodb.morphia.Morphia
import org.mongodb.morphia.Datastore
import com.mongodb.Mongo
import org.bson.types.ObjectId

class JournalService {

    private Datastore datastore

    JournalService() {
        Morphia morphia = new Morphia()
        morphia.mapPackage("com.craigburke.doogie.dbo")

        Mongo mongo = new Mongo()
        datastore = morphia.createDatastore(mongo, "doogie")
    }

    Journal getJournal(def id) {
        return datastore.get(Journal, new ObjectId(id))
    }

    String saveJournal(Journal journal) {
        datastore.save(journal, WriteConcern.SAFE)
        return journal.id.toString()
    }




}
