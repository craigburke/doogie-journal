
import ratpack.jackson.JacksonModule

import static ratpack.groovy.Groovy.*
import static ratpack.jackson.Jackson.json
import static ratpack.jackson.Jackson.fromJson

import com.craigburke.doogie.dbo.Journal

import com.craigburke.doogie.JournalService

ratpack {
    modules {
        register new JacksonModule()
    }

    handlers { JournalService service ->
        prefix('journal') {

            get(":id") {
                Journal journal = service.getJournal(pathTokens.id)
                render json(journal)
            }

            post {
                Journal journal = parse fromJson(Journal)
                String id = service.saveJournal(journal)
                render json(id: id)
            }

        }

        assets "public", "index.html"
    }
}
