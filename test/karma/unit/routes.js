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

  describe('journal route', function() {
    beforeEach(inject(
      function($httpBackend) {
        $httpBackend.expectGET('/templates/journal.html')
          .respond(200, 'Journal HTML');
      }
    ));

    it('should load the journal page on successful load of /', function() {
      location.path('/');
      rootScope.$digest(); // call the digest loop
      expect(route.current.controller).toBe('JournalController');
    });

  });
  
  describe('show journal routes', function() {
	  
    beforeEach(inject(
      function($httpBackend) {
        $httpBackend.expectGET('/templates/show.html')
          .respond(200, 'Show Journal HTML');
      }
    ));

    it('should load the animation page on successful load of /show', function() {
      location.path('/show/');
      rootScope.$digest(); // call the digest loop
      expect(route.current.controller).toBe('AnimationController');
    });
	
  });
  
  
});
