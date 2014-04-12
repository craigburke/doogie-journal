'use strict';

var controllers = angular.module('doogie.controllers', []);

var doogieApp = {
    TYPING_INTERVAL: 100,

    KEY : {
        RETURN: 13,
        ESCAPE: 27,
        BACKSPACE: 8
    },
    isValidCharacter: function(keyCode) {
        // includes letters, numbers and various punctuation
        return (keyCode >= 32 && keyCode <= 126);
    }

};


controllers.controller('JournalController', function($scope, JournalService, journal) {
    $scope.journal = journal;
    JournalService.set($scope.journal);
});

controllers.controller('AnimationController', function($scope, $interval, JournalService, journal, typingEnabled) {
    $scope.journal = journal;

    var onStateChange = function(oldState, newState) {
        $scope.$apply(function() {
            $scope.state = newState;
        });
    }

    var doogieAnimation = journalAnimation({
        journal: journal,
        containerId: 'canvas',
        loopAudioId: 'loopAudio',
        endAudioId: 'endAudio',
        onStateChange: onStateChange
    });

    // Make sure required fonts are loaded before playing animation
    WebFont.load({
        custom: {
            families: ['DOS', 'TSISQUILISDA'],
            urls: ['/styles/doogie.css']
        },
        active: function() {
            doogieAnimation.play(typingEnabled);
        }
    });

    var typingInterval;
    if (typingEnabled) {
        typingInterval = $interval(function() {
            doogieAnimation.updateJournalText($scope.journal.text);
        }, doogieApp.TYPING_INTERVAL);
    }

    $scope.showPaused = function() {
        return $scope.state === JOURNAL_STATE.PAUSED;
    };

    $scope.showInstructions = function() {
        return (typingEnabled && $scope.state === JOURNAL_STATE.PLAYING);
    };

    $scope.showLink = function() {
        return $scope.journalId;
    };

    $scope.hotkeys = function(event) {
        var keyCode = event.which;

        if (keyCode === doogieApp.KEY.BACKSPACE && typingEnabled) {
            var text = $scope.journal.text;

            if (text.length !== 0) {
                text = text.substring(0, text.length - 1);
            }

            $scope.journal.text = text;
            event.preventDefault();
        }
        else if (keyCode === doogieApp.KEY.ESCAPE && !typingEnabled) {
            doogieAnimation.togglePause();
        }
        else if (keyCode === doogieApp.KEY.RETURN && typingEnabled) {
            JournalService.save().then(function() {
                $scope.journalId = JournalService.getId();

            });

            doogieAnimation.finish();
        }
    };

    $scope.typing = function(event) {
        if (typingEnabled) {
            var keyCode = event.which;

            if (doogieApp.isValidCharacter(keyCode)) {
                $scope.journal.text += String.fromCharCode(keyCode);
            }
        }
    };

    $scope.$on('$destroy', function() {
        if (typingInterval) {
            $interval.cancel(typingInterval);
        }
        doogieAnimation.stop();
    });

});


