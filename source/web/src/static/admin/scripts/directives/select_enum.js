/**
 * Created by Michael on 14/9/24.
 */
angular.module('app')
    .directive('selectEnum', function ($rootScope, enumApi) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/select_enum.tpl.html',
            replace: true,
            scope: {
                enumId: '=ngModel',
                enumType: '@name',
                enumOption: '@text',
                enumSlug: '=?slug'
            },
            link: function (scope, element) {
                scope.userLanguage = $rootScope.userLanguage
                enumApi.getEnumsByType(scope.enumType)
                    .success(function (data) {
                        scope.enumList = data.val
                    })
                scope.changeSlug = function () {

                    if(_.isEmpty(scope.enumId)){
                        scope.enumSlug = undefined
                        return
                    }
                    for(var p in scope.enumList){
                        if(scope.enumList[p].id===scope.enumId){
                            scope.enumSlug = scope.enumList[p].slug
                            $(element).attr('data-' + $(element).attr('slug'), scope.enumSlug)
                            return
                        }
                    }

                }
            }
        }
    })
