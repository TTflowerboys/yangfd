/**
 * Created by Michael on 14/9/2.
 */

angular.module('app')
    .directive('loadExistingAdmin', function ($http, misc) {

        return {
            restrict: 'AE',
            link: function (scope, elm, attrs) {
                var delayer
                scope.$watch('item.phone', function (value) {
                    if(!value || value.length<=5){
                        if(delayer){delayer.cancel()}
                        return
                    }
                    if(!delayer){
                        delayer = new misc.Delayer({
                            task: function () {
                                scope.isCheckingPhone = true
                                checkPhone().success(function () {
                                    getUserByPhone().success(function (data) {
                                        //throw 'not completed'
                                        var value = data.val[0] || {}
                                        value.nickname = 'chou'
                                        value.email = 'lklsdjl@slkdj.com'

                                        angular.extend(scope.item,value)
                                        scope.existingItem = value

                                    }).error(onNoExistingUser)['finally'](function () {
                                        setTimeout(function () {
                                            scope.isCheckingPhone = false
                                        },200)
                                    })
                                }).error(function () {
                                    onNoExistingUser()
                                    setTimeout(function () {
                                        scope.isCheckingPhone = false
                                    },200)
                                })
                            },
                            delay: 300
                        })
                    }else{
                        delayer.update()
                    }

                })

                function onNoExistingUser() {
                    scope.existingItem = {}
                    scope.item.nickname = ''
                    scope.item.email = ''
                }

                function checkPhone() {
                    return $http.get('/api/1/user/phone_test',{
                        params:{
                            country:scope.item.country,
                            phone:scope.item.phone
                        }
                    })
                }

                function getUserByPhone() {
                    return $http.get('/api/1/user/search',{
                        params:{
                            country:scope.item.country,
                            phone:scope.item.phone
                        }
                    })
                }

            }
        }
    })