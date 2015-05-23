'use strict';

/**
 * @ngdoc function
 * @name tutorialWikidataApp.controller:ExamplesCtrl
 * @description
 * # ExamplesCtrl
 * Controller of the tutorialWikidataApp
 */
angular.module('tutorialWikidataApp')
  .controller('ExamplesCtrl', function ($scope, $http) {

    $scope.selectedIcon = "";
    $scope.icons = [];

    $http({
      url: 'https://wdq.wmflabs.org/api?q=CLAIM[31:6256]&callback=JSON_CALLBACK',
      method: 'jsonp'
    })
    .success(function(response) {
      var items = response.items;
      var itemsWithQ = [];
      var index;

      for (index = 0; index < 50; ++index) {
        itemsWithQ[index] = 'Q' + items[index];
      }
      var wikidatastr = 'http://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=' + itemsWithQ.join('|') + '&props=labels&languages=de&callback=JSON_CALLBACK';
      $http({
        url: wikidatastr,
        method: 'jsonp'
      })
      .success(function(response) {
        angular.forEach(response.entities, function(value, key) {
          $scope.icons.push({ value: value.labels.de.value, label: value.labels.de.value});
        });
        $scope.selectedIcon = $scope.icons[0].label;
      })
      .error(function(data, status, headers, config) {
        console.log(data);
      });
    });

  });
