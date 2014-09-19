/* Created by frank on 14-9-18. */
angular.module('app')
    .directive('regionEdit', function ($rootScope) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/region_edit.tpl.html',
            scope: {
                country: '=country',
                city: '=city',
                zip: '=zip'
            },
            link: function (scope) {
                scope.userLanguage = $rootScope.userLanguage
            }
        }
    })
