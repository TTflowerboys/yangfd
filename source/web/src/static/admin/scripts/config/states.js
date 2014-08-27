/* Created by frank on 14-8-14. */

angular.module('app')
    .config(function ($stateProvider) {
        var projectResolve = {
            api: function (apiFactory) {
                return apiFactory('project')
            }
        }
        var newsResolve = {
            api: function (apiFactory) {
                return apiFactory('news')
            }
        }
        var teamResolve = {
            api: function (apiFactory) {
                return apiFactory('member')
            }
        }

        var partnersResolve = {
            api: function (apiFactory) {
                return apiFactory('partner')
            }
        }

        $stateProvider
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: '/static/admin/templates/dashboard.tpl.html',
                controller: 'ctrlDashboard'
            })
        /**
         * projects
         */
            .state('dashboard.projects', {
                url: '/projects',
                templateUrl: '/static/admin/templates/dashboard.projects.tpl.html',
                controller: 'ctrlList',
                resolve: projectResolve
            })
            .state('dashboard.projects.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.projects.create.tpl.html',
                controller: 'ctrlCreate',
                resolve: projectResolve
            })
            .state('dashboard.projects.detail', {
                url: '/:id',
                templateUrl: '/static/admin/templates/dashboard.projects.detail.tpl.html',
                controller: 'ctrlDetail',
                resolve: projectResolve
            })
            .state('dashboard.projects.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.projects.edit.tpl.html',
                controller: 'ctrlEdit',
                resolve: projectResolve
            })

        /**
         * news
         */

            .state('dashboard.news', {
                url: '/news',
                templateUrl: '/static/admin/templates/dashboard.news.tpl.html',
                controller: 'ctrlList',
                resolve: newsResolve
            })
            .state('dashboard.news.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.news.create.tpl.html',
                controller: 'ctrlCreate',
                resolve: newsResolve
            })
            .state('dashboard.news.detail', {
                url: '/:id',
                templateUrl: '/static/admin/templates/dashboard.news.detail.tpl.html',
                controller: 'ctrlDetail',
                resolve: newsResolve
            })
            .state('dashboard.news.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.news.edit.tpl.html',
                controller: 'ctrlEdit',
                resolve: newsResolve
            })

        /**
         * team
         */
            .state('dashboard.team', {
                url: '/team',
                templateUrl: '/static/admin/templates/dashboard.team.tpl.html',
                controller: 'ctrlList',
                resolve: teamResolve
            })
            .state('dashboard.team.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.team.create.tpl.html',
                controller: 'ctrlCreate',
                resolve: teamResolve
            })
            .state('dashboard.team.detail', {
                url: '/:id',
                templateUrl: '/static/admin/templates/dashboard.team.detail.tpl.html',
                controller: 'ctrlDetail',
                resolve: teamResolve
            })
            .state('dashboard.team.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.team.edit.tpl.html',
                controller: 'ctrlEdit',
                resolve: teamResolve
            })

        /**
         * partners
         */

            .state('dashboard.partners', {
                url: '/partners',
                templateUrl: '/static/admin/templates/dashboard.partners.tpl.html',
                controller: 'ctrlList',
                resolve: partnersResolve
            })
            .state('dashboard.partners.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.partners.create.tpl.html',
                controller: 'ctrlCreate',
                resolve: partnersResolve
            })
            .state('dashboard.partners.detail', {
                url: '/:id',
                templateUrl: '/static/admin/templates/dashboard.partners.detail.tpl.html',
                controller: 'ctrlDetail',
                resolve: partnersResolve
            })
            .state('dashboard.partners.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.partners.edit.tpl.html',
                controller: 'ctrlEdit',
                resolve: partnersResolve
            })

        /**
         * Ad
         */

            .state('dashboard.allAds', {
                url: '/allAds',
                templateUrl: '/static/admin/templates/dashboard.allAds.tpl.html',
                controller: 'ctrlAllAds'
            })
            .state('dashboard.allAds.createOnAnyChannel', {
                url: '/createAny',
                templateUrl: '/static/admin/templates/dashboard.ad.createOnAnyChannel.tpl.html',
                controller: 'ctrlCreateAdOnAnyChannel',
                resolve: {
                    api: function ($stateParams, channelApiFactory) {
                        return channelApiFactory($stateParams.channel)
                    }
                }
            })

            .state('dashboard.ad', {
                url: '/ad/:channel',
                templateUrl: '/static/admin/templates/dashboard.ad.tpl.html',
                controller: 'ctrlList',
                resolve: {
                    api: function ($stateParams, channelApiFactory) {
                        return channelApiFactory($stateParams.channel)
                    }
                }
            })
            .state('dashboard.ad.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.ad.create.tpl.html',
                controller: 'ctrlCreate',
                resolve: {
                    api: function ($stateParams, channelApiFactory) {
                        return channelApiFactory($stateParams.channel)
                    }
                }
            })
            .state('dashboard.ad.detail', {
                url: '/:id',
                templateUrl: '/static/admin/templates/dashboard.ad.detail.tpl.html',
                controller: 'ctrlDetail',
                resolve: {
                    api: function ($stateParams, channelApiFactory) {
                        return channelApiFactory($stateParams.channel)
                    }
                }
            })
            .state('dashboard.ad.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.ad.edit.tpl.html',
                controller: 'ctrlEdit',
                resolve: {
                    api: function ($stateParams, channelApiFactory) {
                        return channelApiFactory($stateParams.channel)
                    }
                }
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
    })
