(function () {

    function ctrlRentRequestIntentionDetail($scope, fctModal, api,  misc, $stateParams, growl, $rootScope, $state, couponApi, $q, miscApi) {
        $scope.api = api
        $scope.emailTemplate = {
            'assigned': [
                {
                    title: window.i18n('申请确认邮件'),
                    url: '/static/admin/emails/assigned_tenant.html',
                    role: 'tenant'
                }, {
                    title: window.i18n('租客给房东的邮件'),
                    url: '/static/admin/emails/assigned_landlord.html',
                    role: 'landlord'
                }
            ]
        }
        $scope.messageTemplate = {
            'assigned': [
                {
                    title: window.i18n('【租客】1.租客咨询单确认(咨询单内容正常)'),
                    url: '/static/admin/templates/message/assigned/tenant-1.html',
                    role: 'tenant'
                }, {
                    title: window.i18n('【租客】1.租客咨询单确认(租客要求实地看房)'),
                    url: '/static/admin/templates/message/assigned/tenant-2.html',
                    role: 'tenant'
                }, {
                    title: window.i18n('【租客】1.租客咨询单确认(租客索要联系方式)'),
                    url: '/static/admin/templates/message/assigned/tenant-3.html',
                    role: 'tenant'
                }, {
                    title: window.i18n('【房东】通知房东有租客咨询'),
                    url: '/static/admin/templates/message/assigned/landlord.html',
                    role: 'landlord'
                }
            ],
            'in_progress': [
                {
                    title: window.i18n('【房东】2.向房东发送租客的咨询单(租客要求视频看房)'),
                    url: '/static/admin/templates/message/in_progress/landlord-1.html',
                    role: 'landlord'
                }, {
                    title: window.i18n('【房东】3.回复房东的短信(房东索要租客联系方式)'),
                    url: '/static/admin/templates/message/in_progress/landlord-2.html',
                    role: 'landlord'
                }, {
                    title: window.i18n('【房东】3.回复房东的短信(房东提出看房Offer)'),
                    url: '/static/admin/templates/message/in_progress/landlord-3.html',
                    role: 'landlord'
                }, {
                    title: window.i18n('【租客】4.与租客的沟通(租客消息包含联系方式)'),
                    url: '/static/admin/templates/message/in_progress/tenant-2.html',
                    role: 'tenant'
                }, {
                    title: window.i18n('【租客】4.与租客的沟通(租客消息包含看房申请)'),
                    url: '/static/admin/templates/message/in_progress/tenant-3.html',
                    role: 'tenant'
                }, {
                    title: window.i18n('【房东】5.让房东录制视频(租客接受视频看房)'),
                    url: '/static/admin/templates/message/in_progress/landlord-4.html',
                    role: 'landlord'
                }, {
                    title: window.i18n('【租客】6.向租客发送视频后'),
                    url: '/static/admin/templates/message/in_progress/tenant-4.html',
                    role: 'tenant'
                }, {
                    title: window.i18n('【租客】7.租客聊天中提出可以预定（租客房东都没问怎么预定）'),
                    url: '/static/admin/templates/message/in_progress/tenant-6.html',
                    role: 'tenant'
                }, {
                    title: window.i18n('【房东】7.租客聊天中提出可以预定（租客房东都没问怎么预定）'),
                    url: '/static/admin/templates/message/in_progress/landlord-5.html',
                    role: 'landlord'
                }, {
                    title: window.i18n('【租客】7.租客聊天中提出可以预定（租客问预定流程，房东没问）'),
                    url: '/static/admin/templates/message/in_progress/tenant-7.html',
                    role: 'tenant'
                }, {
                    title: window.i18n('【房东】7.租客聊天中提出可以预定（租客问预定流程，房东没问）'),
                    url: '/static/admin/templates/message/in_progress/landlord-6.html',
                    role: 'landlord'
                }, {
                    title: window.i18n('【租客】7.租客聊天中提出可以预定（租客没问，房东问预订流程）'),
                    url: '/static/admin/templates/message/in_progress/tenant-8.html',
                    role: 'tenant'
                }, {
                    title: window.i18n('【房东】7.租客聊天中提出可以预定（租客没问，房东问预订流程）'),
                    url: '/static/admin/templates/message/in_progress/landlord-7.html',
                    role: 'landlord'
                }, {
                    title: window.i18n('【租客】7.租客聊天中提出可以预定（租客房东都问了预订流程）'),
                    url: '/static/admin/templates/message/in_progress/tenant-9.html',
                    role: 'tenant'
                }, {
                    title: window.i18n('【房东】7.租客聊天中提出可以预定（租客房东都问了预订流程）'),
                    url: '/static/admin/templates/message/in_progress/landlord-8.html',
                    role: 'landlord'
                }, {
                    title: window.i18n('【租客】8. 租客房东回复’是‘(租客回复‘是’)'),
                    url: '/static/admin/templates/message/in_progress/tenant-10.html',
                    role: 'tenant'
                }, {
                    title: window.i18n('【房东】8. 租客房东回复’是‘(房东回复‘是’)'),
                    url: '/static/admin/templates/message/in_progress/landlord-9.html',
                    role: 'landlord'
                }
            ]
        }
        $scope.newStatus = ''
        $scope.activeTab = 'dynamic'
        $scope.$watch('newStatus', function (newStatus) {
            if($scope.messageTemplate[newStatus]) {
                $scope.selectedMessageTemplate = $scope.messageTemplate[newStatus][0]
            } else if($scope.activeTab === 'messageTemplate') {
                $scope.switchTab('dynamic')
            }
            if($scope.emailTemplate[newStatus]) {
                $scope.selectedEmailTemplate = $scope.emailTemplate[newStatus][0]
            } else if($scope.activeTab === 'emailTemplate') {
                $scope.switchTab('dynamic')
            }
        })
        $scope.switchTab = function (name) {
            $scope.activeTab = name
        }
        $scope.host = misc.host
        $scope.currentTime = new Date().getTime()
        $scope.getItem = function () {
            api.getOne($stateParams.id, {errorMessage: true})
                .success(function (data) {
                    var item =  data.val
                    $scope.setDisableSms(item)
                    if(_.isArray(item.interested_rent_tickets) && !_.isEmpty(item.interested_rent_tickets[0])) {
                        miscApi.getShorturl(misc.host + '/property-to-rent/' + item.interested_rent_tickets[0].id).success(function (data) {
                            item.shorturl = data.val
                        })
                    }
                    item.age = (Date.now() - item.date_of_birth * 1000)/(365 * 24 * 60 * 60 * 1000)
                    // Get ip when ticket is created from log
                    item.log = {
                        ip: window.i18n('载入中...'),
                        link: ''
                    }
                    if(item.rent_deadline_time && item.rent_available_time && !_.isEmpty(item.interested_rent_tickets[0])) {
                        var day = (item.rent_deadline_time - item.rent_available_time) / 3600 / 24
                        if(day < 30) {
                            item.payment = parseInt(item.interested_rent_tickets[0].price.value_float / 7 * day / 4)
                        } else {
                            item.payment = parseInt(item.interested_rent_tickets[0].price.value_float)
                        }
                    }
                    $q.all([api.getLog(item.id), couponApi.search({
                        user_id: item.user.id
                    })])
                        .then(function (data) {
                            if(data[0].data.val && data[0].data.val.length && data[0].data.val[0].ip && data[0].data.val[0].ip.length) {

                                item.log = {
                                    ip: data[0].data.val[0].ip[0],
                                    link: 'http://www.ip2location.com/demo/' + data[0].data.val[0].ip[0]
                                }
                            } else {
                                item.log = {
                                    ip: window.i18n('无结果')
                                }
                            }
                            if(data[1].data.val && data[1].data.val.length) {
                                item.offer = data[1].data.val[0]
                            }
                            $scope.item  = item
                            $scope.getUnmatchhRequirements($scope.item)
                        })
                })
        }
        var itemFromParent = misc.findById($scope.$parent.list, $stateParams.id)
        $scope.$on('refreshRentRequestIntentionDetail', function () {
            $scope.getItem()
        })

        if (itemFromParent) {
            $scope.item = itemFromParent
            if(_.isArray($scope.item.interested_rent_tickets) && !_.isEmpty($scope.item.interested_rent_tickets[0])) {
                miscApi.getShorturl(misc.host + '/property-to-rent/' + $scope.item.interested_rent_tickets[0].id).success(function (data) {
                    $scope.item.shorturl = data.val
                })
            }
        } else {
            $scope.item = {}
            $scope.getItem()
        }

        $scope.isStudentHouse = function (rentTicket) {
            return rentTicket && rentTicket.property && rentTicket.property.property_type && rentTicket.property.property_type.slug === 'student_housing' && rentTicket.property.partner === true
        }

        $scope.updateItem = function (item) {
            return api.update(item).then(function (data) {
                if(_.isArray($scope.list)) {
                    $scope.list[$scope.list.indexOf(item)] = data.data.val
                }
                return data
            })
        }

        $scope.onRemove = function (item) {
            fctModal.show('Do you want to remove it?', undefined, function () {
                api.remove(item.id).success(function () {
                    if(_.isArray($scope.list)) {
                        $scope.list.splice($scope.list.indexOf(item), 1)
                    }
                    growl.addSuccessMessage($rootScope.renderHtml(i18n('操作成功')), {enableHtml: true})
                    $state.go($stateParams.from || '^', $stateParams.fromParams)
                })
            })
        }

        function forwardSuccessHandler(dynamic) {
            dynamic.messageInfo.status = 'success'
            $scope.updateDynamic(dynamic)
        }

        function forwardFailHandler(dynamic) {
            growl.addErrorMessage(window.i18n('短信发送失败，请稍后重试'), {enableHtml: true})
        }

        $scope.forwardToLandlord = function (dynamic) { //转发租客的短信给房东
            // todo 调用发短信接口成功后再添加下面的动态
            api.rentIntentionTicketSmsSend($scope.item.id, {
                text: dynamic.content,
                user_id: $scope.item.interested_rent_tickets[0].creator_user.id
            }, {
                errorMessage: true,
                successMessage: i18n('短信转发成功！')
            }).then(function (data) {
                forwardSuccessHandler(dynamic)
            }, function (data) {
                forwardFailHandler(dynamic)
            })

        }

        $scope.forwardToTenant = function (dynamic) { //转发房东的短信给租客
            // todo 调用发短信接口成功后再添加下面的动态
            api.rentIntentionTicketSmsSend($scope.item.id, {
                text: dynamic.content,
                user_id: $scope.item.creator_user.id
            }, {
                errorMessage: true,
                successMessage: i18n('短信转发成功！')
            }).then(function (data) {
                forwardSuccessHandler(dynamic)
            }, function (data) {
                forwardFailHandler(dynamic)
            })
        }

        $scope.rejectMessage = function (dynamic) { //拒绝转发一条短信
            dynamic.messageInfo.status = 'reject'
            $scope.updateDynamic(dynamic)
        }

        $scope.sendToLandlord = function (content) { //发送短信给房东
            // todo 调用发短信接口成功后再添加下面的动态
            api.rentIntentionTicketSmsSend($scope.item.id, {
                text: content,
                user_id: $scope.item.interested_rent_tickets[0].creator_user.id
            }, {
                errorMessage: true,
                successMessage: i18n('短信发送成功！')
            }).then(function () {
                $scope.addDynamic({
                    content: content,
                    type: 'message',
                    role: 'system',
                    messageInfo: {
                        status: 'success',
                        target: 'landlord'
                    }
                })
            })
        }

        $scope.sendToTenant = function (content) { //发送短信给租客
            // todo 调用发短信接口成功后再添加下面的动态
            api.rentIntentionTicketSmsSend($scope.item.id, {
                text: content,
                user_id: $scope.item.creator_user.id
            }, {
                errorMessage: true,
                successMessage: i18n('短信发送成功！')
            }).then(function () {
                $scope.addDynamic({
                    content: content,
                    type: 'message',
                    role: 'system',
                    messageInfo: {
                        status: 'success',
                        target: 'tenant'
                    }
                })
            })
        }

        function generateCustomFieldsByDynamic(dynamic){
            return _.reject($scope.item.custom_fields || [], function (field) {
                return field.key === 'dynamic'
            }).concat([dynamic])
        }

        $scope.addDynamic = function (data) {
            var dynamicData = {
                id: misc.generateUUID(),
                type: data.type, //type可以为'dynamic', 'message', 默认为'dynamic'
                role: data.role, //role可以为'system', 'landlord', 'tenant' 或 undefined
                /**
                * messageInfo是一个object或undefined, 示例如下
                * {
                *   status: 'success',
                *   target: 'landlord'
                * }
                * 其status属性表示短信发送状态，共有以下状态
                * 'needReview': 租客和房东发来的未审核短信
                * 'reject': 租客和房东发来的短信,管理员审核结果是不转发
                * 'success': 短信发送成功
                * target属性表示短信发送目标，可以为 'landlord', 'tenant'
                **/
                messageInfo: data.messageInfo,
                user: data.user || {
                    id: $scope.user.id,
                    nickname: $scope.user.nickname
                },
                content: data.content,
                originContent: data.originContent, //未经管理员编辑的原始短信
                time: new Date().getTime(),
                status: $scope.newStatus
            }
            var dynamic = _.clone(_.find($scope.item.custom_fields || [], {key: 'dynamic'}) || {key: 'dynamic', value: '[]'})
            var dynamicTemp = _.clone(dynamic)
            dynamic.value = JSON.stringify(JSON.parse(dynamic.value).concat([dynamicData]))
            dynamicTemp.value = JSON.stringify(JSON.parse(dynamicTemp.value).concat([_.extend(_.clone(dynamicData), {sending: true})]))

            $scope.item.custom_fields = generateCustomFieldsByDynamic(dynamicTemp)
            $scope.updateItem({
                id: $scope.item.id,
                custom_fields: generateCustomFieldsByDynamic(dynamic)
            })
                .then(function (data) {
                    growl.addSuccessMessage(window.i18n('添加成功'), {enableHtml: true})
                    angular.extend($scope.item, data.data.val)
                }, function () {
                    growl.addErrorMessage(window.i18n('添加失败'), {enableHtml: true})
                })
        }

        $scope.updateDynamic = function (dynamicData) {
            var dynamic = _.clone(_.find($scope.item.custom_fields || [], {key: 'dynamic'}) || {key: 'dynamic', value: '[]'})
            dynamic.value = JSON.stringify(_.map(JSON.parse(dynamic.value), function (item) {
                if(item.id === dynamicData.id) {
                    return dynamicData
                }
                return item
            }))

            $scope.item.custom_fields = generateCustomFieldsByDynamic(dynamic)
            $scope.updateItem({
                id: $scope.item.id,
                custom_fields: generateCustomFieldsByDynamic(dynamic)
            })
                .then(function (data) {
                    growl.addSuccessMessage(window.i18n('添加成功'), {enableHtml: true})
                    angular.extend($scope.item, data.data.val)
                }, function () {
                    growl.addErrorMessage(window.i18n('添加失败'), {enableHtml: true})
                })
        }
    }

    angular.module('app').controller('ctrlRentRequestIntentionDetail', ctrlRentRequestIntentionDetail)

})()


