describe('Routes test', function() {
  beforeEach(module('doogie'));

  var location, route, rootScope;

  beforeEach(inject(
    function(_$location_, _$route_, _$rootScope_) {
      location = _$location_;
      route = _$route_;
      rootScope = _$rootScope_;
    }
  ));

    beforeEach(inject(
        function($httpBackend) {
            $httpBackend.whenGET('/templates/journal.html')
                .respond(200, 'Journal HTML');
            $httpBackend.whenGET('/templates/show.html')
                .respond(200, 'Show Journal');
        }
    ));

    describe('journal route', function() {

        it('should load the journal page on successful load of /', function() {
            location.path('/');
            rootScope.$digest();
            expect(route.current.controller).toBe('JournalController');
        });

  });
  
  describe('show journal routes', function() {

    it('should load the animation page on successful load of /show', function() {
      location.path('/show/');
      rootScope.$digest();
      expect(route.current.controller).toBe('AnimationController');
    });
	
  });
  
  
});
