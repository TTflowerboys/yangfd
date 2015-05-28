/**
 * Created by levy on 15-5-28.
 */
angular.module('app')
    .constant('currencyTypes', {
        'CNY': '¥',
        'GBP': '£',
        'USD': '$',
        'EUR': '€',
        'HKD': '$'
    })
    .run(function ($rootScope, currencyTypes) {
        $rootScope.currencyTypes = currencyTypes
    })
