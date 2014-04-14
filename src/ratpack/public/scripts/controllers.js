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


controllers.controller('JournalController', function($scope, JournalService, AnimationService, journal) {
    $scope.journal = journal;
    JournalService.set($scope.journal);

    $scope.isEditMode = function() {
        return AnimationService.getIsEditMode();
    }

    $scope.showLink = function() {
        return $scope.journalId;
    }

    $scope.save = function() {
        JournalService.save().then(function() {
            $scope.journalId = JournalService.getId();
        });
    }

    $scope.preview = function() {
        AnimationService.setTypingEnabled(false);
        console.log(AnimationService.getTypingEnabled());
    }
});

controllers.controller('AnimationController', function($scope, $interval, JournalService, AnimationService, journal) {
    $scope.journal = journal;
    $scope.typingEnabled = AnimationService.getTypingEnabled();

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
            doogieAnimation.play($scope.typingEnabled);
        }
    });

    var typingInterval;
    if ($scope.typingEnabled) {
        typingInterval = $interval(function() {
            doogieAnimation.updateJournalText($scope.journal.text);
        }, doogieApp.TYPING_INTERVAL);
    }

    $scope.showPaused = function() {
        return $scope.state === JOURNAL_STATE.PAUSED;
    };

    $scope.showInstructions = function() {
        return ($scope.typingEnabled && $scope.state === JOURNAL_STATE.PLAYING);
    };

    $scope.showOptions = function() {
        return AnimationService.getIsEditMode();
    }

    $scope.showLink = function() {
        return $scope.journalId;
    };

    $scope.edit = function() {
        AnimationService.setIsEditMode(true);
    }

    $scope.save = function() {
        AnimationService.setIsEditMode(false);
        JournalService.save().then(function() {
            $scope.journalId = JournalService.getId();
        });
    }

    $scope.hotkeys = function(event) {
        var keyCode = event.which;

        if (keyCode === doogieApp.KEY.BACKSPACE && $scope.typingEnabled) {
            var text = $scope.journal.text;

            if (text.length !== 0) {
                text = text.substring(0, text.length - 1);
            }

            $scope.journal.text = text;
            event.preventDefault();
        }
        else if (keyCode === doogieApp.KEY.ESCAPE && !$scope.typingEnabled) {
            doogieAnimation.togglePause();
        }
        else if (keyCode === doogieApp.KEY.RETURN && $scope.typingEnabled) {
            AnimationService.setIsEditMode(true);
            doogieAnimation.finish();
        }
    };

    $scope.typing = function(event) {
        if ($scope.typingEnabled) {
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


