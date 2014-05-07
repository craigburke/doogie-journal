var JOURNAL_STATE = {
    INIT: 0,
    PLAYING: 1,
    CREDITS: 2,
    DONE: 3
};

var journalAnimation = function(args) {

    var journal = args.journal;

    var onStateChange = args.onStateChange;
    var containerId = args.containerId || "container";

    var loopAudio = document.getElementById(args.loopAudioId || "loopAudio");
    var endAudio =  document.getElementById(args.endAudioId || "endAudio");
    var typingAudio = document.getElementById(args.typingAudioId || "typingAudio");

    var CONST = {
        DRAW_WIDTH : 600,
        PAN_DURATION :.8,
        LINE_HEIGHT : 20,
        TOP_OFFSET : 45,
        LEFT_OFFSET : 50,

        JOURNAL : {
            FONT_FAMILY : "DOS",
            FONT_SIZE : 15
        },
        CREDITS: {
            TRANSITION_TIME: 2000,
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

    var state = {
        current: JOURNAL_STATE.INIT,
        previous: null
    };

    var typing = journalTyping({
        journal: journal,
        lineCharacterMax: 55,
        panInterval: 15,
        panWidth: 100,
        minTypingDelay: 200,
        maxTypingDelay: 350,
        lineHeight: CONST.LINE_HEIGHT,
        drawWidth: CONST.DRAW_WIDTH
    });

    var canvas = {
        zoom: 1,
        stage: null,
        backgroundLayer: new Kinetic.Layer(),
        headerLayer: new Kinetic.Layer(),
        journalTextLayer: new Kinetic.Layer(),
        scanLinesLayer: new Kinetic.Layer(),
        endingLayer: new Kinetic.Layer(),
        creditsTextLayer: new Kinetic.Layer({ opacity: 0 })
    };

    var animation = {
        creditsFade: null,
        typing: null
    };

    var transition = {
        loopAudioFadeOut: null,
        creditsFadeOut: null
    };

    function startTypingAnimation() {
        animation.typing = new Kinetic.Animation(function(frame) {

            if (typing.done() && !typing.typingEnabled) {
                animation.typing.stop();
                transitionToCredits();
            }
            else {
                if (state.current == JOURNAL_STATE.PLAYING && typing.isReady() && !typing.done()) {
                    if (typing.nextCharacter(frame.time)) {
                       renderText();
                    }
                }
            }
        }, canvas.journalTextLayer);

        animation.typing.start();
    }


    function transitionToCredits() {
        typingAudio.pause();

        var volumeDelta = .1;
        var intervalTime = Math.floor(CONST.CREDITS.TRANSITION_TIME / (volumeDelta * 100));
        var currentVolume = loopAudio.volume;

        transition.loopAudioFadeOut = setInterval(function() {
            if (currentVolume > 0) {
                var volume = currentVolume - volumeDelta;
                currentVolume = volume.toPrecision(2);
                loopAudio.volume = currentVolume;
            }
            else {
                clearInterval(transition.loopAudioFadeOut);
                loopAudio.pause();
                setState(JOURNAL_STATE.CREDITS);
                renderCredits();
            }
        }, intervalTime);

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

        for (var i = 0; i <= canvas.stage.getHeight(); i += 1.1) {
            canvas.scanLinesLayer.add(
                new Kinetic.Line(
                    {
                        points: [[0, i], [CONST.DRAW_WIDTH, i]],
                        stroke: "black",
                        strokeWidth: 1,
                        opacity: .15
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

            var textLine = new Kinetic.Text({
                fontFamily: CONST.JOURNAL.FONT_FAMILY,
                fontSize: CONST.JOURNAL.FONT_SIZE,
                fill: "#FFFFFF",
                text: line,
                x: CONST.LEFT_OFFSET,
                y: CONST.TOP_OFFSET + ((index + 1) * CONST.LINE_HEIGHT)
            });

            canvas.journalTextLayer.add(textLine);
        });


        canvas.journalTextLayer.draw();
        panCanvas();
    }


    function panCanvas() {
        var newPosition = typing.getLastCharacterPosition();
        var currentPosition = typing.getPosition();

        if (currentPosition.x != newPosition.x || currentPosition.y != newPosition.y) {
            var tween = new Kinetic.Tween({
                node: canvas.stage,
                x: (newPosition.x * canvas.zoom),
                y: (newPosition.y * canvas.zoom),
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


    function renderHeader() {
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

        var title = journal.title.toUpperCase();

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
        if (animation.creditsFade) {
            animation.creditsFade.stop();
        }

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
        animation.creditsFade = new Kinetic.Tween({
            node: blackRect,
            duration: 2,
            opacity: 1,
            onFinish: function() {
                showCredits();
            }
        });
        animation.creditsFade.play();
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
        animation.creditsFade = new Kinetic.Tween({
            node: canvas.creditsTextLayer,
            opacity: 1,
            duration: 2,
            onFinish: function() {
                transition.fadeOut = setTimeout(function() {
                    animation.creditsFade.reverse();
                    setState(JOURNAL_STATE.DONE);
                }, 2000);
            }
        });

        animation.creditsFade.play();
    }

    function renderAll() {
        canvas.zoom = (window.innerWidth / CONST.DRAW_WIDTH) * 2;
        canvas.stage = new Kinetic.Stage({
            container: containerId,
            width: window.innerWidth,
            height: window.innerHeight,
            scaleX: canvas.zoom,
            scaleY: canvas.zoom
        });

        if (state.current === JOURNAL_STATE.PLAYING) {
            renderBackground();
            renderHeader();

            canvas.journalTextLayer = new Kinetic.Layer({
                width: canvas.stage.getWidth(),
                height: canvas.stage.getHeight()
            });

            canvas.stage.add(canvas.journalTextLayer);
            renderScanLines();
            renderText();
        }
        else if (state.current === JOURNAL_STATE.CREDITS) {
            renderCredits();
        }

    }


    function resetAudioState() {

        var resetAudio = function(audio, play) {
            audio.volume = 1;

            if (audio.readyState > 0) {
                audio.currentTime = 0;

                if (play) {
                    audio.play();
                }

            }
            else if (play) {
                audio.oncanplaythrough = function() { audio.play(); };
            }
        };

        resetAudio(loopAudio, true);
        resetAudio(typingAudio, !typing.typingEnabled);
        resetAudio(endAudio, false);
    }


    return {
        play: function (typingEnabled) {
            if (state.current !== JOURNAL_STATE.INIT) {
                return;
            }

            typing.typingEnabled = typingEnabled;

            resetAudioState();
            setState(JOURNAL_STATE.PLAYING);

            renderAll();
            startTypingAnimation();
        },
        finish: function() {
            if (state.current !== JOURNAL_STATE.PLAYING) {
                return;
            }

            typing.typingEnabled = false;
        },
        stop: function() {
            if (transition.loopAudioFadeOut) {
                clearInterval(transition.loopAudioFadeOut);
            }

            if (transition.creditsFadeOut) {
                clearInterval(transition.creditsFadeOut);
            }

            animation.typing.stop();

            if (animation.creditsFade) {
                animation.creditsFade.destroy();
            }

            loopAudio.pause();
            typingAudio.pause();
            endAudio.pause();

            canvas.stage.destroy();
        },
        rerender: function() {
            renderAll();
        },
        updateJournalText: function(text) {
            if (typing.typingEnabled) {
                journal.text = text;
                typing.parseJournalText();
                renderText();
            }
        }
    }
};