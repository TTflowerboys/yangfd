/* Created by frank on 14-8-14. */


(function () {

    function ctrlDashboard($scope, $state, $http, userApi, $rootScope, growl, errors, messageApi, misc, $timeout, $q, permissions) {

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

        $scope.logout = function () {
            $http.get('/logout', {errorMessage: true})
                .success(function () {
                    $state.go('signIn')
                })
        }
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

        $scope.searchInputKeyDown = function (event) {
            if(event.keyCode === 13) {
                $scope.searchTicket($scope.selected.type, $scope.selected.code)
            }
        }

        $scope.messages = []
        $scope.notify = misc.notify

        //第一次打开页面即请求允许桌面通知，以免需要使用桌面通知时浏览器窗口处于最小化状态
        if (window.Notification && window.Notification.permission !== 'granted') {
            window.Notification.requestPermission()
        }

        $scope.blinkTitle = (function () { //让标签页上的标题闪烁
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

        $scope.fetchNewMessage = function () {
            var cache = {}
            return messageApi.receive({status: 'new', type: 'new_sms', mark: 'sent'}).then(function (res) {
                _.each(res.data.val, function (item) {
                    //    推送桌面消息
                    cache[item.ticket_id] = cache[item.ticket_id] || []
                    cache[item.ticket_id].push(item.id)
                    misc.notify((item.role === 'tenant' ? i18n('租客') : i18n('房东')) + window.i18n('发来一条待审核短信（点击处理）'), {
                        body: item.text,
                        tag: item.ticket_id, //此处写成咨询单的id，则可以将一个咨询单的桌面消息合并成一个
                        onclick: function(){
                            this.close()
                            window.open('/admin#/dashboard/rent_request_intention/' + item.ticket_id)
                            //将该咨询单下的所有消息标为已读，然后更新未读消息列表
                            $q.all(_.map(cache[item.ticket_id], function (item) {
                                return messageApi.mark(item, 'read')
                            })).then(function () {
                                delete cache[item.ticket_id]
                                $scope.fetchUnreadMessage()
                            })
                        }
                    })
                })
                //除了第一次会手动获取未读消息列表外，每次有status 为 new 的未读消息时都需要更新未读消息列表
                if(res.data.val.length && $scope.needFetchUnreadMessage) {
                    $scope.blinkTitle()
                    $scope.fetchUnreadMessage()
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

        $scope.fetchUnreadMessage = function () {
            messageApi.getAll({status: 'sent', type: 'new_sms'}).then(function (res) {
                $scope.messages = res.data.val
            })
        }

        /*messageApi.receive({status: 'new'}).success(function (data) {
            console.log(data)
        })*/
        $scope.markAllMessageAsRead = function () { //将全部消息标为已读状态
            messageApi.receive({status: 'sent', type: 'new_sms', mark: 'read'}).then(function () {
                $scope.messages = []
            })
        }

        $scope.markMessageAsRead = function (message) {
            messageApi.mark(message.id, 'read').then(function () {
                $scope.fetchUnreadMessage()
            })
        }
    }

    angular.module('app').controller('ctrlDashboard', ctrlDashboard)

})()

