/* Created by frank on 14-9-15. */
angular.module('app')
    .directive('addAssignee', function ($http, $filter) {
        return {
            restrict: 'AE',
            scope: {
                item: '=ngModel',
                type: '@type'
            },
            templateUrl: '/static/admin/templates/add_assignee.tpl.html',
            link: function (scope) {
                scope.searchUser = function (name) {
                    return $http.get('/api/1/user/admin/search', {params: {query: name}})
                        .then(function (res) {
                            return $filter('limitTo')(res.data.val, 5)
                        })
                }
                scope.onAssign = function (newAssignee) {
                    $http.post('/api/1/' + scope.type + '/' + scope.item.id + '/assign/' + newAssignee.id, null,
                        {errorMessage: true})
                        .success(function () {
                            scope.item.assignee = [newAssignee]
                        })
                }
            }
        }
    })
