'use strict';

/**
 * @ngdoc overview
 * @name tutorialWikidataApp
 * @description
 * # tutorialWikidataApp
 *
 * Main module of the application.
 */
angular
  .module('tutorialWikidataApp', [
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
