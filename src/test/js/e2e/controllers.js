var JournalPage = function() {
    this.startTypingButton = element(by.id("startTyping"));
    this.options = element(by.id("options"));
    this.previewButton = element(by.id("preview"));
    this.saveButton = element(by.id("save"));
    this.saveTweetButton = element(by.id("saveTweet"));

    this.journalLink = element(by.id("journalLink"));
    this.journalText = element(by.model("journal.text"));
    this.tweet = element(by.model("tweet.id"));

    this.at = function() {
        expect(browser.getCurrentUrl()).toMatch("/#/?");
    };

    this.get = function() {
        browser.get('/');
    };

    this.getJournalText = function() {
        return this.journalText.getAttribute("value");
    }

    this.setTweet = function(tweetUrl) {
        this.tweet.sendKeys(tweetUrl);
    }

};

var ShowPage = function() {
    this.loopAudio = element(by.id("loopAudio"));
    this.typingAudio = element(by.id("typingAudio"));
    this.endAudio = element(by.id("endAudio"));

    this.editButton = element(by.id("edit"));
    this.replayButton = element(by.id("replay"));
    this.createButton = element(by.id("create"));
    this.saveButton = element(by.id("save"));

    this.optionsBox = element(by.id("options"));
    this.instructionsBox = element(by.id("instructions"));
    this.pausedBox = element(by.id("paused"));
    this.journalLink = element(by.id("journalLink"));
    this.doneBox = element(by.id("done"));

    this.get = function(journalId) {
        var url = "/#/show"
        if (journalId) {
            url += "/" + journalId;
        }
        browser.get(url);
    };

    this.at = function() {
        expect(browser.getCurrentUrl()).toMatch(browser.baseUrl + "/#/show");
    };

    this.pressKey = function(key) {
        element(by.id("overlay")).sendKeys(key);
    };

    this.type = function(text) {
        this.pressKey(text);
    }

};

describe('E2E:Controllers', function() {

    var journalId = null;
    var journalText = "Hey what's up?";
    var journalPage = new JournalPage();
    var showPage = new ShowPage();

    beforeEach(function(){
        journalPage.get();
    });

    it("Can save journal", function() {
        journalPage.startTypingButton.click();
        showPage.at();
        expect(showPage.journalLink.isDisplayed()).toBeFalsy();

        showPage.type(journalText);
        showPage.pressKey(protractor.Key.ENTER);
        showPage.saveButton.click();

        expect(showPage.journalLink.isDisplayed()).toBeTruthy();

        showPage.journalLink.evaluate("journalId").then(function(id) {
            journalId = id;
            expect(journalId).not.toBeNull();
        });

    });

    it("Edit options appear only when you go into edit mode", function() {
        expect(journalPage.options.isDisplayed()).toBeFalsy();

        journalPage.startTypingButton.click();
        showPage.at();

        showPage.pressKey(protractor.Key.ENTER);

        showPage.editButton.click();
        journalPage.at();

        expect(journalPage.options.isDisplayed()).toBeTruthy();
    });

    it("Instruction only appear when user is typing", function() {
        showPage.get();
        expect(showPage.instructionsBox.isDisplayed()).toBeTruthy();

        showPage.get(journalId);
        expect(showPage.instructionsBox.isDisplayed()).toBeFalsy();
    });

    it("Can pause and unpause", function() {
        showPage.get(journalId);
        expect(showPage.pausedBox.isDisplayed()).toBeFalsy();

        showPage.pressKey(protractor.Key.ESCAPE);
        expect(showPage.pausedBox.isDisplayed()).toBeTruthy();
        expect(showPage.typingAudio.getAttribute('paused')).toBeTruthy();
        expect(showPage.loopAudio.getAttribute('paused')).toBeFalsy();

        showPage.pressKey(protractor.Key.ESCAPE);
        expect(showPage.pausedBox.isDisplayed()).toBeFalsy();
        expect(showPage.typingAudio.getAttribute('paused')).toBeFalsy();
        expect(showPage.loopAudio.getAttribute('paused')).toBeFalsy();
    });

    it("Can create, edit, preview then save journal", function() {
        journalPage.get();
        expect(journalPage.getJournalText()).not.toBe("FOOBAR");

        journalPage.startTypingButton.click();

        showPage.at();
        showPage.type("FOOBAR");
        showPage.pressKey(protractor.Key.ENTER);
        showPage.editButton.click();

        journalPage.at();
        expect(journalPage.getJournalText()).toBe("FOOBAR");
        journalPage.previewButton.click();

        showPage.at();
        showPage.editButton.click();

        journalPage.at();
        expect(journalPage.journalLink.isDisplayed()).toBeFalsy();
        journalPage.saveButton.click();
        expect(journalPage.journalLink.isDisplayed()).toBeTruthy();
    });

    it("Journal plays all the way through", function() {
        showPage.get(journalId);
        showPage.at();

        browser.wait(function() {
            return showPage.doneBox.isPresent();
        });

        expect(showPage.doneBox.isDisplayed()).toBeTruthy();
    });

    it("Create new button allows existing journal to be edited", function() {
        showPage.get(journalId);

        browser.wait(function() {
            return showPage.doneBox.isPresent();
        });

        showPage.createButton.click();

        journalPage.at();
        expect(journalPage.options.isDisplayed()).toBeTruthy();
        expect(journalPage.getJournalText()).toBe(journalText);
    });

    it("Replay button replays journal from start", function() {
        showPage.get(journalId);

        browser.wait(function() {
            return showPage.doneBox.isPresent();
        });

        showPage.replayButton.click();
        showPage.at();
        expect(showPage.doneBox.isPresent()).toBeFalsy();

        browser.wait(function() {
            return showPage.doneBox.isPresent();
        });

    }, 50000);

    it("Can create journal from tweet and play it back", function() {
        journalPage.get();
        journalPage.setTweet("https://twitter.com/craigburke1/status/456062168547753984");
        journalPage.saveTweetButton.click();

        showPage.at();
        expect(showPage.optionsBox.isDisplayed()).toBeTruthy();

        showPage.saveButton.click();
        expect(showPage.journalLink.isDisplayed()).toBeTruthy();

        showPage.journalLink.click();

        browser.wait(function() {
            return showPage.doneBox.isPresent();
        });

    }, 50000);


});