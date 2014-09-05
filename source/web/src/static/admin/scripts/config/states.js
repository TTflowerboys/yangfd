/* Created by frank on 14-8-14. */

angular.module('app')
    .config(function ($stateProvider) {
        var adminResolve = {
            api: function (adminApi) {
                return adminApi
            }
        }

        var estateResolve = {
            api: function (estateApi) {
                return estateApi
            }
        }

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
                resolve: adminResolve
            })
            .state('dashboard.admins.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.admins.create.tpl.html',
                controller: 'ctrlCreate',
                resolve: adminResolve
            })

        /**
         * estate
         */
            .state('dashboard.estate', {
                url: '/estate',
                templateUrl: '/static/admin/templates/dashboard.estate.tpl.html',
                controller: 'ctrlList',
                resolve: estateResolve
            })
            .state('dashboard.estate.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.estate.create.tpl.html',
                controller: 'ctrlCreate',
                resolve: estateResolve
            })
            .state('noPermission', {
                url: '/noPermission',
                templateUrl: '/static/admin/templates/no_permission.html'
            })
            .state('dashboard.estate.detail', {
                url: '/:id',
                templateUrl: '/static/admin/templates/dashboard.estate.detail.tpl.html',
                controller: 'ctrlDetail',
                resolve: estateResolve
            })
            .state('dashboard.estate.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.estate.edit.tpl.html',
                controller: 'ctrlEdit',
                resolve: estateResolve
            })
    })
