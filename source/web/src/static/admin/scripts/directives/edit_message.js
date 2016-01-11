angular.module('app')
    .directive('editMessage', function ($rootScope, $compile, $http) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/edit_message.tpl.html',
            replace: true,
            scope: {
                model: '=ngModel',
                template: '=',
            },
            //controller: function ($scope, $element, $attrs) {
            //    console.log($scope.item)
            //},
            link: function (scope, elem) {
                var $template = elem.find('.template')
                scope.userLanguage = $rootScope.userLanguage
                scope.status = 'loading'
                scope.$watch('template', function (newValue) {
                    scope.status = 'loading'
                    if(newValue) {
                        $http.get(newValue)
                            .then(function (data) {
                                $template.html('')
                                $template.append($compile(data.data)(scope.$parent))
                                setTimeout(function () {
                                    scope.status = 'success'
                                    scope.model = $template.text().trim()
                                    scope.$apply()
                                }, 500)
                            }, function () {
                                scope.status = 'failed'
                            })
                    } else {
                        scope.status = 'failed'
                    }
                })

            }
        }
    })