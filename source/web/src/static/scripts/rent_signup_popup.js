(function (ko) {
    window.openRentSignupPopup = function(ticketId, requestType, ticketRentAvailableTime, ticketRentDeadlineTime){
        var args = arguments
        if (!window.user) {

            $('body').trigger('openRentSignupPopup', Array.prototype.slice.call(args))
            $('.buttonLoading').trigger('end')
        }
    }
    
    ko.components.register('rent-signup-popup', {
        viewModel: function(params) {
            var rentTicket = JSON.parse($('#rentTicketData').text())
            var oldUser = window.user
            this.rentTicket = ko.observable(rentTicket)
            this.openRentSignupPopup = function (ticketId, requestType, ticketRentAvailableTime, ticketRentDeadlineTime) {
                return function () {
                    window.openRentSignupPopup(ticketId, requestType, ticketRentAvailableTime, ticketRentDeadlineTime)
                }
            }
            
            this.scrollTopOnMobile = function () {
                if (window.team.isPhone()) {
                    $('body,html').animate({scrollTop: 0}, 0)
                }
            }

            this.rentAvailableTime = ko.observable()
            this.rentDeadlineTime = ko.observable()
            this.requestType = ko.observable()
            
            this.open = function (isPopup) {
                this.formWrapVisible(true)
                if(isPopup) {
                    var popup = $('#rent-signup-popup')
                    var wrapper = popup.find('.requirement_wrapper')
                    var headerHeight = wrapper.outerHeight() - wrapper.innerHeight()
                    if (wrapper.outerHeight() - headerHeight > $(window).height()) {
                        wrapper.css('top', $(window).scrollTop() - headerHeight)
                    }
                    else {
                        wrapper.css('top',
                            $(window).scrollTop() - headerHeight + ($(window).height() - (wrapper.outerHeight() - headerHeight)) / 2)
                    }
                }
            }
            this.close = function () {
                this.formWrapVisible(false)
                $('.buttonLoading').trigger('end')
                if (oldUser !== window.user) {
                    location.reload(true)
                }
            }

            this.rentusertype = ko.observable(window.i18n('房东'))
            this.rentnickname = ko.observable(rentTicket.user? rentTicket.user.nickname: '')
            this.renttitle = ko.observable(rentTicket.title)
            this.rentmeta = ko.observable(rentTicket.property.street+' '+rentTicket.property.zipcode)

            this.ticketId = ko.observable()

            this.user = ko.observable(window.user) //当前登录用户
            this.face = ko.observable(this.user() ? (this.user().face ? this.user().face : '/static/images/chat/placeholder_tenant_small.png') : '/static/images/chat/placeholder_tenant_small.png')

            this.nickname = ko.observable(this.user() ? this.user().nickname : '')

            this.genderList = ko.observableArray([{
                text: window.i18n('男'),
                value: 'male'
            },{
                text: window.i18n('女'),
                value: 'female'
            }])
            this.gender = ko.observable(this.user() ? this.user().gender : 'male')

            this.occupationList = ko.observableArray([])
            window.project.getEnum('occupation')
                .then(_.bind(function (arr) {
                    this.occupationList(arr)
                }, this))
            this.occupation = ko.observable()

            this.hesaUniversity = ko.observable()
            this.otherUniversity = ko.observable()

            this.onFeaturedFacilitySearchBoxUpdateValue = function (value) {
                if (value) {
                    if (typeof value === 'string') {
                        this.otherUniversity(value)
                        this.hesaUniversity(null)
                    }
                    else {
                        this.otherUniversity(null)
                        this.hesaUniversity(value)
                    }
                }
                else {
                    this.otherUniversity(null)
                    this.hesaUniversity(null)
                }
            }


            function generateYearList(total) {
                total = total || 80
                var nowYear = new Date().getFullYear()
                return _.map(window.team.generateArray(80), function (val, index) {
                    return nowYear - index
                })
            }
            function generateDateList(year, month) {
                month = month - 1
                return window.team.generateArray(32 - new Date(year, month, 32).getDate());
            }
            this.birthYearList = ko.observableArray(generateYearList(80))
            this.birthYear = ko.observable(1990)
            this.birthMonthList = ko.observableArray(window.team.generateArray(12))
            this.birthMonth = ko.observable(1)
            this.birthDateList = ko.computed(function () {
                return generateDateList(this.birthYear(), this.birthMonth())
            }, this)
            this.birthDate = ko.observable(1)
            this.birthDay = ko.observable('1990-01-01') //for mobile
            this.birthTime = ko.computed({
                read: function () {
                    return window.team.isPhone() ? (new Date(this.birthDay()).getTime() / 1000) : (new Date(this.birthYear(), this.birthMonth()-1, this.birthDate()).getTime() / 1000)
                },
                write: function (value) {
                    var formatedValue = window.moment.utc(new Date(value * 1000)).format('YYYY-MM-DD')
                    this.birthDay(formatedValue)
                    this.birthYear(parseInt(formatedValue.split('-')[0]))
                    this.birthMonth(parseInt(formatedValue.split('-')[1]))
                    this.birthDate(parseInt(formatedValue.split('-')[2]))
                }
            }, this)

            this.countryCodeList = ko.observableArray(_.map(JSON.parse($('#countryData').text()), function (country) {
                country.name = window.team.countryMap[country.code]
                country.countryCode = window.team.countryCodeMap[country.code]
                return country
            }))
            this.country = ko.observable(this.user() ? _.find(this.countryCodeList(), {countryCode: this.user().country_code.toString()}) : this.countryCodeList()[0])
            this.phone = ko.observable(this.user() ? this.user().phone : '')
            this.email = ko.observable(this.user() ? this.user().email : '')

            this.referrerText = ko.observable()
            this.referrer = ko.observable()

            this.referral = ko.observable(window.team.getQuery('referral', location.href))

            this.phoneVerified = ko.observable(this.user() ? this.user().phone_verified : false)
            this.verificationCount = ko.observable(0)
            this.useSmsVerification = ko.observable(true)
            this.needMannuallyVerify = ko.observable(false)

            this.smsCode = ko.observable()
            this.getSmsCodeText = ko.observable(window.i18n('发送短信验证码'))
            this.getSmsCodeDisabled = ko.observable()

            this.getSmsCode = function () {
                this.getSmsCodeDisabled(true)
                this.getSmsCodeText(window.i18n('发送中...'))
                this.errorMsg('')
                $.betterPost('/api/1/user/sms_verification/send', {phone: this.params().phone})
                    .done(_.bind(function (data) {
                        this.errorMsg(window.i18n('验证码发送成功'))
                    }, this))
                    .fail(_.bind(function (ret) {
                        this.errorMsg(window.i18n('验证码发送失败'))
                    }, this))
                    .always(_.bind(function () {
                        this.countdown()
                        this.needMannuallyVerify(true)
                    }, this))
            }
            this.countdown = function () {
                var time = 60
                function update() {
                    if(time === 0) {
                        this.getSmsCodeDisabled(false)
                        this.getSmsCodeText(window.i18n('重新获取验证码'))
                        this.verificationCount(this.verificationCount() + 1)
                    } else {
                        var text = i18n('{time}s后可再次获取', {time: time--})
                        this.getSmsCodeText(text)
                        setTimeout(_.bind(update, this), 1000)
                    }
                }
                update.call(this)
            }

            this.smsVerifyPhone = function () {
                return window.Q($.betterPost('/api/1/user/' + this.user().id + '/sms_verification/verify', {code: this.smsCode()}))
            }

            this.tryVoiceVerification = function () {
                this.useSmsVerification(false)
                this.needMannuallyVerify(false)
                this.voiceVerifyButtonAction()
            }

            this.voiceHint = ko.observable()
            this.voiceVerifyButtonText = ko.observable(window.i18n('语音验证手机号'))
            this.voiceVerifyButtonDisabled = ko.observable()
            this.voiceVerifyButtonAction = function () {
                this.voiceVerifyButtonDisabled(true)
                this.voiceVerifyButtonText(window.i18n('发送中...'))
                this.errorMsg('')
                var params = {
                    phone: this.params().phone,
                    verify_method: 'call'
                }
                $.betterPost('/api/1/user/sms_verification/send', params)
                    .done(_.bind(function (data) {
                        this.errorMsg(window.i18n('发送成功'))
                        this.voiceVerifyButtonText(window.i18n('语音验证手机号'))
                        this.startVerificationTimer()
                        this.startCheckVoiceVerfication()
                    }, this))
                    .fail(_.bind(function (ret) {
                        this.errorMsg(window.i18n('发送失败'))
                        this.voiceVerifyButtonDisabled(false)
                        this.voiceVerifyButtonText(window.i18n('语音验证手机号'))
                    }, this))
            }


            this.xhr = null
            this.startCheckVoiceVerfication =  function () {
                var phone = this.params().phone
                if (this.xhr && this.xhr.readyState !== 4) {
                    this.xhr.abort()
                }
                this.xhr = $.get('/api/1/user/sms_verfication/sinch_call_check', {phone: phone})
                    .success(_.bind(function (data) {
                        if (data.ret === 0) {
                            this.errorMsg(window.i18n('发送成功'))
                            this.phoneVerified(true)
                        } else {
                            this.startCheckVoiceVerfication()
                        }
                    }, this)).fail(_.bind(function (xhr) {
                        if (xhr.statusText !== 'abort') {
                            this.startCheckVoiceVerfication()
                        }
                    }, this))
            }

            this.startVerificationTimer = function () {
                var voiceHint = this.voiceHint
                var voiceVerifyButtonDisabled = this.voiceVerifyButtonDisabled
                var voiceVerifyButtonText = this.voiceVerifyButtonText
                var sec = 60
                var timer = setInterval(function(){
                    if(sec === 0){
                        voiceHint(window.i18n('请按照语音提示操作（默认按手机键盘上数字1即可验证成功），如果没有接到联系电话，请重试'))
                        clearInterval(timer)
                        voiceVerifyButtonDisabled(false)
                        voiceVerifyButtonText(window.i18n('语音验证手机号'))
                    }
                    else {
                        var stringTemplate = window.i18n('请按照语音提示操作（默认按手机键盘上数字1即可验证成功），如果没有接到联系电话，请{sec}s后重试', {sec: sec})
                        voiceHint(stringTemplate)
                        sec--
                    }
                },1000)
            }

            this.registerUserDisabled = ko.observable(false)

            this.user.subscribe(function (user) {
                if(user) {
                    this.nickname(user.nickname)
                    if (user.face) {
                        this.face(user.face)
                    }
                    this.country(_.find(this.countryCodeList(), {countryCode: user.country_code.toString()}))
                    this.phone(user.phone)
                    this.email(user.email)
                    if(user.gender) {
                        this.gender(user.gender)
                    }
                    this.phoneVerified(!!user.phone_verified)
                }
            }, this)

            this.initCaptcha = function () {
                if(!this.user()) {
                    window.project.showRecaptcha('captcha_div')
                    window.refreshCaptcha = function () {
                        window.project.showRecaptcha('captcha_div')
                    }
                }
            }
            this.initCaptcha()

            this.setParams = function (params) {
                this.rentAvailableTime(params.rent_available_time)
                if(params.rent_deadline_time) {
                    this.rentDeadlineTime(params.rent_deadline_time)
                }
                this.tenantCount(params.tenant_count.toString())
                this.birthTime(params.date_of_birth)
                this.gender(params.gender)
                if (params.face) {
                    this.face(params.face)
                }
                this.occupation(params.occupation.id)
                if(params.referrer) {
                    if(/[a-z0-9]{24}/.test(params.referrer)) {
                        this.referrer(params.referrer)
                    } else {
                        this.referrerText(params.referrer)
                    }
                }
            }

            this.params = ko.computed(function () {
                var params = {
                    nickname: this.nickname(),
                    phone: '+' + (this.country() ? this.country().countryCode : '') + this.phone(),
                    email: this.email(),/*
                    tenant_count: this.tenantCount(),*/
                    gender: this.gender(),
                    date_of_birth: this.birthTime(),
                    occupation: this.occupation(),
                    face: this.face(),
                    disable_matching: true,
                    interested_rent_tickets: JSON.stringify([this.ticketId()]),
                    rent_available_time: this.rentAvailableTime(),
                    rent_deadline_time: this.rentDeadlineTime(),
                    referrer: this.referrerText() || this.referrer(),
                    status: 'requested',
                }

                if (this.hesaUniversity()) {
                    params.hesa_university = this.hesaUniversity().hesa_university
                }
                else {            
                    params.other_university = this.otherUniversity()
                }
                return params 
            }, this)

            this.registerParams = ko.computed(function () {
                return {
                    country: this.country() ? this.country().code : '',
                    nickname: this.nickname(),
                    phone: '+' + (this.country() ? this.country().countryCode : '') + this.phone(),
                    email: this.email(),
                    gender: this.gender(),
                    occupation: this.occupation(),
                    referral: this.referral()
                }
            }, this)

            this.errorMsg = ko.observable()
            this.errorMsg.subscribe(function (msg) {
                if(msg.length) {
                    window.dhtmlx.message({ type:'error', text: window.getErrorMessageFromErrorCode(msg)})
                }
            })

            

            this.validate = function () {
                var errorList = []
                var config = {
                    nickname: function () {
                        if(!this.params().nickname) {
                            return errorList.push(window.i18n('姓名不能为空'))
                        }
                        if(window.project.includePhoneOrEmail(this.params().nickname)) {
                            return errorList.push(window.i18n('姓名中不能包含电话或者email'))
                        }
                    },
                    gender: function () {
                        if(!this.params().gender) {
                            return errorList.push(window.i18n('请选择性别'))
                        }
                    },
                    occupation: function () {
                        if(!this.params().occupation) {
                            return errorList.push(window.i18n('请选择职业'))
                        }
                        if(this.getOccupationSlug(this.params().occupation) !== 'student' && window.project.isStudentHouse(this.rentTicket())) {
                            return errorList.push(window.i18n('抱歉，只有学生才能入住学生公寓'))
                        }
                    },
                    university: function () {
                        if(this.getOccupationSlug(this.params().occupation) === 'student') {
                            if (!this.hesaUniversity() && !this.otherUniversity()) {
                                return errorList.push(window.i18n('请填写大学'))
                            }
                        }
                    },
                    birthday: function () {
                        if(isNaN(this.params().date_of_birth)) {
                            return errorList.push(window.i18n('请填写生日'))
                        }
                    },
                    referrer: function () {
                        if(!this.params().referrer) {
                            return errorList.push(window.i18n('请选择您是从哪里听说洋房东的'))
                        }
                    },
                    phone: function () {
                        if(!this.phone()) {
                            return errorList.push(window.i18n('请填写电话'))
                        }
                    },
                    email: function () {
                        if(!this.params().email) {
                            return errorList.push(window.i18n('请填写邮箱'))
                        }
                        if(!window.project.emailReg.test(this.params().email)) {
                            return errorList.push(window.i18n('邮箱格式不正确'))
                        }
                    },
                    captchaCode: function () {
                        if(!this.user() && !$('[name=solution]').val()) {
                            return errorList.push(window.i18n('请填写验证码'))
                        }
                    },
                    smsCode: function () {
                        if(this.useSmsVerification() &&!this.phoneVerified() && !this.smsCode()) {
                            return errorList.push(window.i18n('请填写短信验证码'))
                        }
                    },
                    uploading: function () {
                        if(this.uploading()) {
                            return errorList.push(window.i18n('图片还在上传中，请稍后再提交'))
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
            this.validateRegister = function () {
                return this.validate('nickname', 'gender', 'occupation', 'university', 'birthday', 'phone', 'email', 'captchaCode')
            }
            this.registerUser = function () {
                if(this.validateRegister()) {
                    this.registerUserDisabled(true)
                    var params = this.registerParams()
                    if(_.isEmpty(params.referral) || params.referral === ''){
                        delete params.referral
                    }
                    $.betterPost('/api/1/user/register', _.extend(params, {
                        challenge: $('[name=challenge]').val(),
                        solution: $('[name=solution]').val()
                    }))
                        .done(_.bind(function (val) {
                            window.user = val
                            this.user(val)
                            this.getSmsCode()
                            ga('send', 'event', 'rent-request', 'result', 'signup-success')
                        }, this))
                        .fail(_.bind(function (ret, data) {
                            this.errorMsg(window.getErrorMessageFromErrorCode(ret, '', data))
                            ga('send', 'event', 'rent-request', 'result', 'signup-failed',window.getErrorMessageFromErrorCode(ret))
                            window.project.showRecaptcha('captcha_div')
                        }, this))
                        .always(_.bind(function () {
                            this.registerUserDisabled(false)
                        }, this))
                }
            }

            this.id = ko.observable()
            this.requirements = (function () {
                var keyList = ['occupation', 'min_age', 'max_age', 'gender_requirement', 'accommodates', 'rent_available_time', 'rent_deadline_time', 'minimum_rent_period']
                var requirements = {}
                _.each(keyList, function (key) {
                    if(rentTicket[key] !== undefined && rentTicket[key] !== false && rentTicket[key] !== '') {
                        requirements[key] = rentTicket[key]
                    }
                })
                return requirements
            })()
            this.getOccupationName = function (id) {
                return (_.find(this.occupationList(), {id: id}) || {}).value
            }
            this.getOccupationSlug = function (id) {
                return (_.find(this.occupationList(), {id: id}) || {}).slug
            }
            this.getGenderName = function (slug) {
                return {'male': i18n('男'), 'female': i18n('女')}[slug]
            }
            this.unmatchRequirements = ko.computed(function () {
                var unmatchRequirements = []
                var age = new Date().getYear() - new Date(this.birthTime() * 1000).getYear()
                
                if(this.requirements.occupation && this.occupation() !== this.requirements.occupation.id) {
                    unmatchRequirements.push({
                        request: i18n('入住者职业：') + this.getOccupationName(this.occupation()),
                        requirement: this.requirements.occupation.value,
                    })
                }
                if(this.requirements.min_age && age < this.requirements.min_age) {
                    unmatchRequirements.push({
                        request: i18n('入住者年龄：') + age + i18n('岁'),
                        requirement: i18n('最小年龄') + this.requirements.min_age + i18n('岁'),
                    })
                }
                if(this.requirements.max_age && age > this.requirements.max_age) {
                    unmatchRequirements.push({
                        request: i18n('入住者年龄：') + age + i18n('岁'),
                        requirement: i18n('最大年龄') + this.requirements.max_age + i18n('岁'),
                    })
                }
                if(this.requirements.accommodates && this.tenantCount() > this.requirements.accommodates) {
                    unmatchRequirements.push({
                        request: i18n('入住人数：') + this.tenantCount() + i18n('人'),
                        requirement: i18n('可入住') + this.requirements.accommodates + i18n('人'),
                    })
                }
                if(this.requirements.gender_requirement && this.gender() !== this.requirements.gender_requirement) {
                    unmatchRequirements.push({
                        request: i18n('入住者性别：') + this.getGenderName(this.gender()),
                        requirement: this.getGenderName(this.requirements.gender_requirement),
                    })
                }
                return unmatchRequirements
            }, this)
            this.submit = function () {
                ga('send', 'event', 'rentRequestIntention', 'click', 'submit-button')
                if(!this.validate('nickname', 'gender', 'occupation', 'university', 'birthday', 'phone', 'email', 'captchaCode', 'smsCode')) {
                    return
                }                

                if (!this.phoneVerified()) {
                    if (this.needMannuallyVerify()) {
                        this.smsVerifyPhone()
                            .then(_.bind(function () {
                                this.phoneVerified(true)
                                this.submitTicket()
                            }, this))
                            .fail(_.bind(function (ret) {
                                this.errorMsg(window.getErrorMessageFromErrorCode(ret))
                            }, this))
                    }
                    else {
                        this.errorMsg(window.i18n('请验证手机号码'))
                    }
                }
                else {
                    this.submitTicket()
                }
            }

            this.submitDisabled = ko.observable()
            this.requestTicketId = ko.observable()
            this.shortId = ko.observable()
            this.shortIdStatus = ko.observable('loading')
            this.submitTicket = function () {
                this.submitDisabled(true)
                $.betterPost('/api/1/rent_intention_ticket/add', this.params())
                    .done(_.bind(function (val) {
                        window.team.setUserType('tenant')
                        location.href = (this.requestType() === 'booked' ? '/payment-checkout/'+val : '/user-chat/'+val+'/details')
                    }, this))
                    .fail(_.bind(function (ret) {
                        this.errorMsg(window.getErrorMessageFromErrorCode(ret))
                    }, this))
                    .always(_.bind(function () {
                        this.submitDisabled(false)
                    }, this))
            }
            

            this.formWrapVisible = ko.observable()
            

            function formatPrice(priceObj) {
                return _.extend(priceObj, {
                    value: parseInt(priceObj.value)
                })
            }
            this.price = ko.observable(formatPrice(params.price))
            this.priceLocal = ko.computed(function () {
                if(this.price().localized_value && this.price().localized_unit_symbol) {
                    return {
                        value: parseInt(this.price().localized_value),
                        unit_symbol: this.price().localized_unit_symbol
                    }
                } else {
                    return {}
                }
            }, this)
            this.holdingDeposit = ko.observable(formatPrice(params.holdingDeposit || {unit: 'GBP', unit_symbol: '£', value: '500.0'}))
            this.holdingDepositLocal = ko.computed(function () {
                if(this.holdingDeposit().localized_value && this.holdingDeposit().localized_unit_symbol) {
                    return {
                        value: parseInt(this.holdingDeposit().localized_value),
                        unit_symbol: this.holdingDeposit().localized_unit_symbol
                    }
                } else {
                    return {}
                }
            }, this)

            this.couponDiscount = ko.observable('');
            this.couponLocalizedDiscount = ko.observable('')
            var theSelf = this
            this.fetchCoupon = function() {
                $.betterGet('/api/1/coupon/search').done(function (array) {
                    if (array.length) {
                        var coupon = array[0]
                        if (coupon.category && coupon.category.slug === 'rent_coupon') {
                            var discount = coupon.discount
                            theSelf.couponDiscount(discount.unit_symbol + discount.value)
                            if (discount.localized_unit_symbol && discount.localized_value) {
                                theSelf.couponLocalizedDiscount(discount.localized_unit_symbol + parseInt(discount.localized_value))
                            }
                        }
                    }
                })
            }
            
            $('body').on('openRentSignupPopup', function (e, ticketId, requestType, ticketRentAvailableTime, ticketRentDeadlineTime) {
                this.open(true)
                this.ticketId(ticketId)
                this.rentAvailableTime(ticketRentAvailableTime)
                this.rentDeadlineTime(ticketRentDeadlineTime)
                this.requestType(requestType)
                //Let the phone field number only for editing and paste
                var phoneInput = $('rent-signup-popup input.phone').get(0)                
                window.inputTypeNumberPolyfill.polyfillElement(phoneInput)
            }.bind(this))
        },
        template: { element: 'rent-signup-popup-tpl' }
    })


    ko.components.register('chosen-referrer', {
        viewModel: function (params) {
            this.parentVM = params.vm
            this.list = ko.observableArray([])
            this.referrerText = ko.computed({
                read: function () {
                    return this.parentVM.referrerText()
                },
                write: function (value) {
                    this.parentVM.referrerText(value)
                }
            }, this)

            this.selectedReferrer = ko.observable()
            this.selectedReferrer.subscribe(function (value) {
                if(value === undefined) {
                    this.parentVM.referrer(value)
                    this.referrerText('')
                }
                if(_.find(this.list(), {id: value}) && _.find(this.list(), {id: value}).slug !== 'other') {
                    this.parentVM.referrer(value)
                    this.referrerText('')
                }
            }, this)
            this.parentVM.referrer.subscribe(function (value) {
                if(_.find(this.list(), {id: value})) {
                    this.selectedReferrer(_.find(this.list(), {id: value}).id)
                }
            }, this)
            this.parentVM.referrerText.subscribe(function (value) {
                if(value.length) {
                    this.selectedReferrer(_.find(this.list(), {slug: 'other'}).id)
                }
            }, this)
            window.project.getEnum('user_referrer')
                .then(_.bind(function (data) {
                    this.list(data)
                }, this))
        },
        template: { element: 'choseReferrer'}
    })



})(window.ko);
