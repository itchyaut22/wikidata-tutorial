'use strict';

/**
 * @ngdoc function
 * @name tutorialWikidataApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the tutorialWikidataApp
 */
angular.module('tutorialWikidataApp')
  .controller('MainCtrl', function ($scope, $http) {

    $scope.selectedCountry = {};
    $scope.countries = [];
    $scope.result = [];
    $scope.result.capital = "-";
    $scope.result.population = "-";
    $scope.result.currency = "-";
    $scope.result.memberOf = [];
    $scope.result.sharesBorderWith = [];

    var getShareBorder = function(shareBorder) {
      angular.forEach(shareBorder, function(member) {
        var id = member.mainsnak.datavalue.value['numeric-id'];
        var dataStr = 'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=Q' + id + '&props=labels&languages=de&callback=JSON_CALLBACK';

        $http({
            url: dataStr,
            method: 'jsonp'
          })
          .success(function(response) {
            if (!angular.isUndefined(response.entities['Q' + id].labels)) {
              $scope.result.sharesBorderWith.push({
                value: response.entities['Q' + id].labels.de.value
              });
            }
          });
      });
    };

    var getMemberOf = function(memberOf) {

      angular.forEach(memberOf, function(member) {
        var id = member.mainsnak.datavalue.value['numeric-id'];
        var dataStr = 'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=Q' + id + '&props=labels&languages=de&callback=JSON_CALLBACK';

        $http({
            url: dataStr,
            method: 'jsonp'
          })
          .success(function(response) {
            $scope.result.memberOf.push({
              value: response.entities['Q' + id].labels.de.value
            });
          });
      });

    };

    var getCurrency = function(currencyId) {
      var dataStr = 'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=Q' + currencyId + '&props=labels&languages=de&callback=JSON_CALLBACK';
      $http({
          url: dataStr,
          method: 'jsonp'
        })
        .success(function(response) {
          var currency = response.entities['Q' + currencyId].labels.de.value;
          //alert(capital);
          $scope.result.currency = currency;
        });
    };

    var getPopulation = function(population) {
      var intNr = parseInt(population);

      if (angular.isNumber(intNr)) {
        $scope.result.population = intNr;
      } else {
        $scope.result.population = 'NaN';
      }

    };

    var getCapital = function(capitalId) {
      var dataStr = 'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=Q' + capitalId + '&props=labels&languages=de&callback=JSON_CALLBACK';
      $http({
          url: dataStr,
          method: 'jsonp'
        })
        .success(function(response) {
          var capital = response.entities['Q' + capitalId].labels.de.value;
          //alert(capital);
          $scope.result.capital = capital;
        });
    };

    $scope.startQuery = function() {
      var dataStr = 'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=' + $scope.selectedCountry + '&props=claims&languages=de&callback=JSON_CALLBACK';
      $http({
          url: dataStr,
          method: 'jsonp'
        })
        .success(function(response) {

          $scope.result = [];
          $scope.result.capital = "-";
          $scope.result.population = "-";
          $scope.result.currency = "-";
          $scope.result.memberOf = [];
          $scope.result.sharesBorderWith = [];

          var country = $scope.selectedCountry
          var capital = response.entities[country].claims.P36[0].mainsnak.datavalue.value['numeric-id'];
          var population = response.entities[country].claims.P1082[0].mainsnak.datavalue.value['amount'].substring(1);
          var currency = response.entities[country].claims.P38[0].mainsnak.datavalue.value['numeric-id'];
          var memberOf = response.entities[country].claims.P463;
          var sharesBorder = response.entities[country].claims.P47;

          console.log(sharesBorder);
          getCapital(capital);
          getPopulation(population);
          getCurrency(currency);
          getMemberOf(memberOf);
          getShareBorder(sharesBorder);

          angular.element('#wikidataResult').removeClass('panel-danger');
          angular.element('#wikidataResult').addClass('panel-success');
        })
        .error(function(response) {
          angular.element('#wikidataResult').removeClass('panel-success');
          angular.element('#wikidataResult').addClass('panel-danger');
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
              $scope.countries.push({
                value: value.id,
                label: value.labels.de.value
              });
            });
            $scope.selectedCountry = $scope.countries[0].value;
          })
          .error(function(data, status, headers, config) {
            console.log(data);
          });
      });
  });
