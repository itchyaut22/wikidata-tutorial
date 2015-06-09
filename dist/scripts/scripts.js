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

'use strict';

/**
 * wbgetentities:
 * Module to get the content of several entities, possibly with only parts of the entity included.
 * Entities that are checked for existence, but not found, are reported (bugzilla:45509).
 * During lookup both sites and titles can be a list, that is if the entities are items, but the shorter one is cycled to match the longer one.
 * If one of the lists contain a single entry it will be used for all entries from the other list.
 * If both lists are equally long the sitelinks will be well-formed pairs.
 *
 *
 * @ngdoc function
 * @name tutorialWikidataApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the tutorialWikidataApp
 */
angular.module('tutorialWikidataApp')
  .controller('MainCtrl', function($scope, $http, localStorageService) {

    // some wikidata constants
    var WIKIDATA_PROPERTY_END_DATE            = 'P582';
    var WIKIDATA_PROPERTY_CAPITAL             = 'P36';
    var WIKIDATA_PROPERTY_POPULATION          = 'P1082';
    var WIKIDATA_PROPERTY_CURRENCY            = 'P38';
    var WIKIDATA_PROPERTY_MEMBER_OF           = 'P463';
    var WIKIDATA_PROPERTY_SHARES_BORDER_WITH  = 'P47';

    // scope variables initialization
    $scope.selectedCountry = {};
    $scope.countries = [];
    $scope.result = [];
    $scope.result.country = '-'
    $scope.result.capital = '-';
    $scope.result.population = '-';
    $scope.result.currency = '-';
    $scope.result.memberOf = [];
    $scope.result.sharesBorderWith = [];

    /**
    * Function for generating wikidata query string using wikidata api
    */
    var getWikidataUrlForItem = function(item, props) {
      var itemStr = '';

      if (!angular.isString(item)) {
        itemStr = item.toString();
      } else {
        itemStr = item;
      }

      if (itemStr.indexOf('Q') == 0) {
      } else {
        itemStr = 'Q' + itemStr;
      }

      if (angular.isUndefined(props)) {
        props = 'labels';
      } else {
        props = props.join('|');
      }
      return 'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=' + itemStr + '&props=' + props + '&languages=de&callback=JSON_CALLBACK';
    };

    /**
    * Function for determine countries that shares the border with the country
    */
    var getShareBorder = function(shareBorder) {
      angular.forEach(shareBorder, function(member) {

        var hasQualifiers = !angular.isUndefined(member.qualifiers);
        if (!hasQualifiers || angular.isUndefined(member.qualifiers[WIKIDATA_PROPERTY_END_DATE])) {

          var id = member.mainsnak.datavalue.value['numeric-id'];
          var dataStr = getWikidataUrlForItem(id);

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

    /**
    * Function for determine organizations that the country has a membership with
    */
    var getMemberOf = function(memberOf) {
      angular.forEach(memberOf, function(member) {

        var hasQualifiers = !angular.isUndefined(member.qualifiers);
        if (!hasQualifiers || angular.isUndefined(member.qualifiers[WIKIDATA_PROPERTY_END_DATE])) {

          var id = member.mainsnak.datavalue.value['numeric-id'];
          var dataStr = getWikidataUrlForItem(id);

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

    /**
    * Function for determine the country's currency
    */
    var getCurrency = function(currencyId) {
      angular.forEach(currencyId, function(response) {
        var hasQualifiers = !angular.isUndefined(response.qualifiers);
        if (!hasQualifiers || angular.isUndefined(response.qualifiers[WIKIDATA_PROPERTY_END_DATE])) {
          var mCurrencyId = response.mainsnak.datavalue.value['numeric-id'];
          var dataStr = getWikidataUrlForItem(mCurrencyId);
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

    /**
    * Function for determine the country's population
    */
    var getPopulation = function(population) {
      var intNr = parseInt(population);

      if (angular.isNumber(intNr)) {
        $scope.result.population = intNr;
      } else {
        $scope.result.population = 'NaN';
      }
    };

    /**
    * Function for determine the country's capial
    */
    var getCapital = function(capitalId) {
      angular.forEach(capitalId, function(response) {
        var hasQualifiers = !angular.isUndefined(response.qualifiers);
        if (!hasQualifiers || angular.isUndefined(response.qualifiers[WIKIDATA_PROPERTY_END_DATE]) ||
           (!angular.isUndefined(response.qualifiers[WIKIDATA_PROPERTY_END_DATE]) &&
             response.qualifiers[WIKIDATA_PROPERTY_END_DATE][0].snaktype == 'novalue')) {

          var mCapitalId = response.mainsnak.datavalue.value['numeric-id'];
          var dataStr = getWikidataUrlForItem(mCapitalId);
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

    /**
    * ActionListener: Button 'Abfrage starten' clicked
    * Call all above mentioned functions to determine some infos from a wikidata country
    */
    $scope.startQuery = function() {
      var dataStr = getWikidataUrlForItem($scope.selectedCountry, ['claims', 'labels']);
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
          if (!angular.isUndefined(response.entities[country].claims[WIKIDATA_PROPERTY_CAPITAL])) {
            capital = response.entities[country].claims[WIKIDATA_PROPERTY_CAPITAL];
            getCapital(capital);
          }
          if (!angular.isUndefined(response.entities[country].claims[WIKIDATA_PROPERTY_POPULATION])) {
            population = response.entities[country].claims[WIKIDATA_PROPERTY_POPULATION][0].mainsnak.datavalue.value['amount'].substring(1);
            getPopulation(population);
          }
          if (!angular.isUndefined(response.entities[country].claims[WIKIDATA_PROPERTY_CURRENCY])) {
            currency = response.entities[country].claims[WIKIDATA_PROPERTY_CURRENCY];
            getCurrency(currency);
          }
          if (!angular.isUndefined(response.entities[country].claims[WIKIDATA_PROPERTY_MEMBER_OF])) {
            memberOf = response.entities[country].claims[WIKIDATA_PROPERTY_MEMBER_OF];
            getMemberOf(memberOf);
          }
          if (!angular.isUndefined(response.entities[country].claims[WIKIDATA_PROPERTY_SHARES_BORDER_WITH])) {
            sharesBorder = response.entities[country].claims[WIKIDATA_PROPERTY_SHARES_BORDER_WITH];
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

          // max 50 items allowed 
          for (index = 0; index < 50; ++index) {
            itemsWithQ[index] = 'Q' + items[index];
          }
          var wikidatastr = getWikidataUrlForItem(itemsWithQ.join('|'));
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
      // no cookies available --> query all countries from wdq.wmflabs.org api
      loadCountries();
    }
  });
