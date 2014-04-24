
describe('Journal', function() {

    jasmine.DEFAULT_TIMEOUT_INTERVAL=10000;

    var animation;
    var currentState;
    var onStateChange;

    var journal = {
        title: "Personal Journal of Doogie Howser M.D.",
        date: new Date(),
        text: "",
        credits: {
            person: "Craig Burke",
            title: "Executive Producer"
        }
    };

    beforeEach(function() {
        var container = $('body').append("<div id='container' />");
        $(container).append('<div id="canvas" />');
        $(container).append('<audio id="loopAudio" />');
        $(container).append('<audio id="endAudio" />');
        $(container).append('<audio id="typingAudio" />');


        animation = journalAnimation({
                journal: journal,
                containerId: 'canvas',
                loopAudioId: 'loopAudio',
                endAudioId: 'endAudio',
                typingAudioId: 'typingAudio',
                onStateChange: function(oldState, newState) {
                    currentState = newState;
                    if (onStateChange) {
                        onStateChange(oldState, newState);
                    }
                }
        });
    });

    afterEach(function() {
        $("#container").remove();
        onStateChange = null;
    });

    it('start journal and state should be PLAYING', function() {
        animation.play(true);
        expect(currentState).toEqual(JOURNAL_STATE.PLAYING);
    });

    it('can pause and unpause journal', function() {
        animation.play(true);
        expect(currentState).toEqual(JOURNAL_STATE.PLAYING);

        animation.togglePause();
        expect(currentState).toEqual(JOURNAL_STATE.PAUSED);

        animation.togglePause();
        expect(currentState).toEqual(JOURNAL_STATE.PLAYING);
    });

    describe('transition to credits', function() {

        beforeEach(function(done) {
            onStateChange = function(oldState, newState) {
                if (newState === JOURNAL_STATE.CREDITS) {
                    done();
                }
            }
            animation.play(true);
            animation.finish();
        });


        it('when finish is called state goes to CREDITS', function() {
            expect(currentState).toEqual(JOURNAL_STATE.CREDITS);
        });


    });


    describe('transition to done', function() {

        beforeEach(function(done) {
            onStateChange = function(oldState, newState) {
                if (newState === JOURNAL_STATE.DONE) {
                    done();
                }
            }
            animation.play(false);
        });


        it('state eventually goes to DONE', function() {
            expect(currentState).toEqual(JOURNAL_STATE.DONE);
        });

    });


});