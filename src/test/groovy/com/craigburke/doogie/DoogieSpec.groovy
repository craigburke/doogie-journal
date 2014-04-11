package com.craigburke.doogie

import ratpack.groovy.test.LocalScriptApplicationUnderTest
import ratpack.groovy.test.TestHttpClient
import ratpack.groovy.test.TestHttpClients
import spock.lang.Specification
import spock.lang.Shared
import com.craigburke.doogie.dbo.*


class DoogieSpec extends Specification {

    LocalScriptApplicationUnderTest aut = new LocalScriptApplicationUnderTest()
    @Delegate TestHttpClient client = TestHttpClients.testHttpClient(aut)

    @Shared String journalId

    def "Check Site Index"() {
        when:
        get("")

        then:
        response.statusCode == 200
        response.body.asString().contains('<title>Doogie Howser Journal Generator</title>')
    }

    def "Show Journal Page"() {
        when:
        get("#/show")

        then:
        response.statusCode == 200
        response.body.asString().contains('<title>Doogie Howser Journal Generator</title>')

    }

    def "Save journal"() {
        when:

        def journal = new Journal(
                title: "Journal Test",
                date: new Date(),
                text: "FOO",
                credits: new Credits(
                        person: "Craig Burke",
                        title: "Awesome Guy"
                )
        )

        request.contentType("application/json").body(journal)
        post("journal")

        journalId = response.jsonPath().get("id")

        then:
        journalId != null
    }

    def "Load the Journal"() {
        when:
        get("journal/${journalId}")

        then:
        with(response.jsonPath()) {
            get("title") == "Journal Test"
        }

    }

    def "Load an invalid Journal"() {
        when:
        get("journal/ABC123")

        then:
        response.statusCode == 500
    }



}