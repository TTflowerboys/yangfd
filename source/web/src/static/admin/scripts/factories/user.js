/* Created by frank on 14-8-14. */

(function () {

    function userApi($http, $state, $q) {
        var user
        return {
            signIn: function (email, password) {
                var data = {}
                data.email = email
                data.password = Base64.encode(password)

                return $http.post('/api/1/user/login', data)
                    .success(function (data, status, headers, config) {
                        user = data.val
                    })
            },
            checkLogin: function () {
                var deferred = $q.defer()

                if (user) {
                    deferred.resolve(user)
                } else {
                    $http.get('/api/1/user')
                        .success(function (data) {
                            user = data
                            deferred.resolve(user)
                        })
                        .error(function () {
                            deferred.reject()
                        })
                }

                return deferred.promise
            }
        }

    }

    angular.module('app').factory('userApi', userApi)
})()
