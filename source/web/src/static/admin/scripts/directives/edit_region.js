/* Created by frank on 14-9-18. */
angular.module('app')
    .directive('editRegion', function ($rootScope, apiFactory) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_region.tpl.html',
            scope: {
                country: '=country',
                city: '=city',
                zip: '=zip'
            }
        }
    })
