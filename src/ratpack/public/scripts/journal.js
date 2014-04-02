var JOURNAL_STATE = {
    INIT: 0,
    PLAYING: 1,
    PAUSED: 2,
    CREDITS: 3,
    DONE: 4
};

var journalAnimation = function(args) {

    var journal = args.journal;
    var onStateChange = args.onStateChange;
    var containerId = args.containerId || "container";
    var loopAudio = document.getElementById(args.loopAudioId || "loopAudio");
    var endAudio =  document.getElementById(args.endAudioId || "endAudio");

    var state = {
        current: JOURNAL_STATE.INIT,
        previous: null
    };

    var CONST = {
        DRAW_WIDTH : 600,
        TYPE_FRAME_INTERVAL : 250, // How many milliseconds between typing each letter
        PAN_DURATION : 2,
        LINE_HEIGHT : 20,
        LINE_CHARACTER_MAX : 55,
        PAN_INTERVAL : 15, // number of characters typed before panning
        PAN_WIDTH : 150,
        TOP_OFFSET : 45,
        LEFT_OFFSET : 50,

        JOURNAL : {
            FONT_FAMILY : "DOS",
            FONT_SIZE : 15
        },
        CREDITS: {
            FONT_FAMILY : "TSISQUILISDA",
            TITLE_FONT_SIZE : 25,
            PERSON_FONT_SIZE: 50
        },
        HEADER: {
            TOP_OFFSET: 20,
            BACKGROUND_COLOR: "#2FDEC1"
        },

        BACKGROUND : {
            GRADIENT_STOPS : [0, '#7C7CAA',.5, '#4343AD', 1, '#202052']
        }

    };

    var canvas = {
        stage: null,
        backgroundLayer: new Kinetic.Layer(),
        headerLayer: new Kinetic.Layer(),
        journalTextLayer: new Kinetic.Layer(),
        scanLinesLayer: new Kinetic.Layer(),
        endingLayer: new Kinetic.Layer(),
        creditsTextLayer: new Kinetic.Layer({ opacity: 0 })
    };

    var typing = (function() {
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


        return {
            typingEnabled: false,
            updateJournal: function(journal) {
                // Break up text into lines based on LINE_CHARACTER_MAX ensuring that words don't get cropped
                parsingText = true;
                text = [];

                var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                var date = new Date(journal.date);
                var formattedDate = months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();

                var journalText = formattedDate.toUpperCase() + "... " + journal.text;

                var position = 0;
                while (position < journalText.length) {
                    var lineText = journalText.substring(position, position + CONST.LINE_CHARACTER_MAX);
                    var nextCharacter = journalText.substring(position + lineText.length, position + lineText.length + 1);
                    var lastSpace = lineText.lastIndexOf(' ');

                    if (lineText.length === CONST.LINE_CHARACTER_MAX && nextCharacter !== " " && lastSpace !== -1) {
                        // Breaking up a word, so let's go back
                        lineText = journalText.substring(position, position + lastSpace);
                    }

                    position += lineText.length;
                    text.push(lineText.trim());
                }

                updatePosition();
                parsingText = false;
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
                var panCount = Math.floor(positionOnLine / CONST.PAN_INTERVAL);

                var x = panCount * (CONST.PAN_WIDTH / CONST.DRAW_WIDTH * stageWidth) * -1;
                var y = currentLine * CONST.LINE_HEIGHT * -1;

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

                if  (currentCharacterTime >= CONST.TYPE_FRAME_INTERVAL) {
                    positionOnLine++;
                    characterStartTime = time;
                }

                if (text[currentLine].length <= positionOnLine) {
                    positionOnLine = 0;
                    currentLine++;
                }
            }
        }

    }());

    function animateJournal() {
        var typingAnimation = new Kinetic.Animation(function(frame) {
            if (typing.onLastCharacter() && !typing.typingEnabled) {
                loopAudio.loop = false;
            }
            else {
                if (state.current == JOURNAL_STATE.PLAYING && typing.isReady() && !typing.onLastCharacter()) {
                    renderText();
                    typing.nextCharacter(frame.time);
                }
            }

            if (loopAudio.ended) {
                typingAnimation.stop();
                setState(JOURNAL_STATE.CREDITS);
                renderCredits();
            }


        }, canvas.journalTextLayer);

        typingAnimation.start();
    }

    function setState(value) {
        if (state.current !== value) {
            state.previous = state.current;
            state.current = value;
            if (onStateChange) {
                onStateChange(state.previous, state.current);
            }
        }
    }

    function renderScanLines() {
        canvas.scanLinesLayer.removeChildren();

        for (var i = 0; i <= canvas.stage.getHeight(); i += 1) {
            canvas.scanLinesLayer.add(
                new Kinetic.Line(
                    {
                        points: [[0, i], [CONST.DRAW_WIDTH, i]],
                        stroke: "black",
                        strokeWidth: .025,
                        opacity:.8
                    }
                )
            );

        }
        canvas.stage.add(canvas.scanLinesLayer);
    }


    function renderText() {
        canvas.journalTextLayer.removeChildren();

        var textLines = typing.getCurrentTextLines();

        textLines.forEach(function(line, index) {
            canvas.journalTextLayer.add(new Kinetic.Text({
                fontFamily: CONST.JOURNAL.FONT_FAMILY,
                fontSize: CONST.JOURNAL.FONT_SIZE,
                fill: "#FFFFFF",
                text: line,
                x: CONST.LEFT_OFFSET,
                y: CONST.TOP_OFFSET + ((index + 1) * CONST.LINE_HEIGHT)
            }));
        });

        canvas.journalTextLayer.draw();
        panCanvas();
    }


    function panCanvas() {
        var newPosition = typing.getLastCharacterPosition(canvas.stage.getWidth());
        var currentPosition = typing.getPosition();


        if (currentPosition.x != newPosition.x || currentPosition.y != newPosition.y) {
            var tween = new Kinetic.Tween({
                node: canvas.stage,
                x: newPosition.x,
                y: newPosition.y,
                duration: CONST.PAN_DURATION,
                easing: Kinetic.Easings.StrongEaseOut
            });

            tween.play();
            typing.setPosition(newPosition.x, newPosition.y);
        }
    }


    function renderBackground() {
        canvas.backgroundLayer.removeChildren();

        var x = CONST.DRAW_WIDTH / 2;
        var y = x;

        var rectBack = new Kinetic.Rect({
            x: 0,
            y: 0,
            width: CONST.DRAW_WIDTH,
            height: CONST.DRAW_WIDTH,
            fillRadialGradientStartPoint: [x, y],
            fillRadialGradientStartRadius: 1,

            fillRadialGradientEndPoint: [x, y],
            fillRadialGradientEndRadius: CONST.DRAW_WIDTH,

            fillRadialGradientColorStops: CONST.BACKGROUND.GRADIENT_STOPS
        });

        canvas.backgroundLayer.add(rectBack);
        canvas.stage.add(canvas.backgroundLayer);
    }


    function renderHeader(journalTitle) {
        canvas.headerLayer.removeChildren();

        // double lines
        var line1Offset = CONST.HEADER.TOP_OFFSET + 9;

        var line1 = new Kinetic.Line({
            points: [[0, line1Offset], [CONST.DRAW_WIDTH, line1Offset]],
            stroke: "#FFFFFF",
            strokeWidth:.8
        });

        var line2Offset = CONST.HEADER.TOP_OFFSET + 14;
        var line2 = new Kinetic.Line({
            points: [[0, line2Offset], [CONST.DRAW_WIDTH, line2Offset]],
            stroke: "#FFFFFF",
            strokeWidth:.8
        });

        canvas.headerLayer.add(line1);
        canvas.headerLayer.add(line2);

        // header box with 2 character padding on either side

        var title = journalTitle.toUpperCase();

        var headerText = new Kinetic.Text({
            fontFamily: CONST.JOURNAL.FONT_FAMILY,
            fontSize: CONST.JOURNAL.FONT_SIZE,
            fill: "#FFFFFF",
            text: title,
            align: 'center'
        });

        var boxWidth = headerText.getTextWidth() + 20;
        var startXPosition = (CONST.DRAW_WIDTH - boxWidth) / 2;

        canvas.headerLayer.add(
            new Kinetic.Rect({
                x: startXPosition - 8,
                y: CONST.HEADER.TOP_OFFSET + 4,
                width: boxWidth,
                height: 20,
                fill: "black"
            })
        );

        canvas.headerLayer.add(
            new Kinetic.Rect({
                x: startXPosition,
                y: CONST.HEADER.TOP_OFFSET,
                width: boxWidth,
                height: 20,
                fill: CONST.HEADER.BACKGROUND_COLOR
            })
        );

        headerText.setPosition(startXPosition, CONST.HEADER.TOP_OFFSET + 3);
        headerText.setWidth(boxWidth);

        canvas.headerLayer.add(headerText);
        canvas.stage.add(canvas.headerLayer);
    }


    function renderCredits() {
        canvas.endingLayer.removeChildren();

        endAudio.play();

        var blackRect = new Kinetic.Rect({
            fill: 'black',
            width: canvas.stage.getWidth(),
            height: canvas.stage.getHeight(),
            opacity: 0
        });
        canvas.endingLayer.add(blackRect);
        canvas.stage.add(canvas.endingLayer);

        // Fade to black
        var tween = new Kinetic.Tween({
            node: blackRect,
            duration: 2,
            opacity: 1,
            onFinish: function() {
                showCredits();
            }
        });
        tween.play();
    }

    function showCredits() {
        canvas.creditsTextLayer.removeChildren();

        canvas.stage.setScale(1, 1);
        canvas.stage.setPosition(0, 0);

        var titleText = new Kinetic.Text({
            fontFamily: CONST.CREDITS.FONT_FAMILY,
            fontSize: CONST.CREDITS.TITLE_FONT_SIZE,
            fill: 'white',
            width: canvas.stage.getWidth(),
            text: journal.credits.title,
            align: 'center'
        });

        var personText = new Kinetic.Text({
            fontFamily: CONST.CREDITS.FONT_FAMILY,
            fontSize: CONST.CREDITS.PERSON_FONT_SIZE,
            fill: 'white',
            width: canvas.stage.getWidth(),
            text: journal.credits.person.toUpperCase(),
            align: 'center'
        });

        var creditHeight = titleText.getHeight() + personText.getHeight();
        var y = Math.floor((canvas.stage.getHeight() - creditHeight) / 2);

        titleText.setY(y);
        personText.setY(y + titleText.getHeight());

        canvas.creditsTextLayer.add(titleText);
        canvas.creditsTextLayer.add(personText);
        canvas.stage.add(canvas.creditsTextLayer);

        // Fade credits out
        var tween = new Kinetic.Tween({
            node: canvas.creditsTextLayer,
            opacity: 1,
            duration: 2,
            onFinish: function() {
                setTimeout(function() {
                    tween.reverse();
                    setState(JOURNAL_STATE.DONE);
                }, 2000);
            }
        });

        tween.play();
    }

    return {
        play: function (typingEnabled) {
            if (state.current !== JOURNAL_STATE.INIT) {
                return;
            }

            typing.typingEnabled = typingEnabled;
            loopAudio.play();

            setState(JOURNAL_STATE.PLAYING);

            var zoom = (window.innerWidth / CONST.DRAW_WIDTH) * 2;
            canvas.stage = new Kinetic.Stage({
                container: containerId,
                width: window.innerWidth,
                height: window.innerHeight,
                scaleX: zoom,
                scaleY: zoom
            });

            renderBackground();
            renderHeader(journal.title);

            typing.updateJournal(journal);

            canvas.journalTextLayer = new Kinetic.Layer({
                width: canvas.stage.getWidth(),
                height: canvas.stage.getHeight()
            });

            canvas.stage.add(canvas.journalTextLayer);
            renderScanLines();
            animateJournal();
        },
        finish: function() {
            if (state.current !== JOURNAL_STATE.PLAYING) {
                return;
            }

            typing.typingEnabled = false;
        },
        updateJournalText: function(text) {
            if (typing.typingEnabled) {
                journal.text = text;
                typing.updateJournal(journal);
                renderText();
            }
        },
        togglePause: function() {
            if (state.current === JOURNAL_STATE.PAUSED) {
                setState(state.previous);
            }
            else {
                setState(JOURNAL_STATE.PAUSED);
            }
        }
    }
};