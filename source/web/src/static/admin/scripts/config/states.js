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
            }
        }

        var intentionResolve = {
            api: function (intentionApi) {
                return intentionApi
            },
            adminApi: function (adminApi) {
                return adminApi
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
                templateUrl: '/static/admin/templates/forgot_password.tpl.html',
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
            .state('dashboard.enums.country', {
                url: '/country',
                templateUrl: '/static/admin/templates/dashboard.enums.country.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.country.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.enums.country.create.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.country.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.enums.country.edit.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.city', {
                url: '/city',
                templateUrl: '/static/admin/templates/dashboard.enums.city.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.city.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.enums.city.create.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.city.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.enums.city.edit.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.normal', {
                url: '/normal',
                templateUrl: '/static/admin/templates/dashboard.enums.normal.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.normal.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.enums.normal.create.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.normal.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.enums.normal.edit.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.budget', {
                url: '/budget',
                templateUrl: '/static/admin/templates/dashboard.enums.budget.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.budget.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.enums.budget.create.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.budget.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.enums.budget.edit.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.intention', {
                url: '/intention',
                templateUrl: '/static/admin/templates/dashboard.enums.intention.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.intention.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.enums.intention.create.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.intention.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.enums.intention.edit.tpl.html',
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
                controller: 'ctrlPropertyDetail',
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
                controller: 'ctrlNewsEdit',
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
         * operation.content
         */
            .state('dashboard.operation.contents', {
                url: '/contents',
                templateUrl: '/static/admin/templates/dashboard.operation.contents.tpl.html',
                controller: 'ctrlOperationContent',
                resolve: {
                    channelApi: function (channelApi) {
                        return channelApi
                    },
                    adApiFactory: function (adApiFactory) {
                        return adApiFactory
                    }
                }
            })
            .state('dashboard.operation.contents.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.operation.contents.create.tpl.html',
                controller: 'ctrlCreate',
                resolve: {
                    api: function (adApiFactory) {
                        // Create api call don't need channel name
                        // TODO: rewrite adApiFactory to remove channel from initial params
                        return adApiFactory('')
                    }
                }
            })
            .state('dashboard.operation.contents.detail', {
                url: '/:channel/:id',
                templateUrl: '/static/admin/templates/dashboard.operation.contents.detail.tpl.html',
                controller: 'ctrlDetail',
                resolve: {
                    api: function (adApiFactory, $stateParams) {
                        return adApiFactory($stateParams.channel)
                    }
                }
            })
            .state('dashboard.operation.contents.edit', {
                url: '/:channel/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.operation.contents.edit.tpl.html',
                controller: 'ctrlContentEdit',
                resolve: {
                    api: function (adApiFactory, $stateParams) {
                        return adApiFactory($stateParams.channel)
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
                resolve: intentionResolve
            })
            .state('dashboard.intention.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.intention.create.tpl.html',
                controller: 'ctrlIntentionCreate',
                resolve: intentionResolve
            })
            .state('dashboard.intention.detail', {
                url: '/:id',
                templateUrl: '/static/admin/templates/dashboard.intention.detail.tpl.html',
                controller: 'ctrlDetail',
                resolve: intentionResolve
            })
            .state('dashboard.intention.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.intention.edit.tpl.html',
                controller: 'ctrlIntentionEdit',
                resolve: intentionResolve
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
            .state('dashboard.support.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.support.create.tpl.html',
                controller: 'ctrlCreate',
                resolve: {
                    api: function (supportApi) {
                        return supportApi
                    }
                }
            })
            .state('dashboard.support.detail', {
                url: '/:id',
                templateUrl: '/static/admin/templates/dashboard.support.detail.tpl.html',
                controller: 'ctrlDetail',
                resolve: {
                    api: function (supportApi) {
                        return supportApi
                    }
                }
            })
            .state('dashboard.support.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.support.edit.tpl.html',
                controller: 'ctrlSupportEdit',
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
                controller: 'ctrlUserProfile',
                resolve: {
                    api: function (userApi) {
                        return userApi
                    }
                }
            })
            .state('dashboard.users.detail.favs', {
                url: '/favs',
                templateUrl: '/static/admin/templates/dashboard.users.detail.favs.tpl.html',
                controller: 'ctrlList',
                resolve: {
                    api: function (userFavApi) {
                        return userFavApi
                    }
                }
            })
            .state('dashboard.users.detail.intentions', {
                url: '/intentions',
                templateUrl: '/static/admin/templates/dashboard.users.detail.intentions.tpl.html',
                controller: 'ctrlList',
                resolve: {
                    api: function (userIntentionApi) {
                        return userIntentionApi
                    }
                }
            })
            .state('dashboard.users.detail.boughts', {
                url: '/boughts',
                templateUrl: '/static/admin/templates/dashboard.users.detail.boughts.tpl.html',
                controller: 'ctrlList',
                resolve: {
                    api: function (userBoughtApi) {
                        return userBoughtApi
                    }
                }
            })
            .state('dashboard.users.detail.supports', {
                url: '/supports',
                templateUrl: '/static/admin/templates/dashboard.users.detail.supports.tpl.html',
                controller: 'ctrlList',
                resolve: {
                    api: function (userSupportApi) {
                        return userSupportApi
                    }
                }
            })
            .state('dashboard.message', {
                url: '/message',
                templateUrl: '/static/admin/templates/dashboard.message.tpl.html',
                controller: 'ctrlMessageList',
                resolve: {
                    api: function (apiFactory) {
                        return apiFactory('message')
                    }
                }
            })
            .state('dashboard.message.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.message.create.tpl.html',
                controller: 'ctrlCreate',
                resolve: {
                    api: function (apiFactory) {
                        return apiFactory('message')
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
