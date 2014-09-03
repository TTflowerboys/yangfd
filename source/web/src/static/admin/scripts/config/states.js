/* Created by frank on 14-8-14. */

angular.module('app')
    .config(function ($stateProvider) {

        $stateProvider
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: '/static/admin/templates/dashboard.tpl.html',
                controller: 'ctrlDashboard'
            })

            .state('signIn', {
                url: '/signIn?from',
                templateUrl: '/static/admin/templates/signIn.tpl.html',
                controller: 'ctrlSignIn'
            })
            .state('signUp', {
                url: '/signUp?from',
                templateUrl: '/static/admin/templates/signUp.tpl.html',
                controller: 'ctrlSignUp'
            })
            .state('forgot', {
                url: '/forgot?from',
                templateUrl: '/static/admin/templates/forgotPassword.tpl.html',
                controller: 'ctrlForgotPassword'
            })

        /**
         * admins 管理员的管理
         */
            .state('dashboard.admins', {
                url: '/admins',
                templateUrl: '/static/admin/templates/dashboard.admins.tpl.html',
                controller: 'ctrlList',
                resolve: {
                    api: function (adminApi) {
                        return adminApi
                    }
                }
            })
            .state('dashboard.admins.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.admins.create.tpl.html',
                controller: 'ctrlCreate',
                resolve: {
                    api: function (adminApi) {
                        return adminApi
                    }
                }
            })

        /**
         * estate
         */
            .state('dashboard.estate', {
                url: '/estate',
                templateUrl: '/static/admin/templates/dashboard.estate.tpl.html',
                controller: 'ctrlList',
                resolve: {
                    api: function (adminApi) {
                        return adminApi
                    }
                }
            })
            .state('dashboard.estate.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.estate.create.tpl.html',
                controller: 'ctrlCreate',
                resolve: {
                    api: function (adminApi) {
                        return adminApi
                    }
                }
            })
    })
