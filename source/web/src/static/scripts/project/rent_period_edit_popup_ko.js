(function (ko) {
	ko.components.register('rent-period-edit', {
        viewModel: function(params) {
            var rentTicket = JSON.parse($('#rentTicketData').text())
            var formatter = window.lang === 'en_GB'? 'DD-MM-YYYY': 'YYYY-MM-DD'
            this.rentTicket = ko.observable(rentTicket)
            this.ticketId = ko.observable()
            this.errorMsg = ko.observable('')

            this.rentAvailableTimeFormated = ko.observable(window.moment.utc(new Date()).format(formatter))
            this.rentAvailableTime = ko.computed({
                read: function () {
                    return this.rentAvailableTimeFormated() ? new Date(window.team.normalizeDateString(this.rentAvailableTimeFormated())).getTime() / 1000 : ''
                },
                write: function (value) {
                    this.rentAvailableTimeFormated(window.moment.utc(new Date(window.team.normalizeDateString(value * 1000))).format(formatter))
                }
            }, this)
            this.rentDeadlineTimeFormated = ko.observable()
            this.rentDeadlineTime = ko.computed({
                read: function () {
                    return this.rentDeadlineTimeFormated() ? new Date(window.team.normalizeDateString(this.rentDeadlineTimeFormated())).getTime() / 1000: ''
                },
                write: function (value) {
                    this.rentDeadlineTimeFormated(window.moment.utc(new Date(window.team.normalizeDateString(value * 1000))).format(formatter))
                }
            }, this)
            this.tenantCountList = ko.observableArray([1,2,3,4,5,6,7,8])
            this.tenantCount = ko.observable(1)

            this.user = ko.observable(window.user) //当前登录用户
   
            this.setParams = function (params) {
                this.rentAvailableTime(params.rent_available_time)
                if(params.rent_deadline_time) {
                    this.rentDeadlineTime(params.rent_deadline_time)
                }
            }
            this.initParamsByLastSubmit = function () {
                if(this.user()) {
                    $.betterPost('/api/1/rent_intention_ticket/search', {
                        status: 'requested',
                        user_id: this.user().id,
                        per_page: 1
                    })
                        .done(_.bind(function (val) {
                            if(val.length) {
                                var lastParams = val[0]
                                if(lastParams.rent_available_time && lastParams.rent_available_time < this.rentAvailableTime()) {
                                    lastParams.rent_available_time = this.rentAvailableTime()
                                }
                                if(lastParams.rent_deadline_time && lastParams.rent_deadline_time < this.rentAvailableTime()) {
                                    lastParams.rent_deadline_time = ''
                                }
                                this.setParams(lastParams)
                            }
                        }, this))
                        .fail(_.bind(function (ret) {
                            window.dhtmlx.message({ type:'error', text: window.getErrorMessageFromErrorCode(ret)})
                        }, this))
                }
            }
            this.initParamsByLastSubmit()

            this.params = ko.computed(function () {
                var params = {
                    rent_available_time: this.rentAvailableTime(),
                    rent_deadline_time: this.rentDeadlineTime(),
                    tenant_count: this.tenantCount()
                }
                return params 
            }, this)

 

            function validateMinimumRentPeroid(hostRentTicket, ticketRentAvailableTime, ticketRentDeadlineTime) {
                var tenantRequest = null
                var hostRequirement = null
                var hostRentAvailableTime = hostRentTicket.rent_available_time
                var hostRentDeadlineTime = hostRentTicket.rent_deadline_time
                var hostMinimumRentPeriod = hostRentTicket.minimum_rent_period

                //考虑到时差问题，检查时对rent_available_time和rent_deadline_time宽限一天时间（即86400s）
                if(hostRentAvailableTime && (hostRentAvailableTime - 86400) > ticketRentAvailableTime) {
                    tenantRequest = i18n('入住日期：') + $.format.date(new Date(ticketRentAvailableTime * 1000), formatter)
                    hostRequirement = i18n('租期开始日期：') + $.format.date(new Date(hostRentAvailableTime * 1000), formatter)
                }
                if(hostRentDeadlineTime && (hostRentDeadlineTime + 86400) < ticketRentDeadlineTime) {
                    tenantRequest = i18n('搬出日期：') + window.moment.utc(new Date(window.team.normalizeDateString(ticketRentDeadlineTime * 1000))).format(formatter)
                    hostRequirement = i18n('租期结束日期：') + window.moment.utc(new Date(window.team.normalizeDateString(hostRentDeadlineTime * 1000))).format(formatter)
                }

                if(hostMinimumRentPeriod && ticketRentAvailableTime && ticketRentDeadlineTime  && window.project.transferTime(hostMinimumRentPeriod, 'second').value_float > ticketRentDeadlineTime - ticketRentAvailableTime) {

                    tenantRequest = i18n('您的租住天数：') + (ticketRentDeadlineTime - ticketRentAvailableTime) / 86400 + i18n('天')
                    hostRequirement = i18n('最短租期：') + hostMinimumRentPeriod.value + window.team.parsePeriodUnit(hostMinimumRentPeriod.unit)
                }

                if (tenantRequest && hostRequirement) {
                    return tenantRequest + ' ' + hostRequirement
                }
                else {
                    return null
                }
            }

            // validate
            this.validate = function () {
                var errorList = []
                var config = {
                    rentTime: function () {
                        if(!this.params().rent_available_time) {
                            return errorList.push(window.i18n('请选择起租日期'))
                        }
                        if(!this.params().rent_deadline_time) {
                            return errorList.push(window.i18n('请选择租期结束日期'))
                        }
                        // Because selected date start from 0am, so current date should use yesterday
                        if(this.params().rent_available_time < (Date.now() / 1000 - 24 * 60 * 60) ) {
                            return errorList.push(window.i18n('起租日期不能早于今天'))
                        }
                        if(this.params().rent_available_time > this.params().rent_deadline_time) {
                            return errorList.push(window.i18n('结束日期需要大于开始日期'))
                        }
                        if(this.params().rent_available_time > this.params().rent_deadline_time - 24 * 60 * 60) {
                            return errorList.push(window.i18n('租期至少一天'))
                        }

                        var validateResult = validateMinimumRentPeroid(rentTicket, this.params().rent_available_time, this.params().rent_deadline_time)
                        if (validateResult) {
                            return  errorList.push(validateResult)
                        }
                    }
                }
                var keys = arguments.length ? Array.prototype.slice.call(arguments) : Object.keys(config)
                _.each(keys, _.bind(function (key) {
                    config[key].call(this)
                }, this))
                if(errorList.length) {
                    this.errorMsg(errorList.shift())
                    return false
                } else {
                    this.errorMsg('')
                    return true
                }
            }
            this.submit = function (requestType) {                
                if(!this.validate('rentTime')) {
                    return
                }
                this.submitTicket(requestType)
            }
            this.submitTicket = function (requestType) {
                $.betterPost('/api/1/rent_intention_ticket/add', this.params())
                    .done(_.bind(function (val) {
                        window.team.setUserType('tenant')
                        location.href = (requestType === 'booked' ? '/payment-checkout/'+val : '/user-chat/'+val+'/details')
                    }, this))
                    .fail(_.bind(function (ret) {
                        this.errorMsg(window.getErrorMessageFromErrorCode(ret))
                    }, this))
                    .always(_.bind(function () {

                    }, this))
            }            
        },
        template: { element: 'rent-period-edit-tpl' }
    })
})(window.ko);


