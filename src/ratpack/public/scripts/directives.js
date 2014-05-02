'use strict';

angular.module('doogie.directives', ['ngAnimate'])

.directive('cbMessage', ['$animate', function($animate) {
    return {
        restrict: "A",
        transclude: true,
        scope: {
            type: '@'
        },
        templateUrl: 'templates/message-box.tpl.html',
        controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
            $element.addClass("alert");
            $element.addClass("alert-" + $attrs.type);
            $element.addClass("am-fade-and-scale");

            $scope.close = function() {
                $animate.leave($element, function() {
                    $element.remove();
                });
            }
        }]
    }

}])

.directive('cbJournalLink', function() {
    return {
        restrict: "A",
        templateUrl: 'templates/journal-link.tpl.html'
    }
})

.directive('cbResize', ['$window', '$parse', function($window, $parse) {
    return {
        restrict: "A",
        link: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {

            var onResizeFunction = $parse($attrs.cbResize);

            angular.element($window).bind('resize', function() {
                $scope.$apply(function() {
                    onResizeFunction($scope);
                });
            });

        }]
    }
}])

.directive('cbEditable', ['$parse', function($parse) {
    return {
        restrict: "A",
        link: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
            $scope.$watch($attrs.cbEditable, function() {
                var isEditable = $parse($attrs.cbEditable)($scope);
                if (!isEditable) {
                    document.activeElement.blur();
                }

                $element.attr("contenteditable", isEditable);
            });

        }]
    }
}])

.directive('cbTweet', function() {
    return {
        restrict: "A",
        require: 'ngModel',
        link: ['$scope', '$element', '$attrs', 'ngModelController',
            function($scope, $element, $attrs, ngModelController) {

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
        }]
    }
});
