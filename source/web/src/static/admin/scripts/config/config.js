/* Created by frank on 14-8-14. */
angular.module('app')
    .config(function ($stateProvider, $urlRouterProvider, $interpolateProvider) {
        $interpolateProvider.startSymbol('{%')
        $interpolateProvider.endSymbol('%}')
        $urlRouterProvider.otherwise('/dashboard');
    })
    .config(['growlProvider', function (growlProvider) {
        growlProvider.globalTimeToLive(5000)
        growlProvider.globalEnableHtml(false)
    }])
