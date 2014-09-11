/* Created by frank on 14-8-14. */

angular.module('app')
    .config(function ($stateProvider) {
        var adminResolve = {
            api: function (adminApi) {
                return adminApi
            }
        }

        var enumResolve = {
            api: function (enumApi) {
                return enumApi
            }
        }

        var estateResolve = {
            api: function (estateApi) {
                return estateApi
            },
            enumApi: function (apiFactory) {
                return apiFactory('enum')
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
         * enums 的管理
         */
            .state('dashboard.enums', {
                url: '/enums',
                templateUrl: '/static/admin/templates/dashboard.enums.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.enums.create.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.enums.edit.tpl.html',
                controller: 'ctrlEdit',
                resolve: enumResolve
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
                controller: 'ctrlProperty',
                resolve: estateResolve
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

        /**
         * operation 运营管理
         */
            .state('dashboard.operation', {
                url: '/operation',
                templateUrl: '/static/admin/templates/dashboard.operation.tpl.html'
            })
            .state('dashboard.operation.wiki', {
                url: '/wiki',
                template: '<div>Wiki</div>'
            })
            .state('dashboard.operation.news', {
                url: '/news',
                templateUrl: '/static/admin/templates/dashboard.operation.news.tpl.html',
                controller: 'ctrlList',
                resolve: {
                    api: function (newsApi) {
                        return newsApi
                    }
                }
            })

        /**
         * others
         */
            .state('noPermission', {
                url: '/noPermission',
                templateUrl: '/static/admin/templates/no_permission.html'
            })
    })
