var journalTyping = function(args) {

    var LINE_CHARACTER_MAX = args.lineCharacterMax || 55;
    var PAN_INTERVAL = args.panInterval || 15;
    var PAN_WIDTH = args.panWidth || 150;
    var TYPE_FRAME_INTERVAL = args.typeFrameInterval || 5;
    var LINE_HEIGHT = args.lineHeight || 20;
    var DRAW_WIDTH = args.drawWidth || 600;
    var journal = args.journal;

    var text = [];
    var currentLine = 0;
    var positionOnLine = 0;
    var characterStartTime = 0;
    var position = {x: 0, y: 0};
    var parsingText = false;

    var updatePosition = function() {
        if (currentLine >= text.length) {
            currentLine = text.length - 1;
            positionOnLine = text[text.length - 1].length - 1;
        }

        if (positionOnLine >= text[currentLine].length) {
            positionOnLine = text[currentLine].length - 1;
        }
    };

    var parseText = function() {
        // Break up text into lines based on LINE_CHARACTER_MAX ensuring that words don't get cropped
        parsingText = true;
        text = [];

        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var date = new Date(journal.date);
        var formattedDate = months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();

        var journalText = formattedDate.toUpperCase() + "... " + journal.text.trim();

        var position = 0;

        while (position < journalText.length) {
            var lineText = journalText.substring(position, position + LINE_CHARACTER_MAX);

            var nextCharacter = journalText.substring(position + lineText.length, position + lineText.length + 1);
            var lastSpace = lineText.lastIndexOf(' ');

            if ((text.length === 0) && (lastSpace == formattedDate.length + 3)) {
                // Ignore the initial space on the first line
                lastSpace = -1;
            }

            if (lineText.length === LINE_CHARACTER_MAX && nextCharacter !== " " && lastSpace !== -1) {
                // Breaking up a word, so let's go back
                lineText = journalText.substring(position, position + lastSpace);
            }

            position += lineText.length;
            text.push(lineText.trim());
        }

        updatePosition();
        parsingText = false;
    }

    parseText();


    return {
        typingEnabled: false,
        parseJournalText: function() {
            parseText();
        },
        getCurrentTextLines: function() {
            var value = [];
            var lineText = "";

            for (var i = 0; i <= currentLine; i++) {
                lineText = text[i];

                if (i === currentLine) {
                    lineText = text[currentLine].substring(0, positionOnLine + 1);
                }

                value.push(lineText);
            }

            return value;
        },
        setPosition: function(x, y) {
            position.x = x;
            position.y = y;
        },
        getPosition: function() {
            return {x: position.x, y: position.y};
        },
        getLastCharacterPosition: function(stageWidth) {
            var panCount = Math.floor(positionOnLine / PAN_INTERVAL);

            var x = panCount * (PAN_WIDTH / DRAW_WIDTH * stageWidth) * -1;
            var y = currentLine * LINE_HEIGHT * -1;

            return {x: x, y: y};
        },
        onLastCharacter: function() {
            return (currentLine === text.length - 1 && positionOnLine === text[currentLine].length - 1);
        },
        isReady: function() {
            return !parsingText;
        },
        nextCharacter: function(time) {
            if (this.onLastCharacter()) {
                return;
            }
            var currentCharacterTime = Math.floor(time - characterStartTime);

            if  (currentCharacterTime >= TYPE_FRAME_INTERVAL) {
                positionOnLine++;
                characterStartTime = time;
            }

            if (text[currentLine].length <= positionOnLine) {
                positionOnLine = 0;
                currentLine++;
            }
        }
    }

};