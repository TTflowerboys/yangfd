(function () {

    function ctrlRentRequestIntentionDetail($scope, fctModal, api,  misc, $stateParams, growl, $rootScope, $state) {
        $scope.api = api
        $scope.emailTemplate = {
            tenant: {
                'assigned': {
                    title: window.i18n('申请确认邮件'),
                    url: '/static/admin/emails/assigned_tenant.html'
                },
            },
            landlord:{
                'assigned': {
                    title: window.i18n('租客给房东的邮件'),
                    url: '/static/admin/emails/assigned_landlord.html'
                },
            }

        }
        $scope.messageTemplate = {
            tenant: {
                //'assigned': {
                //    title: window.i18n('申请确认短信'),
                //    url: '/static/admin/templates/message/assigned_tenant.html'
                //},
            },
            landlord:{
                'assigned': {
                    title: window.i18n('租客给房东的短信'),
                    url: '/static/admin/templates/message/assigned_landlord.html'
                },
            }
        }
        $scope.newStatus = ''
        $scope.activeTab = ''
        $scope.switchTab = function (name) {
            $scope.activeTab = name
        }
        $scope.host = location.protocol + '//' + location.host
        $scope.currentTime = new Date().getTime()
        var itemFromParent = misc.findById($scope.$parent.list, $stateParams.id)

        if (itemFromParent) {
            $scope.item = itemFromParent
        } else {
            $scope.item = {}
            api.getOne($stateParams.id, {errorMessage: true})
                .success(function (data) {
                    var item =  data.val
                    item.age = (Date.now() - item.date_of_birth * 1000)/(365 * 24 * 60 * 60 * 1000)

                    // Get ip when ticket is created from log
                    item.log = {
                        ip: window.i18n('载入中...'),
                        link: ''
                    }
                    if(item.rent_deadline_time && item.rent_available_time) {
                        var day = (item.rent_deadline_time - item.rent_available_time) / 3600 / 24
                        if(day < 30) {
                            item.payment = parseInt(item.interested_rent_tickets[0].price.value_float / 7 * day / 4)
                        } else {
                            item.payment = parseInt(item.interested_rent_tickets[0].price.value_float)
                        }
                    }
                    api.getLog(item.id)
                        .then(function (data) {
                            if(data.data.val && data.data.val.length && data.data.val[0].ip && data.data.val[0].ip.length) {

                                item.log = {
                                    ip: data.data.val[0].ip[0],
                                    link: 'http://www.ip2location.com/demo/' + data.data.val[0].ip[0]
                                }
                            } else {
                                item.log = {
                                    ip: window.i18n('无结果')
                                }
                            }
                            $scope.item  = item
                        })
                })
        }

        $scope.updateItem = function (item) {
            return api.update(item)
        }

        $scope.onRemove = function (item) {
            fctModal.show('Do you want to remove it?', undefined, function () {
                api.remove(item.id).success(function () {
                    $scope.list.splice($scope.list.indexOf(item), 1)
                    growl.addSuccessMessage($rootScope.renderHtml(i18n('操作成功')), {enableHtml: true})
                    $state.go($stateParams.from || '^', $stateParams.fromParams)
                })
            })
        }
    }

    angular.module('app').controller('ctrlRentRequestIntentionDetail', ctrlRentRequestIntentionDetail)

})()


