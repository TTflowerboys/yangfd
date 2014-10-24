/**
 * Created by Michael on 14/10/24.
 */
angular.module('app')
    .directive('selectPropertyOrStudentItem', function ($rootScope, enumApi, propertyApi) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/select_property_or_student_item.tpl.html',
            replace: true,
            scope: {
                propertyId: '=selectPropertyOrStudentItem'
            },
            link: function (scope) {
                scope.userLanguage = $rootScope.userLanguage
                enumApi.getEnumsByType('property_type').success(function (data) {
                    var list = data.val
                    var res
                    for (var item in list) {
                        if (list[item].slug === 'new_property' || list[item].slug === 'student_housing') {
                            if (res) {
                                res += ',' + list[item].id
                            } else {
                                res = list[item].id
                            }
                        }
                    }
                    propertyApi.getAll({params: {property_type: res, status: 'selling'}}).success(function (data) {
                        scope.propertyList = data.val.content
                    })
                })
            }
        }
    })