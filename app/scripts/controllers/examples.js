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

    $scope.selectedCountry = {};
    $scope.countries = [];

    var getCapital = function(capitalId) {
      console.log(capitalId);
      var dataStr = 'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=Q' + capitalId + '&props=labels&languages=de&callback=JSON_CALLBACK';
      $http({
        url: dataStr,
        method: 'jsonp'
      })
      .success(function(response) {
        console.log(response);
        var capital = response.entities['Q' + capitalId].labels.de.value;
        alert(capital);
      });
    };

    $scope.startQuery = function() {
      console.log($scope.selectedCountry);

      var dataStr = 'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=' + $scope.selectedCountry + '&props=claims&languages=de&callback=JSON_CALLBACK';
      console.log(dataStr);
      $http({
        url: dataStr,
        method: 'jsonp'
      })
      .success(function(response) {
        var country = $scope.selectedCountry
        var capital = response.entities[country].claims.P36[0].mainsnak.datavalue.value['numeric-id'];
        getCapital(capital);
      });

    };

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
          $scope.countries.push({ value: value.id, label: value.labels.de.value});
        });
        $scope.selectedCountry = $scope.countries[0].value;
      })
      .error(function(data, status, headers, config) {
        console.log(data);
      });
    });

  });
