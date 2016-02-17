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
            $scope.unmatchRequirements = unmatchRequirements
        }


        if (itemFromParent) {
            $scope.item = itemFromParent
            $scope.getUnmatchhRequirements($scope.item)
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
                    if(item.rent_deadline_time && item.rent_available_time && !_.isEmpty(item.interested_rent_tickets[0])) {
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
                            $scope.getUnmatchhRequirements($scope.item)
                        })
                })
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
                    $scope.list.splice($scope.list.indexOf(item), 1)
                    growl.addSuccessMessage($rootScope.renderHtml(i18n('操作成功')), {enableHtml: true})
                    $state.go($stateParams.from || '^', $stateParams.fromParams)
                })
            })
        }
    }

    angular.module('app').controller('ctrlRentRequestIntentionDetail', ctrlRentRequestIntentionDetail)

})()


