/* Created by frank on 14-8-14. */
/* globals _user:true */

(function () {

    function userApi($http, $q) {
        return {
            getAll: function (config) {
                return $http.get('/api/1/user/admin/search?has_role=false', config)
            },

            getOne: function (id, config) {
                return $http.get('/api/1/user/admin/' + id, config)
            },
            update: function (id, data, config) {
                data.user_id = id
                delete data.id
                return $http.post('/api/1/user/edit', data, config)
            },
            search: function (config) {
                return $http.get('/api/1/user/admin/search', config)
            },

            signIn: function (user) {
                var params = _.pick(user, 'country', 'phone', 'password')
                params.password = Base64.encode(params.password)
                return $http.post('/api/1/user/login', params, {errorMessage: true})
            },
            checkLogin: function () {
                var deferred = $q.defer()
                if (_user) {
                    deferred.resolve(_user)
                } else {
                    deferred.reject()
                }

                return deferred.promise
            },
            sendVerification: function (user) {
                var params = _.pick(user, 'country', 'phone')
                return $http.post('/api/1/user/sms_verification/send', params,
                    {successMessage: i18n('验证码已发送至你的手机'), errorMessage: true})

            },
            resetPassword: function (id, code, password) {
                var params = {}
                params.code = code
                params.new_password = Base64.encode(password)

                return $http.post('/api/1/user/' + id + '/sms_reset_password', params, {errorMessage: true})
                    .success(function (data, status, headers, config) {
                        _user = data.val
                    })

            },
            addAdminUser: function (user, config) {
                var params = _.pick(user, 'country', 'phone', 'role', 'nickname', 'email')
                return $http.post('/api/1/user/admin/add', params, config)
            },
            testPhone: function (user) {
                var params = _.pick(user, 'country', 'phone')
                return $http.post('/api/1/user/phone_test', params)
            },
            checkUserExist: function (user) {
                var params = _.pick(user, 'country', 'phone')
                return $http.post('/api/1/user/check_exist', params, {errorMessage: true})
            },
            getCurrentUser: function () {
                return _user
            },
            suspend: function (id, config) {
                return $http.get('/api/1/user/' + id + '/suspend', config)
            },
            activate: function (id, config) {
                return $http.get('/api/1/user/' + id + '/activate', config)
            },
            assignReferralCode: function (params, config) {
                return $http.post('/api/1/user/assign_referral_code', params, config)
            },
            getLog: function (id, config) {
                return $http.post('/api/1/log/search', {user_id: id, per_page: 1}, config)
            }

        }

    }

    angular.module('app').factory('userApi', userApi)
})()
