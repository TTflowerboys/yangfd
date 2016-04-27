(function () {

    function ctrlRentRequestIntentionList($scope, fctModal, rentRequestIntentionApi, userApi, $filter, enumApi,$rootScope, $state, $q, couponApi, miscApi, misc, growl) {
        var api = $scope.api = rentRequestIntentionApi

        $scope.perPage = 12
        $scope.currentPageNumber = 1
        $scope.pages = []
        $scope.selected = {}
        $scope.selected.status = 'requested'
        $scope.selected.partner_student_housing = ''

        var params = {
            status: $scope.selected.status,
            partner_student_housing:  $scope.selected.partner_student_housing,
            per_page: $scope.perPage,
            sort: 'time,desc'
        }
        if($state.params.dateTo && $state.params.dateTo > 0) {
            params.time = $state.params.dateTo
        }

        function updateParams() {
            for(var key in params) {
                if(params[key] === undefined || params[key] === '') {
                    delete params[key]
                }
            }
        }

        $scope.transformHistoriesToDynamics = function (list) {
            return _.sortBy(_.map(list, function (history) {
                var dynamic = JSON.parse(history.custom_fields[0].value)
                dynamic.historyId = history.id
                return dynamic
            }), 'time')
        }

        $scope.getHistoriesOfItem = function (item) {
            return api.getHistory({
                id: item.id,
                tags: ['dynamic']
            }).then(function (data) {
                return $scope.transformHistoriesToDynamics(data.data.val)
            })
        }
        $scope.getLastDynamicOfItem = function (item) {
            return api.getHistory({
                id: item.id,
                tags: ['dynamic'],
                per_page: 1
            }).then(function (data) {
                return $scope.transformHistoriesToDynamics(data.data.val)
            })
        }

        $scope.getUnmatchhRequirements = function (item) {
            function getGenderName (slug) {
                return {'male': i18n('男'), 'female': i18n('女')}[slug]
            }
            if(!_.isArray(item.interested_rent_tickets) || item.interested_rent_tickets.length === 0) {
                return
            }
            var keyList = ['no_pet', 'no_smoking', 'no_baby', 'occupation', 'min_age', 'max_age', 'gender_requirement', 'accommodates', 'rent_available_time', 'rent_deadline_time', 'minimum_rent_period']
            var requirements = {}
            var rentTicket = item.interested_rent_tickets[0]
            _.each(keyList, function (key) {
                if(rentTicket[key] !== undefined && rentTicket[key] !== false && rentTicket[key] !== '') {
                    requirements[key] = rentTicket[key]
                }
            })
            var unmatchRequirements = []
            var age = Math.ceil(item.age)
            if(requirements.no_smoking && item.smoke === true) {
                unmatchRequirements.push({
                    request: i18n('入住者吸烟'),
                    requirement: i18n('禁止吸烟'),
                })
            }
            if(requirements.no_pet && item.pet === true) {
                unmatchRequirements.push({
                    request: i18n('入住者携带宠物'),
                    requirement: i18n('禁止携带宠物'),
                })
            }
            if(requirements.no_baby && item.baby === true) {
                unmatchRequirements.push({
                    request: i18n('入住者携带小孩'),
                    requirement: i18n('禁止携带小孩'),
                })
            }
            if(requirements.occupation && item.occupation.id !== requirements.occupation.id) {
                unmatchRequirements.push({
                    request: i18n('入住者职业：') + item.occupation.value[$rootScope.userLanguage.value],
                    requirement: requirements.occupation.value[$rootScope.userLanguage.value],
                })
            }
            if(requirements.min_age && age < requirements.min_age) {
                unmatchRequirements.push({
                    request: i18n('入住者年龄：') + age + i18n('岁'),
                    requirement: i18n('最小年龄') + requirements.min_age + i18n('岁'),
                })
            }
            if(requirements.max_age && age > requirements.max_age) {
                unmatchRequirements.push({
                    request: i18n('入住者年龄：') + age + i18n('岁'),
                    requirement: i18n('最大年龄') + requirements.max_age + i18n('岁'),
                })
            }
            if(requirements.accommodates && item.tenant_count > requirements.accommodates) {
                unmatchRequirements.push({
                    request: i18n('入住人数：') + item.tenant_count + i18n('人'),
                    requirement: i18n('可入住') + requirements.accommodates + i18n('人'),
                })
            }
            if(requirements.gender_requirement && item.gender !== requirements.gender_requirement) {
                unmatchRequirements.push({
                    request: i18n('入住者性别：') + getGenderName(item.gender),
                    requirement: getGenderName(requirements.gender_requirement),
                })
            }
            //考虑到时差问题，检查时对rent_available_time和rent_deadline_time宽限一天时间（即86400s）
            if(requirements.rent_available_time && (requirements.rent_available_time - 86400) > item.rent_available_time) {
                unmatchRequirements.push({
                    request: i18n('入住日期：') + $.format.date(new Date(item.rent_available_time * 1000), 'yyyy-MM-dd'),
                    requirement: i18n('租期开始日期：') + $.format.date(new Date(requirements.rent_available_time * 1000), 'yyyy-MM-dd'),
                })
            }
            if(requirements.rent_deadline_time && (requirements.rent_deadline_time + 86400) < item.rent_deadline_time) {
                unmatchRequirements.push({
                    request: i18n('搬出日期：') + $.format.date(new Date(item.rent_deadline_time * 1000), 'yyyy-MM-dd'),
                    requirement: i18n('租期结束日期：') + $.format.date(new Date(requirements.rent_deadline_time * 1000), 'yyyy-MM-dd'),
                })
            }
            if(requirements.minimum_rent_period && requirements.rent_available_time && requirements.rent_deadline_time && $rootScope.transferTime(requirements.minimum_rent_period, 'second').value_float > requirements.rent_deadline_time - requirements.rent_available_time) {
                requirements.minimum_rent_period = $rootScope.transferTime(_.extend(_.clone(requirements.minimum_rent_period), {value_float: requirements.rent_deadline_time - requirements.rent_available_time, unit: 'second'}), 'day')
            }

            var rentTimeDeltaDay = (item.rent_deadline_time - item.rent_available_time) / 86400
            if(rentTimeDeltaDay >= 27) {
                rentTimeDeltaDay += 3
            }
            if(requirements.minimum_rent_period && (rentTimeDeltaDay < $rootScope.transferTime(requirements.minimum_rent_period, 'day').value_float)) {
                unmatchRequirements.push({
                    request: i18n('您的租住天数：') + (item.rent_deadline_time - item.rent_available_time) / 86400 + i18n('天'),
                    requirement: i18n('最短租期') + requirements.minimum_rent_period.value + window.team.parsePeriodUnit(requirements.minimum_rent_period.unit),
                })
            }
            item.unmatchRequirements = unmatchRequirements
        }

        $scope.canAssign = function (item, userId) {
            return _.isEmpty(item.assignee) || _.isEmpty(_.find(item.assignee, {id: userId}))
        }
        $scope.addAssignee = function (item, userId) {
        //    关注咨询单
            if(item.disabledAssignee) {
                return
            }
            item.disabledAssignee = true
            rentRequestIntentionApi.getOne(item.id).then(function (res) {
                var originAssignee = _.pluck(res.data.val.assignee, 'id') || []
                return _.uniq(originAssignee.concat([userId]))
            }).then(function (newAssignee) {
                return rentRequestIntentionApi.update({
                    id: item.id,
                    assignee: newAssignee
                })
            }).then(function (res) {
                growl.addSuccessMessage(i18n('关注成功'), {enableHtml: true})
                item.assignee = res.data.val.assignee
                item.disabledAssignee = false
            }).catch(function () {
                growl.addErrorMessage(i18n('关注失败'), {enableHtml: true})
                item.disabledAssignee = false
            })
        }
        $scope.removeAssignee = function (item, userId) {
        //    取消关注咨询单
            if(item.disabledAssignee) {
                return
            }
            item.disabledAssignee = true
            rentRequestIntentionApi.getOne(item.id).then(function (res) {
                var originAssignee = _.pluck(res.data.val.assignee, 'id') || []
                return _.without(originAssignee, userId)
            }).then(function (newAssignee) {
                return rentRequestIntentionApi.update({
                    id: item.id,
                    assignee: newAssignee
                })
            }).then(function (res) {
                growl.addSuccessMessage(i18n('取消关注成功'), {enableHtml: true})
                item.assignee = res.data.val.assignee
                item.disabledAssignee = false
            }).catch(function () {
                growl.addErrorMessage(i18n('取消关注失败'), {enableHtml: true})
                item.disabledAssignee = false
            })
        }

        $scope.refreshList = function () {
            updateParams()
            api.getAll({
                params: params, errorMessage: true
            }).success(onGetList)
        }
        if($state.current.name === 'dashboard.rent_request_intention') {
            if($state.params.code) {
                params.status = ''
                params.short_id = $state.params.code
            }
            if($state.params.referral) {
                params.status = ''
                params.referral = $state.params.referral
            }
            $scope.refreshList()
            $scope.$watch('[selected.status, selected.partner_student_housing]', function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return
                }
                delete params.short_id
                delete params.referral
                delete params.time
                _.extend(params, $scope.selected)
                $scope.refreshList()
            }, true)
        }
        $scope.searchTicket = function () {
            _.extend(params, $scope.selected)
            if(params.short_id) {
                params.short_id = params.short_id.toUpperCase()
            }
            delete params.time
            $scope.refreshList()
        }

        $scope.nextPage = function () {
            var lastItem = $scope.originList[$scope.originList.length - 1]
            if (lastItem.time) {
                params.time = lastItem.time
            }

            api.getAll({params: params})
                .success(function () {
                    $scope.currentPageNumber += 1
                })
                .success(onGetList)

        }
        $scope.prevPage = function () {

            var prevPrevPageNumber = $scope.currentPageNumber - 2
            var prevPrevPageData
            var lastItem
            if (prevPrevPageNumber >= 1) {
                prevPrevPageData = $scope.pages[prevPrevPageNumber]
                lastItem = prevPrevPageData[prevPrevPageData.length - 1]
            }

            if (lastItem) {
                if (lastItem.time) {
                    params.time = lastItem.time
                }
            } else {
                delete params.time
            }

            api.getAll({params: params, errorMessage: true})
                .success(function () {
                    $scope.currentPageNumber -= 1
                })
                .success(onGetList)

        }

        $scope.openImage = function (item) {
            window.open(item.visa)
        }

        $scope.hasNonBritainNumber = function (item) {
            if(item && _.isArray(item.interested_rent_tickets) && !_.isEmpty(item.interested_rent_tickets[0])) {
                if((item.creator_user && item.creator_user.country_code === 44) && (item.interested_rent_tickets[0].creator_user && item.interested_rent_tickets[0].creator_user.country_code === 44)) {
                    return false
                }
                return true
            }
            return false
        }
        $scope.setDisableSms = function (item) {
            if(item.status === 'canceled' || item.status === 'checked_in') {
                item.disableSms = true
                item.disableSmsReason = i18n('取消状态和已租出状态的咨询单不可发送短信')
            } else {
	        if($scope.hasNonBritainNumber(item)) {
    	            item.disableSms = true
        	    item.disableSmsReason = i18n('由于存在非英国号码，短信系统暂时无法使用，请手动发送(房东号码：') + '+' + item.interested_rent_tickets[0].creator_user.country_code + item.interested_rent_tickets[0].creator_user.phone + '，' + i18n('租客号码：') + '+' + item.creator_user.country_code + item.creator_user.phone + ')'
            	} else {
                    item.disableSms = false
	        }
            }
        }

        function onGetList(data) {
            $scope.fetched = true
            $scope.originList = data.val
            $scope.list = _.map(_.filter(_.filter(data.val, function (item) {
                return _.isArray(item.interested_rent_tickets) && item.interested_rent_tickets.length && !_.isEmpty(item.interested_rent_tickets[0])
            }), function (item) {
                if($state.params.dateFrom && $state.params.dateFrom > 0) {
                    return item.time >= parseInt($state.params.dateFrom)
                } else {
                    return true
                }
            }), function (item, index) {
                $scope.setDisableSms(item)
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
                $q.all([api.getLog(item.id), couponApi.search({
                    user_id: item.user.id
                }), $scope.getLastDynamicOfItem(item)])
                    .then(function (data) {
                        if(data[0].data.val && data[0].data.val.length && data[0].data.val[0].ip && data[0].data.val[0].ip.length && $scope.list[index]) {

                            $scope.list[index].log = {
                                ip: data[0].data.val[0].ip[0],
                                link: 'http://www.ip2location.com/demo/' + data[0].data.val[0].ip[0]
                            }
                        } else {
                            $scope.list[index].log = {
                                ip: window.i18n('无结果')
                            }
                        }
                        if(data[1].data.val && data[1].data.val.length) {
                            $scope.list[index].offer = data[1].data.val[0]
                        }
                        if(data[2].length) {
                            angular.extend($scope.list[index], {
                                'dynamics': _.clone(data[2])
                            })
                        }
                    })

                // Generate output text for rent request intention ticket
                item.output = ''
                angular.forEach(item.interested_rent_tickets,function(interested_rent_ticket){
                    if(!_.isEmpty(interested_rent_ticket)) {
                        item.output += '尊敬的' + interested_rent_ticket.user.nickname + '您好，这里是洋房东，请问您发布的' + interested_rent_ticket.title + '还在出租吗？现在有位租客很感兴趣，下面是租客信息：' + '\n\n'
                        item.output += window.i18n('咨询单编号: ') + item.short_id + '\n'
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
                $scope.getUnmatchhRequirements(item)
                return item
            })
            $scope.pages[$scope.currentPageNumber] = $scope.list

            if (!data.val || data.val.length < $scope.perPage || ($state.params.dateFrom && $state.params.dateFrom > 0 && data.val[data.val.length - 1].time <= parseInt($state.params.dateFrom))) {
                $scope.noNext = true
            } else {
                $scope.noNext = false
            }
            if ($scope.currentPageNumber <= 1) {
                $scope.noPrev = true
            } else {
                $scope.noPrev = false
            }
        }

        $scope.onRemove = function (item) {
            fctModal.show('Do you want to remove it?', undefined, function () {
                api.remove(item.id).success(function () {
                    $scope.list.splice($scope.list.indexOf(item), 1)
                })
            })
        }

        $scope.updateItem = function (item) {
            return api.update(item)
        }

        $scope.updateUserItem = function (item) {
            return userApi.update(item.id, item)
        }

        enumApi.getOriginEnumsByType('user_referrer').success(
            function (data) {
                $rootScope.referrerList = data.val
            }
        )

    }

    angular.module('app').controller('ctrlRentRequestIntentionList', ctrlRentRequestIntentionList)

})()


