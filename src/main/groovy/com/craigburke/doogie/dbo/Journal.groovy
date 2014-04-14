package com.craigburke.doogie.dbo

import org.mongodb.morphia.annotations.Entity
import org.mongodb.morphia.annotations.Id
import org.bson.types.ObjectId

@Entity(value = "journal", noClassnameStored = true)
class Journal {

    @Id
    ObjectId id

    String title
    Date date
    String text
    Credits credits
}
