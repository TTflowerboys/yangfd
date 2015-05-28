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

        var rentResolve = {
            api: function (rentApi) {
                return rentApi
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

        var newsResolve = {
            api: function (newsApi) {
                return newsApi
            }
        }

        var supportResolve = {
            api: function (supportApi) {
                return supportApi
            }
        }

        var plotResolve = {
            api: function (apiFactory) {
                return apiFactory('plot')
            }
        }

        var reportResolve = {
            api: function (apiFactory) {
                return apiFactory('report')
            }
        }

        var crowdfundingResolve = {
            api: function (crowdfundingApi) {
                return crowdfundingApi
            }
        }

        var shopResolve = {
            api: function (shopApi) {
                return shopApi
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
            .state('dashboard.enums.state', {
                url: '/state',
                templateUrl: '/static/admin/templates/dashboard.enums.state.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.state.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.enums.state.create.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.state.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.enums.state.edit.tpl.html',
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
            .state('dashboard.enums.building_area', {
                url: '/building_area',
                templateUrl: '/static/admin/templates/dashboard.enums.building_area.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.building_area.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.enums.building_area.create.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.building_area.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.enums.building_area.edit.tpl.html',
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
            .state('dashboard.enums.room_count', {
                url: '/room_count',
                templateUrl: '/static/admin/templates/dashboard.enums.room_count.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.room_count.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.enums.room_count.create.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.room_count.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.enums.room_count.edit.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.rent_budget', {
                url: '/rent_budget',
                templateUrl: '/static/admin/templates/dashboard.enums.rent_budget.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.rent_budget.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.enums.rent_budget.create.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.rent_budget.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.enums.rent_budget.edit.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
        /**
         * 房产
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
         * 出租房数据管理
         */
            .state('dashboard.rent', {
                url: '/rent',
                templateUrl: '/static/admin/templates/dashboard.rent.tpl.html',
                controller: 'ctrlRentList',
                resolve: rentResolve
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
                controller: 'ctrlOperationNews'
            })
            .state('dashboard.operation.news.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.operation.news.edit.tpl.html',
                controller: 'ctrlNewsEdit',
                resolve: newsResolve
            })
            .state('dashboard.operation.news.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.operation.news.create.tpl.html',
                controller: 'ctrlCreate',
                resolve: newsResolve
            })
            .state('dashboard.operation.news.detail', {
                url: '/:id',
                templateUrl: '/static/admin/templates/dashboard.operation.news.detail.tpl.html',
                controller: 'ctrlDetail',
                resolve: newsResolve
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
         * 投资意向单
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
        /***
         * 客服单
         */
            .state('dashboard.support', {
                url: '/support',
                templateUrl: '/static/admin/templates/dashboard.support.tpl.html',
                controller: 'ctrlList',
                resolve: supportResolve
            })
            .state('dashboard.support.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.support.create.tpl.html',
                controller: 'ctrlCreate',
                resolve: supportResolve
            })
            .state('dashboard.support.detail', {
                url: '/:id',
                templateUrl: '/static/admin/templates/dashboard.support.detail.tpl.html',
                controller: 'ctrlDetail',
                resolve: supportResolve
            })
            .state('dashboard.support.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.support.edit.tpl.html',
                controller: 'ctrlSupportEdit',
                resolve: supportResolve
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
            .state('dashboard.users.detail.logs', {
                url: '/logs',
                templateUrl: '/static/admin/templates/dashboard.users.detail.logs.tpl.html',
                controller: 'ctrlList',
                resolve: {
                    api:function (userLogApi) {
                        return userLogApi
                    }
                }
            })
            .state('dashboard.users.detail.orders', {
                url: '/orders',
                templateUrl: '/static/admin/templates/dashboard.users.detail.orders.tpl.html',
                controller: 'ctrlList',
                resolve: {
                    api:function (userOrderApi) {
                        return userOrderApi
                    }
                }
            })
        /**
         * 系统消息
         * */
            .state('dashboard.message', {
                url: '/message',
                templateUrl: '/static/admin/templates/dashboard.message.tpl.html',
                controller: 'ctrlMessageList',
                resolve: {
                    api: function (messageApi) {
                        return messageApi
                    }
                }
            })
            .state('dashboard.message.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.message.create.tpl.html',
                controller: 'ctrlCreate',
                resolve: {
                    api: function (messageApi) {
                        return messageApi
                    }
                }
            })
        /***
         * 销售管理
         */
            .state('dashboard.sales', {
                url: '/sales',
                templateUrl: '/static/admin/templates/dashboard.sales.tpl.html'
            })
        /**
         * 物业管理
         */
            .state('dashboard.sales.plot', {
                url: '/plot',
                templateUrl: '/static/admin/templates/dashboard.sales.plot.tpl.html',
                controller: 'ctrlPlotList',
                resolve: plotResolve
            })
            .state('dashboard.sales.plot.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.sales.plot.create.tpl.html',
                controller: 'ctrlPropertyCreate',
                resolve: plotResolve
            })
            .state('dashboard.sales.plot.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.sales.plot.edit.tpl.html',
                controller: 'ctrlPlotEdit',
                resolve: plotResolve
            })
        /**
         * 房源信息
         */
            .state('dashboard.sales.housing', {
                url: '/housing',
                templateUrl: '/static/admin/templates/dashboard.sales.housing.tpl.html',
                controller: 'ctrlHousingList',
                resolve: propertyResolve
            })
            .state('dashboard.sales.housing.detail', {
                url: '/:id',
                templateUrl: '/static/admin/templates/dashboard.property.detail.tpl.html',
                controller: 'ctrlHousingDetail',
                resolve: propertyResolve
            })
            .state('dashboard.sales.housing.plot', {
                url: '/plot/:id',
                templateUrl: '/static/admin/templates/dashboard.sales.housing.plot.tpl.html',
                controller: 'ctrlHousingPlot',
                resolve: plotResolve
            })
        /***
         * 街区报告
         */
            .state('dashboard.report', {
                url: '/report',
                templateUrl: '/static/admin/templates/dashboard.report.tpl.html',
                controller: 'ctrlReportList',
                resolve: reportResolve
            })
            .state('dashboard.report.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.report.create.tpl.html',
                controller: 'ctrlReportCreate',
                resolve: reportResolve
            })
            .state('dashboard.report.detail', {
                url: '/:id',
                templateUrl: '/static/admin/templates/dashboard.report.detail.tpl.html',
                controller: 'ctrlDetail',
                resolve: reportResolve
            })
            .state('dashboard.report.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.report.edit.tpl.html',
                controller: 'ctrlReportEdit',
                resolve: reportResolve
            })
        /***
         * 微信
         */
            .state('dashboard.weixin', {
                url: '/weixin',
                templateUrl: '/static/admin/templates/dashboard.weixin.tpl.html'
            })
            .state('dashboard.weixin.menu', {
                url: '/menu',
                templateUrl: '/static/admin/templates/dashboard.weixin.menu.tpl.html',
                controller: 'ctrlWeixinMenu',
                resolve: {
                    api: function (weixinApi) {
                        return weixinApi
                    }
                }
            })
        /***
         * 众筹
         */
            .state('dashboard.crowdfunding', {
                url: '/crowdfunding',
                templateUrl: '/static/admin/templates/dashboard.crowdfunding.tpl.html',
                controller: 'ctrlList',
                resolve: shopResolve
            })
            .state('dashboard.crowdfunding.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.crowdfunding.create.tpl.html',
                controller: 'ctrlCreate',
                resolve: shopResolve
            })
            .state('dashboard.crowdfunding.edit', {
                url: '/:shop_id/edit',
                templateUrl: '/static/admin/templates/dashboard.crowdfunding.edit.tpl.html',
                controller: 'ctrlEdit',
                resolve: shopResolve
            })
            .state('dashboard.crowdfunding.item', {
                url: '/:shop_id',
                templateUrl: '/static/admin/templates/dashboard.crowdfunding.item.tpl.html',
                controller: 'ctrlCrowdfundingList',
                resolve: crowdfundingResolve
            })
            .state('dashboard.crowdfunding.item.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.crowdfunding.item.create.tpl.html',
                controller: 'ctrlCrowdfundingCreate',
                resolve: crowdfundingResolve
            })
            .state('dashboard.crowdfunding.item.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.crowdfunding.item.edit.tpl.html',
                controller: 'ctrlCrowdfundingEdit',
                resolve: crowdfundingResolve
            })
            .state('dashboard.crowdfunding.item.detail', {
                url: '/:id',
                templateUrl: '/static/admin/templates/dashboard.crowdfunding.item.detail.tpl.html',
                controller: 'ctrlCrowdfundingDetail',
                resolve: crowdfundingResolve
            })
        /**
         * 订单
         */
            .state('dashboard.orders', {
                url: '/orders',
                templateUrl: '/static/admin/templates/dashboard.orders.tpl.html',
                controller: 'ctrlOrderSearch',
                resolve: {
                    api: function (orderApi) {
                        return orderApi
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
