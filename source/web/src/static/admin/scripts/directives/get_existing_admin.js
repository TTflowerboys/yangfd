/**
 * Created by Michael on 14/9/2.
 */

angular.module('app')
    .directive('getExistingAdmin', function ($http, misc, permissions) {

        return {
            restrict: 'AE',
            link: function (scope, elm, attrs) {
                var delayer
                scope.$watch('item.phone', function (value) {
                    if (!value || value.length <= 5) {
                        if (delayer) {
                            delayer.cancel()
                        }
                        onNoExistingUser()
                        return
                    }
                    if (!delayer) {
                        delayer = new misc.Delayer({
                            task: function () {
                                scope.isCheckingPhone = true
                                checkPhone().success(function () {
                                    getUserByPhone().success(function (data) {
                                        var value = data.val[0]
                                        if (!value) {
                                            onNoExistingUser()
                                            return
                                        }
                                        angular.extend(scope.item, _.pick(value, 'id', 'nickname', 'email', 'role'))
                                        scope.existingItem = value

                                    }).error(onNoExistingUser)['finally'](function () {
                                        setTimeout(function () {
                                            scope.isCheckingPhone = false
                                        }, 200)
                                    })
                                }).error(function () {
                                    onNoExistingUser()
                                    setTimeout(function () {
                                        scope.isCheckingPhone = false
                                    }, 200)
                                })
                            },
                            delay: 1000
                        })
                    } else {
                        delayer.update()
                    }

                })

                function onNoExistingUser() {
                    scope.existingItem = null
                    scope.item.id = ''
                    scope.item.role = []
                    scope.item.nickname = ''
                    scope.item.email = ''
                }

                function checkPhone() {
                    return $http.get('/api/1/user/phone_test', {
                        params: {
                            country: scope.item.country,
                            phone: scope.item.phone
                        }, errorMessage: true
                    })
                }

                function getUserByPhone() {
                    return $http.get('/api/1/user/admin/search', {
                        params: {
                            country: scope.item.country,
                            phone: scope.item.phone,
                            role: JSON.stringify(_.pluck(permissions, 'value').concat(['beta_renting']).concat(['']))
                        }, errorMessage: true
                    })
                }

            }
        }
    })
