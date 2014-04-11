'use strict';

var app = angular.module('doogie', [
    'ngRoute',
    'mgcrea.ngStrap',
    'doogie.controllers',
    'doogie.services'
]);


app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            controller: 'JournalController',
            templateUrl: '/templates/journal.html',
            resolve: {
                journal: function(JournalService) { return JournalService.getDefault(); }
            }
        })
        .when('/show', {
            controller: 'AnimationController',
            templateUrl: '/templates/show.html',
            resolve: {
                journal: function(JournalService) { return JournalService.get(); },
                typingEnabled: function() { return true; }
            }
        })
        .when('/show/:id', {
            controller: 'AnimationController',
            templateUrl: '/templates/show.html',
            resolve: {
                journal: function($route, JournalService) {
                    var id = $route.current.params.id;
                    return JournalService.load(id);
                },
                typingEnabled: function() { return false; }
            }
        })
        .otherwise({redirectTo: '/'});
});