angular.module('app')
    .directive('showDynamic', function ($http, $filter, growl, misc) {
        return {
            restrict: 'AE',
            scope: {
                item: '=ngModel',
                status: '=',
                user: '=',
                forwardToLandlord: '=',
                forwardToTenant: '=',
                rejectMessage: '='
            },
            templateUrl: '/static/admin/templates/show_dynamic.tpl.html',
            controller: function ($scope, $element, $rootScope, $compile) {
                $scope.list = []
            },
            link: function (scope) {
                scope.$watch('[item,status]', function (newValue) {
                    var dynamic = _.find(newValue[0].custom_fields || [], {key: 'dynamic'}) || {key: 'dynamic', value: '[]'}
                    scope.list = _.map(_.filter(JSON.parse(dynamic.value), function (obj) {
                        return obj.status === newValue[1]
                    }), function (item) {
                        item.type = item.type || 'dynamic'
                        return item
                    })
                }, true)
            }
        }
    })
