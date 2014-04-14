var services = angular.module('doogie.services', []);

services.factory('JournalService', function($http, $q) {

        var _journalId = null;
        var _journal = {
            title: "Personal Journal of Doogie Howser M.D.",
            date: new Date(),
            text: "",
            credits: {
                person: "Craig Burke",
                title: "Executive Producer"
            }
        };

        return {
                set: function(journal) {
                    _journal = journal;
                },
                get: function() {
                    return _journal;
                },
                getId: function() {
                    return _journalId;
                },
                load: function(id) {
                    var deferred = $q.defer();

                    $http.get('journal/' + id)
                        .success(function(data) {
                            _journal = data;
                            deferred.resolve(data);
                        })
                        .error(function(reason) {
                            deferred.reject(reason);
                    });

                    return deferred.promise;
                },
                save: function() {
                    var deferred = $q.defer();

                    $http.post('journal', _journal)
                        .success(function(data) {
                            _journalId = data.id;
                            deferred.resolve(data);
                        })
                        .error(function(reason) {
                           deferred.reject(reason);
                    });

                    return deferred.promise;
                }
        };
});

services.factory('AnimationService', function() {

    var options = {
        typingEnabled: true,
        isEditMode: false
    }

    return {
        getTypingEnabled: function() {
            return options.typingEnabled;
        },
        setTypingEnabled: function(typingEnabled) {
            options.typingEnabled = typingEnabled;
        },
        getIsEditMode: function() {
            return options.isEditMode;
        },
        setIsEditMode: function(isEditMode) {
            options.isEditMode = isEditMode;
        }
    }
});
