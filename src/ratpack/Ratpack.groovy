import com.craigburke.doogie.JournalService
import com.craigburke.doogie.dbo.Journal
import ratpack.jackson.JacksonModule

import static ratpack.groovy.Groovy.ratpack
import static ratpack.jackson.Jackson.fromJson
import static ratpack.jackson.Jackson.json

ratpack {
    modules {
        register new JacksonModule()
    }

    handlers { JournalService service ->
        prefix('journal') {

            get(":id") {
                background {
                    service.getJournal(pathTokens.id)
                } then { Journal journal ->
                    render json(journal)
                }
            }

            post {
                Journal journal = parse fromJson(Journal)
                background {
                    service.saveJournal(journal)
                } then { String id ->
                    render json(id: id)
                }
            }

        }

        assets "public", "index.html"
    }
}
    