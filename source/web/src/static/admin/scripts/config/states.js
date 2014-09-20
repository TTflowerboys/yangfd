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

        var propertyResolve = {
            api: function (propertyApi) {
                return propertyApi
            },
            enumApi: function (enumApi) {
                return enumApi
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
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
        /**
         * property
         */
            .state('dashboard.property', {
                url: '/property',
                templateUrl: '/static/admin/templates/dashboard.property.tpl.html',
                controller: 'ctrlPropertyList',
                resolve: propertyResolve
            })
            .state('dashboard.property.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.property.create.tpl.html',
                controller: 'ctrlPropertyCreate',
                resolve: propertyResolve
            })

            .state('dashboard.property.detail', {
                url: '/:id',
                templateUrl: '/static/admin/templates/dashboard.property.detail.tpl.html',
                controller: 'ctrlDetail',
                resolve: propertyResolve
            })
            .state('dashboard.property.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.property.edit.tpl.html',
                controller: 'ctrlPropertyEdit',
                resolve: propertyResolve
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
        /**
         * operation.news
         */
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
            .state('dashboard.operation.news.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.operation.news.edit.tpl.html',
                controller: 'ctrlEdit',
                resolve: {
                    api: function (newsApi) {
                        return newsApi
                    }
                }
            })
            .state('dashboard.operation.news.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.operation.news.create.tpl.html',
                controller: 'ctrlCreate',
                resolve: {
                    api: function (newsApi) {
                        return newsApi
                    }
                }
            })
            .state('dashboard.operation.news.detail', {
                url: '/:id',
                templateUrl: '/static/admin/templates/dashboard.operation.news.detail.tpl.html',
                controller: 'ctrlDetail',
                resolve: {
                    api: function (newsApi) {
                        return newsApi
                    }
                }
            })
        /**
         * dashboard.intention
         */
            .state('dashboard.intention', {
                url: '/intention',
                templateUrl: '/static/admin/templates/dashboard.intention.tpl.html',
                controller: 'ctrlList',
                resolve: {
                    api: function (newsApi) {
                        return newsApi
                    }
                }
            })


            .state('dashboard.support', {
                url: '/support',
                templateUrl: '/static/admin/templates/dashboard.support.tpl.html',
                controller: 'ctrlList',
                resolve: {
                    api: function (supportApi) {
                        return supportApi
                    }
                }
            })

        /**
         * users
         */
            .state('dashboard.users', {
                url: '/users',
                templateUrl: '/static/admin/templates/dashboard.users.tpl.html',
                controller: 'ctrlList',
                resolve: {
                    api: function (userApi) {
                        return userApi
                    }
                }
            })
            .state('dashboard.users.detail', {
                url: '/:id',
                templateUrl: '/static/admin/templates/dashboard.users.detail.tpl.html',
                controller: 'ctrlDetail',
                resolve: {
                    api: function (userApi) {
                        return userApi
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
