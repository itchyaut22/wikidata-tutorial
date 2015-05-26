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
    'mgcrea.ngStrap'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      });
  });
