package com.craigburke.doogie.dbo

import org.mongodb.morphia.annotations.Entity
import org.mongodb.morphia.annotations.Id

@Entity(value = "journal", noClassnameStored = true)
class Journal {

    @Id
    String id

    String title
    Date date
    String text
    Credits credits
}
