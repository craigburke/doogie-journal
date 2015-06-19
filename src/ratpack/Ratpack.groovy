import asset.pipeline.ratpack.AssetPipelineHandler
import asset.pipeline.ratpack.AssetPipelineModule
import com.craigburke.doogie.JournalService
import com.craigburke.doogie.dbo.Journal
import ratpack.jackson.JacksonModule

import static ratpack.groovy.Groovy.ratpack
import static ratpack.jackson.Jackson.fromJson
import static ratpack.jackson.Jackson.json

import com.craigburke.doogie.DoogieModule

ratpack {
    bindings {
        module new JacksonModule()
        module new DoogieModule()
        module new AssetPipelineModule()
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

        handler new AssetPipelineHandler("/")
    }
}
    
