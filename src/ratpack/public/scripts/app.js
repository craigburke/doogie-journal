'use strict';

var app = angular.module('doogie', [
    'ngRoute',
    'ngQuickDate',
    'doogie.controllers',
    'doogie.services'
]);


app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            controller: 'DoogieController',
            templateUrl: '/partials/journal.html',
            resolve: {
                journal: function(JournalService) { return JournalService.getDefault(); }
            }
        })
        .when('/show', {
            controller: 'ShowAnimation',
            templateUrl: '/partials/show.html',
            resolve: {
                journal: function(JournalService) { return JournalService.get(); },
                typingEnabled: function() { return true; }
            }
        })
        .when('/show/:id', {
            controller: 'ShowAnimation',
            templateUrl: '/partials/show.html',
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