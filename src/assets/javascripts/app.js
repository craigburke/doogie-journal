'use strict';

angular.module('doogie', [
    'ngRoute',
    'mgcrea.ngStrap',
    'doogie.directives',
    'doogie.controllers',
    'doogie.services'
])
.config(function($routeProvider) {
        $routeProvider
        .when('/', {
            controller: 'JournalController',
            templateUrl: 'templates/journal.html',
            resolve: {
                'journal': function(JournalService) { return JournalService.get(); }
            }
        })
        .when('/show', {
            controller: 'AnimationController',
            templateUrl: 'templates/show.html',
            resolve: {
                'journal': function(JournalService) { return JournalService.get(); }
            }
        })
        .when('/show/:id', {
            controller: 'AnimationController',
            templateUrl: 'templates/show.html',
            resolve: {
                'journal': function($route, JournalService, AnimationService) {
                    AnimationService.setTypingEnabled(false);
                    var id = $route.current.params.id;
                    return JournalService.load(id);
                }
            }
        })
        .otherwise({redirectTo: '/'});
});