var ngOauth2AuthCodeFlow = angular.module('ngOauth2AuthCodeFlow', ['ngResource']);

ngOauth2AuthCodeFlow.factory('Oauth2AuthCodeFlowService', ['$rootScope', '$q', '$resource', '$window', function($rootScope, $q, $resource, $window) {
	var svc = {
		token: null,					// Cache for the token
		iss: null,						// Token issued date
		initEndPoint: null,				// Initialization end point
		tokenEndPoint: null,			// Token end point
		refreshEndPoint: null,			// Refresh end point
		_getToken: function(url) {
			var ths = this;
			
			var deferred = $q.defer();
			$resource(url).get().$promise.then(deferred.resolve, deferred.reject);
			
			return deferred.promise.then(
				function(result) {
					var def = $q.defer();
					if( !result.access_token ) {
						def.reject({
							code: "oauth2.needs_reconnect",
							reconnectUrl: ths.initEndPoint + "?redirect_url=" + encodeURIComponent($window.location)
						});
					} else {
						svc.token = result.access_token;
						svc.iss = new Date().getTime();
						def.resolve(result);
					}
					return def.promise;
				},
				function() {
					var def = $q.defer();
					def.reject({
						code: "oauth2.error_getting_token"
					});
					return def.promise;
				}
			);
		},
		init: function(initEndPoint, tokenEndPoint, refreshEndPoint) {
			this.initEndPoint = initEndPoint;
			this.tokenEndPoint = tokenEndPoint;
			this.refreshEndPoint = refreshEndPoint;
			return this._getToken(this.tokenEndPoint);
		},
		getAccessToken: function() {
			if( svc.token ) {
				var defer = $q.defer();
				defer.resolve(svc.token);
				return defer.promise;
			}
			
			return this._getToken(this.tokenEndPoint);
		},
		refreshToken: function() {
			// Do not refresh if refresh token has been issued less that 10s ago
			if( this.iss != null && new Date().getTime() - this.iss < 10000 ) {
				var deferred = $q.defer();
				deferred.reject({
					code: "oauth2.error.unable_to_refresh_token"
				});
				return deferred.promise;
			} else
				return this._getToken(this.refreshEndPoint);
		}
	};
	return svc;
}]);

ngOauth2AuthCodeFlow.config(['$httpProvider', function($httpProvider) {
	$httpProvider.interceptors.push(['$injector', '$location', '$q', function($injector, $location, $q) {
		var external = RegExp('^((f|ht)tps?:)?//(?!' + $location.host() + ')');
		var shouldProcess = function(url) {
			return external.test(url);
		}
		return {
			request: function(config) {
				if( !shouldProcess(config.url) )
					return config;
				
				var Oauth2AuthCodeFlowService = $injector.get('Oauth2AuthCodeFlowService');
				return Oauth2AuthCodeFlowService.getAccessToken().then(
						function(token) {
							config.headers.authorization = "Bearer " + token;
							return config;
						},
						function() {
							// Hack to cancel the current request
							var canceller = $q.defer();
							canceller.resolve();
							config.timeout = canceller.promise;
							return config;
						}
				);
			},
			
			responseError: function(response) {
				if( response.status == 401 && shouldProcess(response.config.url) ) {
					var Oauth2AuthCodeFlowService = $injector.get('Oauth2AuthCodeFlowService');
					var $http = $injector.get('$http');
					var $window = $injector.get('$window');
					var deferred = $q.defer();
					Oauth2AuthCodeFlowService.refreshToken().then(deferred.resolve, deferred.reject);
					return deferred.promise.then(
							function(token) {
								return $http(response.config);
							},
							function(error) {
								var deferred = $q.defer();
								deferred.reject({
									code: "oauth2.needs_reconnect",
									reconnectUrl: Oauth2AuthCodeFlowService.initEndPoint + "?redirect_url=" + encodeURIComponent($window.location)
								});
								return deferred.promise;
							}
					);
				}
				return $q.reject(response);
			}
		};
	}]);
}]);