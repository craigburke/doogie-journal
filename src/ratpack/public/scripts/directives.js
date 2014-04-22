'use strict';

var directives = angular.module('doogie.directives', ['ngAnimate']);

directives.directive('cbMessage', function($animate) {
    return {
        restrict: "A",
        replace: true,
        transclude: true,
        scope: {
            type: '@',
            show: '&'
        },
        templateUrl: 'templates/message-box.tpl.html',
        controller: function($scope, $element, $attrs) {

            $scope.close = function() {
                $animate.leave($element, function() {
                    $element.remove();
                });
            }
        }
    }

});

directives.directive('cbJournalLink', function() {
    return {
        restrict: "A",
        templateUrl: 'templates/journal-link.tpl.html'
    }

});

directives.directive('cbResize', function($window, $parse) {
    return {
        restrict: "A",
        link: function($scope, $element, $attrs) {

            var onResizeFunction = $parse($attrs.cbResize);

            angular.element($window).bind('resize', function() {
                $scope.$apply(function() {
                    onResizeFunction($scope);
                });
            });

        }
    }
});

directives.directive('cbEditable', function($parse) {
    return {
        restrict: "A",
        link: function($scope, $element, $attrs) {
            $scope.$watch($attrs.cbEditable, function() {
                var isEditable = $parse($attrs.cbEditable)($scope);
                if (!isEditable) {
                    document.activeElement.blur();
                }

                $element.attr("contenteditable", isEditable);
            });

        }
    }
});

directives.directive('cbTweet', function() {
    return {
        restrict: "A",
        require: 'ngModel',
        link: function($scope, $element, $attrs, ngModelController) {

            var urlParser = document.createElement('a');

            ngModelController.$parsers.unshift(function(value) {
                urlParser.href = value;
                var splitPath = urlParser.pathname.split("/");
                var tweetId = splitPath[splitPath.length - 1];

                var isValidTweet = true;
                if (urlParser.host.indexOf("twitter.com") === -1) {
                    isValidTweet = false;
                }

                var tweetIdRegEx = /^\s*\d+\s*$/;
                if (tweetId.search(tweetIdRegEx) === -1) {
                    isValidTweet = false;
                }

                ngModelController.$setValidity('tweet', isValidTweet);

                if (isValidTweet) {
                    return tweetId;
                }
                else {
                    return undefined;
                }

            });
        }
    }
});
