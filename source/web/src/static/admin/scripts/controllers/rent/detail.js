(function () {

    function ctrlRentDetail($scope, fctModal, rentApi, $stateParams, Ï, misc, $state, growl, $timeout, userApi, rentRequestIntentionApi, $filter) {
        var api = $scope.api = rentApi
        var itemFromParent = misc.findById($scope.$parent.list, $stateParams.id)
        $scope.getRentIntentionList = function (item) {
            rentRequestIntentionApi.getAll({
                params: {
                    per_page: -1,
                    sort: 'time,desc',
                    interested_rent_tickets: JSON.stringify([item.id])
                },
                errorMessage: true
            })
                .success(function (data) {
                    $scope.rentIntentionList  = _.map(data.val, function (item, index) {
                        // Calculate age from birthday
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
                        rentRequestIntentionApi.getLog(item.id)
                            .then(function (data) {
                                if(data.data.val && data.data.val.length && data.data.val[0].ip && data.data.val[0].ip.length) {

                                    $scope.rentIntentionList[index].log = {
                                        ip: data.data.val[0].ip[0],
                                        link: 'http://www.ip2location.com/demo'
                                    }
                                } else {
                                    $scope.rentIntentionList[index].log = {
                                        ip: window.i18n('无结果')
                                    }
                                }
                            })

                        // Generate output text for rent request intention ticket
                        item.output = ''
                        angular.forEach(item.interested_rent_tickets,function(interested_rent_ticket){
                            if(!_.isEmpty(interested_rent_ticket)) {
                                item.output += '尊敬的' + interested_rent_ticket.user.nickname + '您好，这里是洋房东，请问您发布的' + interested_rent_ticket.title + '还在出租吗？现在有位租客很感兴趣，下面是租客信息：' + '\n\n'
                                item.output += window.i18n('入住日期: ') + $filter('date')(item.rent_available_time * 1000, 'yyyy年MM月d日') + '\n'
                                item.output += window.i18n('搬出日期: ') + $filter('date')(item.rent_deadline_time * 1000, 'yyyy年MM月d日') + '\n'
                                item.output += window.i18n('入住人数: ') + item.tenant_count + '\n'
                                item.output += window.i18n('性别: ') + (item.gender === 'male'? window.i18n('男') : window.i18n('女')) + '\n'
                                item.output += window.i18n('职业: ') + item.occupation.value[$rootScope.userLanguage.value] + '\n'
                                item.output += window.i18n('年龄: ') + $filter('number')(item.age, '0') + '\n'
                                item.output += window.i18n('是否带宠物入住: ') + (item.pet ? window.i18n('是') : window.i18n('否')) + '\n'
                                item.output += window.i18n('是否有小孩入住: ') + (item.baby ? window.i18n('是') : window.i18n('否')) + '\n'
                                item.output += window.i18n('是否吸烟: ') + (item.smoke ? window.i18n('是') : window.i18n('否')) + '\n'
                                item.output += window.i18n('入住原因: ') + item.description + '\n\n'
                                item.output += '请您尽快以短信或电话的方式回复我们：' + '\n'
                                item.output += '电话：020-3040-2258' + '\n'
                                item.output += '短信：直接回复本信息即可' + '\n'
                            }
                        })


                        return item
                    })
                })

        }

        if($state.current.name === 'dashboard.rent.detail') {
            if (itemFromParent) {
                $scope.item = itemFromParent
                $scope.getRentIntentionList($scope.item)
            } else {
                api.getOne($stateParams.id, {errorMessage: true})
                    .success(function (data) {
                        $scope.item  = data.val
                        $scope.getRentIntentionList($scope.item)
                    })
            }
        }

        $scope.onRemove = function (item) {
            fctModal.show(i18n('确认删除该房源?'), undefined, function () {
                api.remove(item.id, {errorMessage: true}).success(function () {
                    growl.addSuccessMessage($rootScope.renderHtml(i18n('操作成功')),
                        {enableHtml: true})
                    $state.go($stateParams.from || '^', $stateParams.fromParams)
                })
            })
        }

        $scope.onRefresh = function (item) {
            fctModal.show(i18n('确认刷新该房源?'), undefined, function () {
                api.refresh(item.id, {errorMessage: true}).success(function () {
                    growl.addSuccessMessage($rootScope.renderHtml(i18n('已刷新')),
                        {enableHtml: true})
                    location.reload()
                })
            })
        }

        $scope.onRentOut = function (item) {
            fctModal.show(i18n('确认该房源已租出?'), undefined, function () {
                api.rentOut(item.id, {errorMessage: true}).success(function () {
                    growl.addSuccessMessage($rootScope.renderHtml(i18n('操作成功')),
                        {enableHtml: true})
                    location.reload()
                })
            })
        }

        $scope.onSuspend = function (item) {
            fctModal.show(i18n('确认下架该房源并通知房东?'), undefined, function () {
                api.suspend(item.id, {errorMessage: true}).success(function () {
                    growl.addSuccessMessage($rootScope.renderHtml(i18n('操作成功')),
                        {enableHtml: true})
                    location.reload()
                })
            })
        }

        $scope.updateUserItem = function (item) {
            return userApi.update(item.id, item)
        }
    }

    angular.module('app').controller('ctrlRentDetail', ctrlRentDetail)

})()

