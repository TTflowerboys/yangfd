/* Created by frank on 14-8-14. */

(function () {

    function userApi($http, $state, $q) {
        var _user
        return {
            signIn: function (user) {
                var params = _.pick(user, 'country', 'phone', 'password')
                params.password = Base64.encode(params.password)
                return $http.post('/api/1/user/login', params, {errorMessage: true})
                    .success(function (data, status, headers, config) {
                        _user = data.val
                    })
            },
            checkLogin: function () {
                var deferred = $q.defer()
                if (_user) {
                    deferred.resolve(_user)
                } else {
                    $http.get('/api/1/user', {errorMessage: true})
                        .success(function (data, status, headers, config) {
                            _user = data.val
                            deferred.resolve(_user)
                        })
                        .error(function () {
                            deferred.reject()
                        })
                }

                return deferred.promise
            },
            sendVerification: function (user) {
                var params = _.pick(user, 'country', 'phone')
                return $http.post('/api/1/user/sms_verification/send', params, {errorMessage: true})

            },
            resetPassword: function (id, code, password) {
                var params = {}
                params.code = code
                params.new_password = Base64.encode(password)

                return $http.post('/api/1/user/' + id + '/sms_reset_password', params, {errorMessage: true})

            },
            addAdminUser: function (user) {
                var params = _.pick(user, 'country', 'phone', 'role', 'nickname', 'email')
                return $http.post('/api/1/user/admin/add', params)
            },
            testPhone: function (user) {
                var params = _.pick(user, 'country', 'phone')
                return $http.post('/api/1/user/phone_test', params)
            },
            checkUserExist: function (user) {
                var deferred = $q.defer()
                var params = _.pick(user, 'country', 'phone')
                $http.post('/api/1/user/check_exist', params, {errorMessage: true})
                    .success(function (data, status, headers, config) {
                        deferred.resolve()
                    }).error(function () {
                        deferred.reject()
                    })
                return deferred.promise
            }
        }

    }

    angular.module('app').factory('userApi', userApi)
})()
