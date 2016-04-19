/* Created by frank on 14-8-14. */


(function () {

    function ctrlDashboard($scope, $state, $http, userApi, $rootScope, growl, errors, messageApi, misc, $timeout, $q, permissions, rentRequestIntentionApi) {

        $scope.user = {}

        userApi.checkLogin()
            .then(function (user) {
                if (_.isEmpty(user.role)) {
                    growl.addErrorMessage($rootScope.renderHtml(errors[40105]), {enableHtml: true})
                    window.location.href = '/'
                    return
                }
                if(user.role.indexOf('affiliate') >=0 && _.intersection(_.map(permissions, function (item) {
                        return item.value
                    }),  user.role).length === 0) {
                    $state.go('dashboard.affiliate_role')
                }
                angular.extend($scope.user, user)
            }, function () {
                $state.go('signIn')
            })

        if (team.getQuery('_i18n') !== $scope.dashboardLanguage.value) {
            location.href = team.setQuery('_i18n', $scope.dashboardLanguage.value)
        }

        //退出登录后跳转到登陆界面
        $scope.logout = function () {
            $http.get('/logout', {errorMessage: true})
                .success(function () {
                    $state.go('signIn')
                })
        }
        //切换语言
        $scope.changeLanguage = function () {
            if ($scope.dashboardLanguage.value) {
                location.href = team.setQuery('_i18n', $scope.dashboardLanguage.value)
            }
        }

        //Shop id that used for crowdfunding
        $scope.shopId = '54a3c92b6b809945b0d996bf'
        //shopApi.getAll().success(function (data) {
        //    var list = data.val
        //    if (list.length === 1) {
        //        $scope.shopId = list[0].id
        //    }
        //})

        $scope.selected = {
            type: $state.params.type || 'rentRequestTicket',
            code: $state.params.code || ''
        }

        /*
        * Dashboard顶部上的搜索条，搜索咨询单，出租房产或者用户
        * */
        $scope.searchTicket = function (type, code) {
            if(!_.isEmpty(code)) {
                switch(type) {
                    case 'rentRequestTicket':
                        $state.go('dashboard.rent_request_intention', {code: code, type: type}, {location: true, reload:true})
                        break
                    case 'rentTicket':
                        $state.go('dashboard.rent', {code: code, type: type}, {location: true, reload:true})
                        break
                    case 'user':
                        $state.go('dashboard.users', {code: code, type: type}, {location: true, reload:true})
                        break

                }
            }
        }
        /*
         * 顶部搜索条内按回车键后就进行搜索
         * */
        $scope.searchInputKeyDown = function (event) {
            if(event.keyCode === 13) {
                $scope.searchTicket($scope.selected.type, $scope.selected.code)
            }
        }

        $scope.messagesLength = 0 //未读消息条数
        $scope.ticketsGroup = [] //未读消息按照咨询单分组的结果
        $scope.notify = misc.notify

        /*
        * 第一次打开页面即请求允许桌面通知，以免需要使用桌面通知时浏览器窗口处于最小化状态
        * */
        if (window.Notification && window.Notification.permission !== 'granted') {
            window.Notification.requestPermission()
        }

        /*
        * 让有新消息的标签页标题栏闪烁，当鼠标在有新消息标签页划过后就会停止闪烁
        * */
        $scope.blinkTitle = (function () {
            var title = document.title
            var msg = window.i18n('新消息')
            var timeoutId
            function blink() {
                document.title = document.title === msg ? title : msg
            }
            function clear() {
                clearInterval(timeoutId)
                document.title = title
                window.onmousemove = null
                timeoutId = null
            }
            return function (interval) {
                interval = interval || 500
                if (!timeoutId) {
                    timeoutId = setInterval(blink, interval);
                    window.onmousemove = clear;
                }
            }
        })()
        /*
        * 当前是否正处于消息所属咨询单的详情页
        * */
        $scope.isInRentRequestDetail = function (ticketId) {
            return $state.current.name === 'dashboard.rent_request_intention.detail' && $state.params.id === ticketId
        }
        $scope.needFetchUnreadMessage = function () {
            if(window.localStorage) {
                window.localStorage.setItem('needFetchUnreadMessage', new Date().getTime())
            }
        }
        /*
         * 获取新消息（status 为 new 的消息），同时会将新消息标记为已发送(status 为 sent)
         * 获取到新消息后会将新消息按照咨询单来分组
         * 紧接着会推送桌面消息，桌面消息被点击时，如果没有处于该咨询单详情页，则在新的页面打开消息对应的咨询单详情页
         * 然后会判断是否需要刷新未读消息列表
         * */
        $scope.fetchNewMessage = function () {
            return messageApi.receive({status: 'new', type: 'new_sms', mark: 'sent'}).then(function (res) {
                var messageGroup = _.groupBy(res.data.val, 'ticket_id') //按照咨询单来分组
                var processedMessageGroup = _.mapObject(messageGroup, function (messages, ticketId) {
                    _.each(messages, function (item) {
                        //推送桌面消息
                        misc.notify((item.role === 'tenant' ? i18n('租客') : i18n('房东')) + window.i18n('发来一条待审核短信（点击处理）'), {
                            body: item.text,
                            tag: item.ticket_id, //此处写成咨询单的id，则可以将一个咨询单的桌面消息合并成一个
                            onclick: function(){ //点击桌面消息后执行的回调函数
                                this.close()
                                if(!$scope.isInRentRequestDetail(ticketId)) { //如果没有处于该咨询单详情页，则在新的页面打开消息对应的咨询单详情页
                                    window.open('/admin#/dashboard/rent_request_intention/' + item.ticket_id)
                                    $q.all(_.map(messages, function (item) { //将该咨询单下的所有消息标为已读，然后获取未读消息列表并更新
                                        return messageApi.mark(item.id, 'read')
                                    })).then(function () {
                                        $scope.fetchUnreadMessage()
                                        $scope.needFetchUnreadMessage()
                                    })
                                }
                            }
                        })
                    })
                    if($scope.isInRentRequestDetail(ticketId)) {
                        $scope.needFetchUnreadMessage()
                        $scope.$broadcast('refreshRentRequestIntentionDetail'); //broadcast 一个 'refreshRentRequestIntentionDetail' 事件，通知咨询单详情页更新动态
                        $q.all(_.map(messages, function (item) {
                            return messageApi.mark(item.id, 'read')
                        }))
                        return []
                    } else {
                        return messages
                    }
                })
                //除了第一次会手动获取未读消息列表外，每次有status 为 new 的未读消息时都需要更新未读消息列表
                if(_.flatten(_.values(processedMessageGroup)).length && $scope.needFetchUnreadMessage) {
                    $scope.blinkTitle()
                    $scope.fetchUnreadMessage()
                    $scope.needFetchUnreadMessage()
                }
                $timeout(function () {
                    $scope.fetchNewMessage()
                }, 10000)
            }, function () {
                $timeout(function () {
                    $scope.fetchNewMessage()
                }, 10000)
            })
        }
        $scope.fetchNewMessage().then(function () {
            $scope.needFetchUnreadMessage = true
            $scope.fetchUnreadMessage()
        })

        /*
        * 获取未读消息列表，并且按咨询单来分组
        * */
        window.addEventListener('storage', function (event) {
            if(event.key === 'needFetchUnreadMessage') {
                $scope.fetchUnreadMessage()
            }
        });
        $scope.fetchUnreadMessage = function () {
            messageApi.receive({status: 'sent', type: 'new_sms'}).then(function (res) {
                var messageGroup = _.groupBy(res.data.val, 'ticket_id')
                $q.all(_.map(_.keys(messageGroup), function (ticketId) {
                    if($scope.isInRentRequestDetail(ticketId)) {
                        $scope.$broadcast('refreshRentRequestIntentionDetail'); //broadcast 一个 'refreshRentRequestIntentionDetail' 事件，通知咨询单详情页更新动态
                    }
                    return rentRequestIntentionApi.getOne(ticketId)
                })).then(function (responses) {
                    return _.map(responses, function (response) {
                        return {
                            rentTicket: _.isArray(response.data.val.interested_rent_tickets) ? response.data.val.interested_rent_tickets[0] : {},
                            messages: messageGroup[response.data.val.id]
                        }
                    })
                }).then(function (ticketsGroup) {
                    $scope.ticketsGroup = ticketsGroup
                    $scope.messagesLength = _.flatten(_.pluck(ticketsGroup, 'messages')).length
                })
            })
        }

        /*
        * 将全部未读消息都标为已读状态
        * */
        $scope.markAllMessageAsRead = function () {
            messageApi.receive({status: 'sent', type: 'new_sms', mark: 'read'}).then(function () {
                $scope.messagesLength = 0
                $scope.ticketsGroup = []
            })
        }
        /*
         * 将单条未读消息都标为已读状态
         * */
        $scope.markMessageAsRead = function (message) {
            messageApi.mark(message.id, 'read').then(function () {
                $scope.fetchUnreadMessage()
            })
        }
    }

    angular.module('app').controller('ctrlDashboard', ctrlDashboard)

})()

