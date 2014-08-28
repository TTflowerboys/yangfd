/* Created by frank on 14-8-14. */

(function () {

    function userApi($http, $state, $q) {
        var user
        return {
            signIn: function (country, phone, password) {
                var data = {}
                data.country = country
                data.phone = phone
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
                    $http.get('/api/1/user', {errorMessage: true})
                        .success(function (data, status, headers, config) {
                            user = data.val
                            deferred.resolve(user)
                        })
                        .error(function () {
                            deferred.reject()
                        })
                }

                return deferred.promise
            },
            smsVerificationSend: function (country, phone) {
                var data = {}
                data.country = country
                data.phone = phone

                return $http.post('/api/1/user/sms_verification/send', data)

            },
            smsResetPassword: function (id, code, password) {
                var data = {}
                data.code = code
                data.new_password = Base64.encode(password)

                return $http.post('/api/1/user/' + id + '/sms_reset_password', data)

            }, adminUserAdd: function (country, phone, role, nickname, email) {
                var data = {}
                data.country = country
                data.phone = phone
                data.role = role
                data.nickname = nickname
                data.email = email
                return $http.post('/api/1/user/admin/add', data)
            }
        }

    }

    angular.module('app').factory('userApi', userApi)
})()
