'use strict';

/**
 * @ngdoc function
 * @name tutorialWikidataApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the tutorialWikidataApp
 */
angular.module('tutorialWikidataApp')
  .controller('MainCtrl', function($scope, $http, localStorageService) {

    $scope.selectedCountry = {};
    $scope.countries = [];
    $scope.result = [];
    $scope.result.country = '-'
    $scope.result.capital = '-';
    $scope.result.population = '-';
    $scope.result.currency = '-';
    $scope.result.memberOf = [];
    $scope.result.sharesBorderWith = [];

    var getShareBorder = function(shareBorder) {
      angular.forEach(shareBorder, function(member) {

        var hasQualifiers = !angular.isUndefined(member.qualifiers);
        if (!hasQualifiers || angular.isUndefined(member.qualifiers['P582'])) {

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
        }
      });
    };

    var getMemberOf = function(memberOf) {
      angular.forEach(memberOf, function(member) {

        var hasQualifiers = !angular.isUndefined(member.qualifiers);
        if (!hasQualifiers || angular.isUndefined(member.qualifiers['P582'])) {
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
        }
      });

    };

    var getCurrency = function(currencyId) {
      angular.forEach(currencyId, function(response) {
        var hasQualifiers = !angular.isUndefined(response.qualifiers);
        if (!hasQualifiers || angular.isUndefined(response.qualifiers['P582'])) {
          var mCurrencyId = response.mainsnak.datavalue.value['numeric-id'];
          var dataStr = 'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=Q' + mCurrencyId + '&props=labels&languages=de&callback=JSON_CALLBACK';
          $http({
              url: dataStr,
              method: 'jsonp'
            })
            .success(function(response) {
              var currency = response.entities['Q' + mCurrencyId].labels.de.value;
              $scope.result.currency = currency;
            });
        }

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
      angular.forEach(capitalId, function(response) {
        var hasQualifiers = !angular.isUndefined(response.qualifiers);
        if (!hasQualifiers || angular.isUndefined(response.qualifiers['P582']) || (!angular.isUndefined(response.qualifiers['P582']) && response.qualifiers['P582'][0].snaktype == 'novalue')) {
          var mCapitalId = response.mainsnak.datavalue.value['numeric-id'];
          var dataStr = 'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=Q' + mCapitalId + '&props=labels&languages=de&callback=JSON_CALLBACK';
          $http({
              url: dataStr,
              method: 'jsonp'
            })
            .success(function(response) {
              var capital = response.entities['Q' + mCapitalId].labels.de.value;
              //alert(capital);
              $scope.result.capital = capital;
            });
        }


      });
    };

    $scope.startQuery = function() {
      var dataStr = 'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=' + $scope.selectedCountry + '&props=claims|labels&languages=de&callback=JSON_CALLBACK';
      $http({
          url: dataStr,
          method: 'jsonp'
        })
        .success(function(response) {

          $scope.result = [];
          $scope.result.country = '-'
          $scope.result.capital = '-';
          $scope.result.population = '-';
          $scope.result.currency = '-';
          $scope.result.memberOf = [];
          $scope.result.sharesBorderWith = [];

          var country = $scope.selectedCountry
          var officialName = '-';
          var capital = '-';
          var population = '-';
          var currency = '-';
          var memberOf = [];
          var sharesBorder = [];

          if (!angular.isUndefined(response.entities[country].labels.de)) {
            officialName = response.entities[country].labels.de.value;
            $scope.result.country = officialName;
          }
          if (!angular.isUndefined(response.entities[country].claims.P36)) {
            capital = response.entities[country].claims.P36;
            getCapital(capital);
          }
          if (!angular.isUndefined(response.entities[country].claims.P1082)) {
            population = response.entities[country].claims.P1082[0].mainsnak.datavalue.value['amount'].substring(1);
            getPopulation(population);
          }
          if (!angular.isUndefined(response.entities[country].claims.P38)) {
            currency = response.entities[country].claims.P38;
            getCurrency(currency);
          }
          if (!angular.isUndefined(response.entities[country].claims.P463)) {
            memberOf = response.entities[country].claims.P463;
            getMemberOf(memberOf);
          }
          if (!angular.isUndefined(response.entities[country].claims.P47)) {
            sharesBorder = response.entities[country].claims.P47;
            getShareBorder(sharesBorder);
          }

          angular.element('#wikidataResult').removeClass('panel-danger');
          angular.element('#wikidataResult').addClass('panel-success');
        })
        .error(function(response) {
          angular.element('#wikidataResult').removeClass('panel-success');
          angular.element('#wikidataResult').addClass('panel-danger');
        });

    };

    var loadCountries = function() {
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
              var mCountries = [];
              angular.forEach(response.entities, function(value, key) {
                mCountries.push({
                  value: value.id,
                  label: value.labels.de.value
                });
              });

              localStorageService.set('countries', mCountries);
              $scope.countries = mCountries;
              $scope.selectedCountry = mCountries[0].value;
            })
            .error(function(data, status, headers, config) {
              console.log(data);
            });
        });
    };

    // check if there are cookies available
    var countriesInStore = localStorageService.get('countries');
    if (countriesInStore) {
      $scope.countries = countriesInStore;
      $scope.selectedCountry = countriesInStore[0].value;
    } else {
      loadCountries();
    }
  });
