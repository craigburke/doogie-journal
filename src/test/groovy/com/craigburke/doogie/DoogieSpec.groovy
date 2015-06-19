package com.craigburke.doogie

import com.craigburke.doogie.dbo.Credits
import com.craigburke.doogie.dbo.Journal
import ratpack.groovy.test.GroovyRatpackMainApplicationUnderTest
import ratpack.test.http.TestHttpClient
import ratpack.test.ServerBackedApplicationUnderTest

import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import spock.lang.Specification
import spock.lang.Shared
import io.interwebs.doogie.dbo.*

class DoogieSpec extends Specification {

    ServerBackedApplicationUnderTest aut = new GroovyRatpackMainApplicationUnderTest()
    @Delegate TestHttpClient client = TestHttpClient.testHttpClient(aut)

    @Shared String journalId
	@Shared def json = new JsonSlurper()


    def "Check Site Index"() {
        when:
        get("")

        then:
        response.statusCode == 200
        response.body.text.contains('<title>Doogie Howser Journal Generator</title>')
    }

    def "Show Journal Page"() {
        when:
        get("index.html/#/show")

        then:
        response.statusCode == 200
        response.body.text.contains('<title>Doogie Howser Journal Generator</title>')

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

		requestSpec {
			it.body.type("application/json")
			it.body.text(JsonOutput.toJson(journal))
		}
		
        post("journal")
		
		def jsonResponse = json.parseText(response.body.text)
		journalId = jsonResponse.id

		then:
        journalId != null
		
    }

    def "Load the Journal"() {
        when:
        get("journal/${journalId}")

		def jsonResponse = json.parseText(response.body.text)
		
        then:		
        jsonResponse.title == "Journal Test"
    }

    def "Load an invalid Journal"() {
        when:
        get("journal/ABC123")

        then:
        response.statusCode == 500
    }

    def "Create a journal from tweet"() {
        when:
        get("journal/tweet/456062168547753984")
		def jsonResponse = json.parseText(response.body.text)
		
        then:
       	jsonResponse.title == "Personal Journal of Craig Burke"
        jsonResponse.text == "This is the dumbest and most amazing thing I\u2019ve ever built. #ratpack #groovylang #angularjs #doogie #internets http://t.co/BXJHFZcchQ"
    }

}