'use strict';


// Declare app level module which depends on filters, and services
angular.module('orderApp', [
  'ngRoute',
  'orderApp.filters',
  'orderApp.services',
  'orderApp.directives',
  'orderApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
	
  $routeProvider.when('/start', {templateUrl: 'partials/start.html', controller: 'StartController'});
  $routeProvider.when('/initialize', {templateUrl: 'partials/initialize.html', controller: 'InitializeController'});
  $routeProvider.when('/order', {templateUrl: 'partials/order.html', controller: 'OrderController'});
  $routeProvider.otherwise({redirectTo: '/start'});
}]);
