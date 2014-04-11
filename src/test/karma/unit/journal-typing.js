describe('Journal Typing', function() {

    var typingState;
    var LINE_CHARACTER_MAX = 60;
    var TYPING_FRAME_INTERVAL = 150;
    var journalDate = (new Date()).setFullYear(2014,0,1);

    var journal = {
        title: "Personal Journal of Doogie Howser M.D.",
        date: journalDate,
        text: "FOO",
        credits: {
            person: "Craig Burke",
            title: "Executive Producer"
        }
    };

    var moveToLastCharacter = function(currentCharacter) {
        while (!typingState.onLastCharacter()) {
            typingState.nextCharacter(TYPING_FRAME_INTERVAL * currentCharacter);
            currentCharacter++;
        }
    }


    beforeEach(function() {

        typingState = journalTyping({
           journal: journal,
           lineCharacterMax: LINE_CHARACTER_MAX,
           panInterval: 15,
           panWidth: 150,
           typeFrameInterval: TYPING_FRAME_INTERVAL,
           lineHeight: 20,
           drawWidth: 600
        });

    });

    it('nextCharacter changes currentTextLines', function() {
        expect(typingState.getCurrentTextLines()[0]).toEqual('J');

        typingState.nextCharacter(TYPING_FRAME_INTERVAL);
        expect(typingState.getCurrentTextLines()[0]).toEqual('JA');

        var expectedText = "JANUARY 1, 2014... FOO";
        moveToLastCharacter(2);

        expect(typingState.getCurrentTextLines()[0]).toEqual(expectedText);
    });

    it('journal text updates are reflected after parse', function() {
        var initialText = "JANUARY 1, 2014... FOO";
        moveToLastCharacter(1);
        expect(typingState.getCurrentTextLines()[0]).toEqual(initialText);

        journal.text = "FOOBAR";
        typingState.parseJournalText();
        moveToLastCharacter(initialText.length);

        var updatedText = "JANUARY 1, 2014... FOOBAR";
        expect(typingState.getCurrentTextLines()[0]).toEqual(updatedText);

    });


    it('can handle long unbroken text', function() {
        var longText = ""
        for (i = 0; i < LINE_CHARACTER_MAX; i++) {
            longText += "A";
        }

        journal.text = longText;
        typingState.parseJournalText();

        moveToLastCharacter(1);
        var expectedFirstLine = "JANUARY 1, 2014... ";
        for (i = expectedFirstLine.length; i < LINE_CHARACTER_MAX; i++) {
            expectedFirstLine += "A";
        }

        expect(typingState.getCurrentTextLines()[0]).toEqual(expectedFirstLine);

    });

    it('make sure words do not get cut off if we can avoid it', function() {
        var dateText = "JANUARY 1, 2014... ";

        var firstWord = "";
        for (i = 0; i < (LINE_CHARACTER_MAX - dateText.length - 3); i++) {
            firstWord += "A";
        }

        var text = firstWord + " BBBBBBBBBBB";

        journal.text = text;
        typingState.parseJournalText();
        moveToLastCharacter(1);

        var expectedText = "JANUARY 1, 2014... " + firstWord;

        expect(typingState.getCurrentTextLines()[0]).toEqual(expectedText);

    });

});