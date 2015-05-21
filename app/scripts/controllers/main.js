'use strict';

/**
 * @ngdoc function
 * @name tutorialWikidataApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the tutorialWikidataApp
 */
angular.module('tutorialWikidataApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
