angular.module('app')
    .directive('editUserDict', function ($http, $rootScope) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_user_dict.tpl.html',
            replace: true,
            scope: {
                item: '=ngModel',
                edit: '=edit',
                submit: '&',
            },
            link: function (scope, elm, attrs) {

            }
        }
    })
