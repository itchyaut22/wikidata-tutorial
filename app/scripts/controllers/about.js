'use strict';

/**
 * @ngdoc function
 * @name tutorialWikidataApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the tutorialWikidataApp
 */
angular.module('tutorialWikidataApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
