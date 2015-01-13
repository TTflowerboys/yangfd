/**
 * Created by zhou on 15-1-13.
 */
angular.module('app')
    .directive('selectShop', function ($rootScope, shopApi) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/select_shop.tpl.html',
            replace: true,
            scope: {
                shopId: '=ngModel'
            },
            link: function (scope) {
                shopApi.getAll()
                    .success(function (data) {
                        scope.shopList = data.val
                    })
            }
        }
    })
