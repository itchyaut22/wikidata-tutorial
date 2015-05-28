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
    'ngRoute',
    'ui.bootstrap',
    'mgcrea.ngStrap',
    'ngCookies',
    'LocalStorageModule'
  ])
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      });
  })
  .config(['localStorageServiceProvider', function(localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('ls');
  }]);
