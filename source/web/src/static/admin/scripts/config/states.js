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

        var indexRuleResolve = {
            api: function (indexRuleApi) {
                return indexRuleApi
            }
        }

        var nexmoNumberResolve = {
            api: function (nexmoNumberApi) {
                return nexmoNumberApi
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
            },
            propertyApi: function (propertyApi){
                return propertyApi
            }
        }

        var rentIntentionResolve = {
            api: function (rentIntentionApi) {
                return rentIntentionApi
            }
        }

        var rentRequestIntentionResolve = {
            api: function (rentRequestIntentionApi) {
                return rentRequestIntentionApi
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

        var requestRentResolve = {
            api: function (requestRentApi) {
                return requestRentApi
            }
        }

        var requestSellResolve = {
            api: function (requestSellApi) {
                return requestSellApi
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
            .state('dashboard.enums.rent_budget_item', {
                url: '/rent_budget_item',
                templateUrl: '/static/admin/templates/dashboard.enums.rent_budget_item.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.rent_budget_item.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.enums.rent_budget_item.create.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.rent_budget_item.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.enums.rent_budget_item.edit.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.hesa_university', {
                url: '/hesa_university',
                templateUrl: '/static/admin/templates/dashboard.enums.hesa_university.tpl.html',
                controller: 'ctrlEnums',
                resolve: enumResolve
            })
            .state('dashboard.enums.synonyms', {
                url: '/synonyms',
                templateUrl: '/static/admin/templates/dashboard.enums.synonyms.tpl.html',
                controller: 'ctrlIndexRule',
                resolve: indexRuleResolve
            })
            .state('dashboard.enums.user_dict', {
                url: '/user_dict',
                templateUrl: '/static/admin/templates/dashboard.enums.user_dict.tpl.html',
                controller: 'ctrlIndexRule',
                resolve: indexRuleResolve
            })
            .state('dashboard.enums.nexmo_number', {
                url: '/nexmo_number',
                templateUrl: '/static/admin/templates/dashboard.enums.nexmo_number.tpl.html',
                controller: 'ctrlList',
                resolve: nexmoNumberResolve
            })
            .state('dashboard.enums.nexmo_number.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.enums.nexmo_number.create.tpl.html',
                controller: 'ctrlCreate',
                resolve: nexmoNumberResolve
            })
            .state('dashboard.enums.nexmo_number.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.enums.nexmo_number.edit.tpl.html',
                controller: 'ctrlEdit',
                resolve: nexmoNumberResolve
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
                url: '/rent?code&type',
                templateUrl: '/static/admin/templates/dashboard.rent.tpl.html',
                controller: 'ctrlRentList',
                resolve: rentResolve
            })
            .state('dashboard.rent.detail', {
                url: '/:id',
                templateUrl: '/static/admin/templates/dashboard.rent.detail.tpl.html',
                controller: 'ctrlRentDetail',
                resolve: rentResolve
            })
            .state('dashboard.rent.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.rent.edit.tpl.html',
                controller: 'ctrlRentEdit',
                resolve: rentResolve
            })
            .state('dashboard.rent.digest', {
                url: '/:id/digest',
                templateUrl: '/static/admin/templates/dashboard.rent.digest.tpl.html',
                controller: 'ctrlRentDigest',
                resolve: rentResolve
            })
        /**
         * 出租意向单管理
         */
            .state('dashboard.rent_intention', {
                url: '/rent_intention',
                templateUrl: '/static/admin/templates/dashboard.rent_intention.tpl.html',
                controller: 'ctrlRentIntentionList',
                resolve: rentIntentionResolve
            })
            /*.state('dashboard.rent_intention.detail', {
                url: '/:id',
                templateUrl: '/static/admin/templates/dashboard.rent.rent_intention.tpl.html',
                controller: 'ctrlrentIntentionDetail',
                resolve: rentIntentionResolve
            })*/
        /**
         * 出租咨询申请单管理
         */
            .state('dashboard.rent_request_intention', {
                url: '/rent_request_intention?code&type&referral&dateFrom&dateTo',
                templateUrl: '/static/admin/templates/dashboard.rent_request_intention.tpl.html',
                controller: 'ctrlRentRequestIntentionList',
                resolve: rentRequestIntentionResolve
            })
            .state('dashboard.rent_request_intention.detail', {
                url: '/:id',
                templateUrl: '/static/admin/templates/dashboard.rent_request_intention.detail.tpl.html',
                controller: 'ctrlRentRequestIntentionDetail',
                resolve: rentRequestIntentionResolve
            })
        /**
         * 委托出租单管理
         */
            .state('dashboard.request_rent', {
                url: '/request_rent',
                templateUrl: '/static/admin/templates/dashboard.request_rent.tpl.html',
                controller: 'ctrlList',
                resolve: requestRentResolve
            })
        /**
         * 委托出售单管理
         */
            .state('dashboard.request_sell', {
                url: '/request_sell',
                templateUrl: '/static/admin/templates/dashboard.request_sell.tpl.html',
                controller: 'ctrlList',
                resolve: requestSellResolve
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
                url: '/users?code&type',
                templateUrl: '/static/admin/templates/dashboard.users.tpl.html',
                controller: 'ctrlUserList',
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
            .state('dashboard.users.detail.rent_intentions', {
                url: '/rent-intentions',
                templateUrl: '/static/admin/templates/dashboard.users.detail.rent_intentions.tpl.html',
                controller: 'ctrlRentIntentionList',
                resolve: {
                    api: function (userRentIntentionApi) {
                        return userRentIntentionApi
                    }
                }
            })
            .state('dashboard.users.detail.rent_request_intentions', {
                url: '/rent-request-intentions',
                templateUrl: '/static/admin/templates/dashboard.users.detail.rent_request_intentions.tpl.html',
                controller: 'ctrlUserRentRequestIntentionList',

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
            .state('dashboard.users.detail.logs_property', {
                url: '/logs_property',
                templateUrl: '/static/admin/templates/dashboard.users.detail.logs_property.tpl.html',
                controller: 'ctrlList',
                resolve: {
                    api:function (userLogPropertyApi) {
                        return userLogPropertyApi
                    }
                }
            })
            .state('dashboard.users.detail.logs_rent', {
                url: '/logs_rent',
                templateUrl: '/static/admin/templates/dashboard.users.detail.logs_rent.tpl.html',
                controller: 'ctrlList',
                resolve: {
                    api:function (userLogRentApi) {
                        return userLogRentApi
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
            .state('dashboard.users.detail.properties', {
                url: '/properties',
                templateUrl: '/static/admin/templates/dashboard.users.detail.properties.tpl.html',
                controller: 'ctrlList',
                resolve: {
                    api:function (userPropertyApi) {
                        return userPropertyApi
                    }
                }
            })
            .state('dashboard.users.detail.view_contact_info_properties', {
                url: '/view_contact_info_properties',
                templateUrl: '/static/admin/templates/dashboard.users.detail.view_contact_info_properties.tpl.html',
                controller: 'ctrlList',
                resolve: {
                    api:function (userViewContactInfoPropertyApi) {
                        return userViewContactInfoPropertyApi
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
        /***房源信息
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
         * 用戶申請入口
         * */
            .state('dashboard.subscribe', {
                url: '/subscribe',
                templateUrl: '/static/admin/templates/dashboard.subscribe.tpl.html'
            })
        /**
         * 邀请码
         * */
            .state('dashboard.subscribe.invitation', {
                url: '/invitation',
                templateUrl: '/static/admin/templates/dashboard.invitation.tpl.html',
                controller: 'ctrlInvitationList',
                resolve: {
                    api: function (subscribeApi) {
                        return subscribeApi
                    }
                }
            })
            .state('dashboard.subscribe.invitation.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.invitation.create.tpl.html',
                controller: 'ctrlInvitationCreate',
                resolve: {
                    api: function (subscribeApi) {
                        return subscribeApi
                    }
                }
            })
        /**
         * App版本管理
         * */
            .state('dashboard.appversion', {
                url: '/appversion',
                templateUrl: '/static/admin/templates/dashboard.appversion.tpl.html',
                controller: 'ctrlList',
                resolve: {
                    api: function (appversionApi) {
                        return appversionApi
                    }
                }
            })
            .state('dashboard.appversion.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.appversion.create.tpl.html',
                controller: 'ctrlCreate',
                resolve: {
                    api: function (appversionApi) {
                        return appversionApi
                    }
                }
            })
            .state('dashboard.appversion.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.appversion.edit.tpl.html',
                controller: 'ctrlEdit',
                resolve: {
                    api: function (appversionApi) {
                        return appversionApi
                    }
                }
            })
        /**
         * 优惠券管理
         * */
            .state('dashboard.venue', {
                url: '/venue',
                templateUrl: '/static/admin/templates/dashboard.venue.tpl.html',
                controller: 'ctrlList',
                resolve: {
                    api: function (venueApi) {
                        return venueApi
                    }
                }
            })
            .state('dashboard.venue.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.venue.create.tpl.html',
                controller: 'ctrlCreate',
                resolve: {
                    api: function (venueApi) {
                        return venueApi
                    }
                }
            })
            .state('dashboard.venue.edit', {
                url: '/:id/edit',
                templateUrl: '/static/admin/templates/dashboard.venue.edit.tpl.html',
                controller: 'ctrlVenueEdit',
                resolve: {
                    api: function (venueApi) {
                        return venueApi
                    }
                }
            })
            .state('dashboard.venue.detail', {
                url: '/:id',
                templateUrl: '/static/admin/templates/dashboard.venue.detail.tpl.html',
                controller: 'ctrlVenueProfile',
                resolve: {
                    api: function (venueApi) {
                        return venueApi
                    }
                }
            })
            .state('dashboard.venue.detail.deals', {
                url: '/deals',
                templateUrl: '/static/admin/templates/dashboard.venue.detail.deals.tpl.html',
                controller: 'ctrlDealList',
                resolve: {
                    api: function (dealApi) {
                        return dealApi
                    }
                }
            })
            .state('dashboard.venue.detail.deals.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.venue.detail.deals.create.tpl.html',
                controller: 'ctrlDealCreate',
                resolve: {
                    api: function (dealApi) {
                        return dealApi
                    }
                }
            })
            .state('dashboard.venue.detail.deals.edit', {
                url: '/:dealId/edit',
                templateUrl: '/static/admin/templates/dashboard.venue.detail.deals.edit.tpl.html',
                controller: 'ctrlDealEdit',
                resolve: {
                    api: function (dealApi) {
                        return dealApi
                    }
                }
            })

        /**
         * 统计数据
         * */
            .state('dashboard.statistics', {
                url: '/statistics',
                controller: 'ctrlStatistics',
                templateUrl: '/static/admin/templates/dashboard.statistics.tpl.html'
            })
            .state('dashboard.statistics.aggregation_overview', {
                url: '/',
                templateUrl: '/static/admin/templates/dashboard.statistics_overview.tpl.html',
                controller: 'ctrlStatisticsOverview',
                resolve: {
                    api: function (statisticsApi) {
                        return statisticsApi
                    }
                }
            })
            .state('dashboard.statistics.aggregation_general', {
                url: '/aggregation_general',
                templateUrl: '/static/admin/templates/dashboard.statistics_aggregation_general.tpl.html',
                controller: 'ctrlStatistics_aggregation_general',
                resolve: {
                    api: function (statisticsApi) {
                        return statisticsApi
                    }
                }
            })
            .state('dashboard.statistics.aggregation_rent_ticket', {
                url: '/aggregation_rent_ticket',
                templateUrl: '/static/admin/templates/dashboard.statistics_aggregation_rent_ticket.tpl.html',
                controller: 'ctrlStatistics_aggregation_rent_ticket',
                resolve: {
                    api: function (statisticsApi) {
                        return statisticsApi
                    }
                }
            })
            .state('dashboard.statistics.aggregation_rent_intention_ticket', {
                url: '/aggregation_rent_intention_ticket',
                templateUrl: '/static/admin/templates/dashboard.statistics_aggregation_rent_intention_ticket.tpl.html',
                controller: 'ctrlStatistics_aggregation_rent_intention_ticket',
                resolve: {
                    api: function (statisticsApi) {
                        return statisticsApi
                    }
                }
            })
            .state('dashboard.statistics.aggregation_property_view', {
                url: '/aggregation_property_view',
                templateUrl: '/static/admin/templates/dashboard.statistics_aggregation_property_view.tpl.html',
                controller: 'ctrlStatistics_aggregation_property_view',
                resolve: {
                    api: function (statisticsApi) {
                        return statisticsApi
                    }
                }
            })
            .state('dashboard.statistics.aggregation_email_detail', {
                url: '/aggregation_email_detail',
                templateUrl: '/static/admin/templates/dashboard.statistics_aggregation_email_detail.tpl.html',
                controller: 'ctrlStatistics_aggregation_email_detail',
                resolve: {
                    api: function (statisticsApi) {
                        return statisticsApi
                    }
                }
            })
            .state('dashboard.statistics.aggregation_favorite', {
                url: '/aggregation_favorite',
                templateUrl: '/static/admin/templates/dashboard.statistics_aggregation_favorite.tpl.html',
                controller: 'ctrlStatistics_aggregation_favorite',
                resolve: {
                    api: function (statisticsApi) {
                        return statisticsApi
                    }
                }
            })
            .state('dashboard.statistics.aggregation_view_contact', {
                url: '/aggregation_view_contact',
                templateUrl: '/static/admin/templates/dashboard.statistics_aggregation_view_contact.tpl.html',
                controller: 'ctrlStatistics_aggregation_view_contact',
                resolve: {
                    api: function (statisticsApi) {
                        return statisticsApi
                    }
                }
            })
            .state('dashboard.statistics.aggregation_rent_request', {
                url: '/aggregation_rent_request',
                templateUrl: '/static/admin/templates/dashboard.statistics_aggregation_rent_request.tpl.html',
                controller: 'ctrlStatistics_aggregation_rent_request',
                resolve: {
                    api: function (statisticsApi) {
                        return statisticsApi
                    }
                }
            })
            // user portrait
            .state('dashboard.user_portrait', {
                url: '/user_portrait',
                controller: 'user_portrait',
                templateUrl: '/static/admin/templates/dashboard.user_portrait.tpl.html'
            })
            .state('dashboard.user_portrait.user_portrait_general', {
                url: '/user_portrait_general',
                controller: 'user_portrait_general',
                templateUrl: '/static/admin/templates/dashboard.user_portrait_general.tpl.html',
                resolve: {
                    api: function (user_portrait_api) {
                        return user_portrait_api
                    }
                }
            })

        /**
         * Affiliate
         * */
            .state('dashboard.affiliate', {
                url: '/affiliate',
                templateUrl: '/static/admin/templates/dashboard.affiliate.tpl.html',
                controller: 'ctrlAffiliateList',
                resolve: {
                    api: function (userApi) {
                        return userApi
                    }
                }
            })
            .state('dashboard.affiliate.create', {
                url: '/create',
                templateUrl: '/static/admin/templates/dashboard.affiliate.create.tpl.html',
                controller: 'ctrlAffiliateCreate',
            })
            .state('dashboard.affiliate.detail', {
                url: '/:id',
                templateUrl: '/static/admin/templates/dashboard.affiliate.detail.tpl.html',
                controller: 'ctrlAffiliateDetail',
                resolve: {
                    api: function (userApi) {
                        return userApi
                    }
                }
            })
            .state('dashboard.affiliate.detail.users', {
                url: '/users?referralCode&dateFrom&dateTo',
                templateUrl: '/static/admin/templates/dashboard.affiliate.detail.users.tpl.html',
                controller: 'ctrlAffiliateDetailUsers',
                resolve: {
                    api: function (userApi) {
                        return userApi
                    }
                }
            })
            .state('dashboard.affiliate.detail.users.detail', {
                url: '/:user_id',
                templateUrl: '/static/admin/templates/dashboard.affiliate.detail.users.detail.tpl.html',
                controller: 'ctrlAffiliateUserDetail',
                resolve: {
                    api: function (userApi) {
                        return userApi
                    }
                }
            })
            .state('dashboard.affiliate.detail.success_requests', {
                url: '/success_requests?dateFrom&dateTo',
                templateUrl: '/static/admin/templates/dashboard.affiliate.detail.success_requests.tpl.html',
                controller: 'ctrlAffiliateDetailRequests',
                resolve: {
                    api: function (rentRequestIntentionApi) {
                        return rentRequestIntentionApi
                    }
                }
            })
            .state('dashboard.affiliate.detail.success_requests.detail', {
                url: '/:request_id',
                templateUrl: '/static/admin/templates/dashboard.affiliate.detail.success_requests.detail.tpl.html',
                controller: 'ctrlAffiliateDetailRequestsDetail',
                resolve: {
                    api: function (rentRequestIntentionApi) {
                        return rentRequestIntentionApi
                    }
                }
            })

            .state('dashboard.affiliate_role', {
                url: '/affiliate_role',
                templateUrl: '/static/admin/templates/dashboard.affiliate_role.tpl.html',
                controller: 'ctrlAffiliateRole',
                resolve: {
                    api: function (userApi) {
                        return userApi
                    }
                }
            })
        /**
         * Android订阅申请
         * */
            .state('dashboard.subscribe.android', {
                url: '/android',
                templateUrl: '/static/admin/templates/dashboard.subscription_android.tpl.html',
                controller: 'ctrlAndroidSubscriptionList',
                resolve: {
                    api: function (subscribeApi) {
                        return subscribeApi
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
            /*修改一下以去除缓存*/
            //.state('blank', {
            //    url: '/blank'
            //})
    }).run(function($rootScope, $stateParams) {
        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            $stateParams.fromParams = fromParams
        });
    });
