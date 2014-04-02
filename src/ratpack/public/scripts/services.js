var services = angular.module('doogie.services', []);

services.factory('JournalService', function($http, $q) {

        var defaultJournal = {
            title: "Personal Journal of Doogie Howser M.D.",
            date: new Date(),
            text: "",
            credits: {
                person: "Craig Burke",
                title: "Executive Producer"
            }
        };

        var journalId = null;
        var journal = defaultJournal;

        return {
                set: function(journal) {
                    this.journal = journal;
                },
                get: function() {
                    return journal;
                },
                getId: function() {
                    return journalId;
                },
                load: function(id) {
                    var deferred = $q.defer();

                    $http.get('journal/' + id)
                        .success(function(data) {
                            journal = data;
                            deferred.resolve(data);
                        })
                        .error(function(reason) {
                            deferred.reject(reason);
                    });

                    return deferred.promise;
                },
                save: function() {
                    var deferred = $q.defer();

                    $http.post('journal', journal)
                        .success(function(data) {
                            journalId = data.id;
                            deferred.resolve(data);
                        })
                        .error(function(reason) {
                           deferred.reject(reason);
                    });

                    return deferred.promise;
                },
                getDefault: function() {
                    return defaultJournal;
                }
        };
});
