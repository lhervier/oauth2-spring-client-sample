var sampleApp = angular.module('sampleApp', ['ngOauth2AuthCodeFlow', 'ngResource']);

sampleApp.controller(
    'SampleController', 
    ['$rootScope', '$resource', '$window', 'Oauth2AuthCodeFlowService', 
    function($rootScope, $resource, $window, Oauth2AuthCodeFlowService) {
  var ths = this;
  
  // A message to display to the user
  this.message = null;
  // To display as a link to the user if it needs to reconnect.
  this.reconnectUrl = null;
  // The json response of the Rest API.
  this.jsonResponse = null;
  // The access token, in case you want to play with it (note that you DON'T have to)
  this.accessToken = null;
  // The url of the protected resource
  this.resUrl = null;
  
  this.callRestApi = function() {
    // Interceptor will add the "Authorization Bearer" header for us !
	// 'http://resource.privatenetwork.net:8080/oauth2-spring-res-server/api/subject'
    $resource(ths.resUrl).get(
        function(jsonResponse) {
          ths.jsonResponse = JSON.stringify(jsonResponse);
        },
        function(reason) {
          // User needs to reconnect. Refresh token is expired... 
          // This case can be handled application wide by a custom interceptor.
          if( reason.code == "oauth2.needs_reconnect" )
            ths.reconnectUrl = reason.reconnectUrl;
          else
            ths.message = "Error calling rest api : " + reason;
        }
    );
  };
  
  // Initialization of the OAUTH2 dance
  Oauth2AuthCodeFlowService.init('login', 'tokens', 'refresh').then(
      function(result) {
        // This is just for fun. We don't need the access token. 
        // The interceptor handle it for you.
        ths.accessToken = result.access_token;  
      },
      function(reason) {
        // If reconnect is needed at startup, handle it the way you want 
        // (display a message, or - in our case - redirect the browser)
        if( reason.code == "oauth2.needs_reconnect" )
          $window.location = reason.reconnectUrl;
        else
          ths.message = "Error initializing OAUTH2 dance";
      }
  );
}]);
