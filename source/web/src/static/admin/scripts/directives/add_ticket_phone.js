/**
 * Created by Michael on 14/9/26.
 */
angular.module('app')
    .directive('addTicketPhone', function ($http, $filter) {
        return {
            restrict: 'AE',
            templateUrl: '/static/admin/templates/add_ticket_phone.tpl.html',
            scope: {
                phone: '=ngModel',
                userId: '=userId'
            },
            link: function (scope) {
                scope.checkPhone = function (country,phone) {
                    checkPhone(country, phone).success(function (data) {
                        scope.phone = data.val
                        getUserByPhone(country, phone)
                            .success(function (data) {
                                var res = data.val
                                if (_.isArray(res) && res.length > 0) {
                                    scope.userId = data.val[0].id
                                } else {
                                    scope.userId = undefined
                                }
                            }).error(function (data) {
                                scope.userId = undefined
                            })
                    }).error(function () {
                        scope.userId = undefined
                    })
                }

                scope.cleanPhone = function () {
                    scope.phone =undefined
                    scope.userId = undefined

                }

                function checkPhone(country, phone) {
                    return $http.get('/api/1/user/phone_test', {
                        params: {
                            country: country,
                            phone: phone
                        }
                    })
                }

                function getUserByPhone(country, phone) {
                    return $http.get('/api/1/user/admin/search', {
                        params: {
                            country: country,
                            phone: phone
                        }
                    })
                }
            }
        }
    })
