import io.interwebs.doogie.JournalService
import io.interwebs.doogie.dbo.Journal
import ratpack.jackson.JacksonModule

import static ratpack.groovy.Groovy.ratpack
import static ratpack.jackson.Jackson.fromJson
import static ratpack.jackson.Jackson.json

import io.interwebs.doogie.DoogieModule

ratpack {
    bindings {
        add new JacksonModule()
        add new DoogieModule()
    }

    handlers { JournalService service ->
        prefix('journal') {

            get(":id") {
                blocking {
                    service.getJournal(pathTokens.id)
                } then { Journal journal ->
                    render json(journal)
                }
            }

            get("tweet/:id") {
                def tweetId = pathTokens.asLong("id")
                blocking {
                    service.journalFromTweet(tweetId)
                } then { Journal journal ->
                    render json(journal)
                }
            }

            post {
                Journal journal = parse fromJson(Journal)
                blocking {
                    service.saveJournal(journal)
                } then { String id ->
                    render json(id: id)
                }
            }

        }

        assets "public", "index.html"
    }
}
    
