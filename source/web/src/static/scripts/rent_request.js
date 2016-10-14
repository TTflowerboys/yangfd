(function (ko) {

    window.openRentRequestForm = function (ticketId, isPopup) {
        var args = arguments
        if (window.user) {
            $.betterPost('/api/1/rent_intention_ticket/search', { interested_rent_tickets: ticketId, user_id: window.user.id})
                .done(function (data) {
                    var array = data
                    if (array && array.length > 0) {
                        window.dhtmlx.message({ type: 'error', text: window.i18n('您已经对此房源提交过咨询，如需继续咨询请您使用洋房东为您已匹配的邮件或短信系统沟通，谢谢。') })
                    } else {
                        $('body').trigger('openRentRequestForm', Array.prototype.slice.call(args))
                    }
                    $('.buttonLoading').trigger('end')

                })
                .fail(function (ret) {
                    window.dhtmlx.message({ type: 'error', text: window.getErrorMessageFromErrorCode(ret) })
                    $('.buttonLoading').trigger('end')
                })
        }
        else {
            $('body').trigger('openRentRequestForm', Array.prototype.slice.call(args))
            $('.buttonLoading').trigger('end')
        }
    }
    ko.components.register('rent-request', {
        viewModel: function(params) {
            var rentTicket = JSON.parse($('#rentTicketData').text())
            var oldUser = window.user
            this.rentTicket = ko.observable(JSON.parse($('#rentTicketData').text()))
            this.openRentRequestForm = function (ticketId, isPopup) {
                return function () {
                    window.openRentRequestForm(ticketId, isPopup)
                }
            }
            this.scrollTopOnMobile = function () {
                if (window.team.isPhone()) {
                    $('body,html').animate({scrollTop: 0}, 0)
                }
            }
            this.step = ko.observable(1)
            this.goNext = function () {
                if(this.validateStep1()) {
                    this.step(this.step() + 1)
                    this.scrollTopOnMobile()
                    ga('send', 'pageview', '/submit-rent-request-intention/step-' + this.step())
                    //_hmt.push(['_trackPageview', '/submit-rent-request-intention/step-' + this.step()])
                }
                ga('send', 'event', 'rentRequestIntention', 'click', 'go-to-next-rent-request-intention')
            }
            this.goPrev = function () {
                this.errorMsg('')
                this.step(this.step() - 1)
                this.scrollTopOnMobile()
                ga('send', 'event', 'rentRequestIntention', 'click', 'go-to-prev-rent-request-intention')
                ga('send', 'pageview', '/submit-rent-request-intention/step-' + this.step())
                //_hmt.push(['_trackPageview', '/submit-rent-request-intention/step-' + this.step()])
            }

            this.visible = ko.observable()
            this.open = function (isPopup) {
                this.visible(true)
                this.step(1)
                this.isConfirmed(false)
                this.formWrapVisible(true)
                this.successWrapVisible(false)
                if(isPopup) {
                    var popup = $('#rent_request_popup')
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
                ga('send', 'event', 'rentRequestIntention', 'click', 'open-rent-request-intention')
                ga('send', 'pageview', '/submit-rent-request-intention/open')
                //_hmt.push(['_trackPageview', '/submit-rent-request-intention/open'])
            }
            this.close = function () {
                this.visible(false)
                //user register, need reload
                if (oldUser !== window.user) {
                    location.reload(true)
                }
            }


            this.ticketId = ko.observable()

            this.rentAvailableTimeFormated = ko.observable($.format.date(new Date(), 'yyyy-MM-dd'))
            this.rentAvailableTime = ko.computed({
                read: function () {
                    return this.rentAvailableTimeFormated() ? new Date(this.rentAvailableTimeFormated()).getTime() / 1000 : ''
                },
                write: function (value) {
                    this.rentAvailableTimeFormated($.format.date(new Date(value * 1000), 'yyyy-MM-dd'))
                }
            }, this)

            this.rentDeadlineTimeFormated = ko.observable()
            this.rentDeadlineTime = ko.computed({
                read: function () {
                    return this.rentDeadlineTimeFormated() ? new Date(this.rentDeadlineTimeFormated()).getTime() / 1000: ''
                },
                write: function (value) {
                    this.rentDeadlineTimeFormated($.format.date(new Date(value * 1000), 'yyyy-MM-dd'))
                }
            }, this)

            this.tenantCountList = ko.observableArray([1,2,3,4,5,6,7,8])
            this.tenantCount = ko.observable(1)

            this.smoke = ko.observable(false)
            this.baby = ko.observable(false)
            this.pet = ko.observable(false)

            this.description = ko.observable()

            this.visa = ko.observable()
            this.uploadProgressVisible = ko.observable(false)
            this.uploading = ko.observable()
            this.initUpload = function() {
                var uploadFileConfig = {
                    url: '/api/1/upload_image',
                    fileName: 'data',
                    formData: {watermark: true},
                    //showProgress: true,
                    showPreview: true,
                    showDelete: true,
                    showDone: false,
                    previewWidth: '100%',
                    previewHeight: '100%',
                    showQueueDiv: 'uploadProgress',
                    maxFileCount: 1, //最多上传12张图片
                    maxFileSize: 2 * 1024 * 1024, //允许单张图片文件的最大占用空间为2M
                    uploadFolder: '',
                    allowedTypes: 'jpg,jpeg,png,gif',
                    acceptFiles: 'image/',
                    allowDuplicates: false,
                    statusBarWidth: '100%',
                    dragdropWidth: '100%',
                    multiDragErrorStr: window.i18n('不允许同时拖拽多个文件上传.'),
                    extErrorStr: window.i18n('不允许上传. 允许的文件扩展名: '),
                    duplicateErrorStr: window.i18n('不允许上传. 文件已存在.'),
                    sizeErrorStr: window.i18n('不允许上传. 允许的最大尺寸为: '),
                    uploadErrorStr: window.i18n('不允许上传'),
                    maxFileCountErrorStr: window.i18n(' 不允许上传. 上传最大文件数为:'),
                    abortStr: window.i18n('停止'),
                    cancelStr: window.i18n('取消'),
                    deletelStr: window.i18n('删除'),
                    abortCallback: _.bind(function () {
                        this.uploading(false)
                        this.uploadProgressVisible(false)
                    }, this),
                    deleteCallback: _.bind(function(data, pd){
                        this.visa('')
                        this.uploading(false)
                        this.uploadProgressVisible(false)
                    }, this),
                    onSuccess: _.bind(function(files, data, xhr, pd){
                        if(typeof data === 'string') { //This will happen in IE
                            try {
                                data = JSON.parse(data.match(/<pre>((.|\n)+)<\/pre>/m)[1])
                            } catch(e){
                                throw('Unexpected response data of uploading file!')
                            }
                        }
                        if(data.ret) {
                            this.uploadProgressVisible(false)
                            return window.dhtmlx.message({ type:'error', text: window.i18n('上传错误：错误代码') + '(' + data.ret + '),' + data.debug_msg})
                        }
                        pd.progressDiv.hide()
                        this.uploading(false)
                        this.visa(data.val.url)
                    }, this),
                    onLoad: _.bind(function(obj) {
                        var visa = this.visa()
                        if(visa) {
                            this.uploadProgressVisible(true)
                            obj.createProgress(visa)
                            var previewElem = $('#uploadProgress').find('.ajax-file-upload-statusbar').eq(0)
                            previewElem.attr('data-url', visa).find('.ajax-file-upload-progress').hide()
                        }
                    }, this),
                    onSubmit: _.bind(function () {
                        this.uploading(true)
                        this.uploadProgressVisible(true)
                    }, this),
                    onError: _.bind(function (files,status,errMsg,pd) {
                        //files: list of files
                        //status: error status
                        //errMsg: error message
                        return window.dhtmlx.message({ type:'error', text: window.i18n('图片') + files.toString() + i18n('上传失败(') + status + ':' + errMsg + i18n(')，请重新上传')})
                        this.uploadProgressVisible(false)
                        this.uploading(false)
                    }, this)
                }
                if(window.team.getClients().indexOf('ipad') >= 0) {
                    uploadFileConfig.allowDuplicates = true
                }
                $('#fileuploader').uploadFile(uploadFileConfig)

            }

            this.user = ko.observable(window.user) //当前登录用户

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
                    this.initParamsByLastSubmit()
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
                /* http://stackoverflow.com/questions/17836138/how-to-list-how-many-days-for-a-month-for-a-specific-year */
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
                    return window.team.isPhone() ? (new Date(this.birthDay()).getTime() / 1000) : (new Date(this.birthYear(), this.birthMonth() - 1, this.birthDate()).getTime() / 1000)
                },
                write: function (value) {
                    var formatedValue = $.format.date(new Date(value * 1000), 'yyyy-MM-dd')
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
            //推荐码
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
                var text = i18n('{time}s后可再次获取')
                var time = 60
                function update() {
                    if(time === 0) {
                        this.getSmsCodeDisabled(false)
                        this.getSmsCodeText(window.i18n('重新获取验证码'))
                        this.verificationCount(this.verificationCount() + 1)
                    } else {
                        this.getSmsCodeText(text.replace('{time}', time--))
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
                //use voice verification
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
                //abort request when user retry the verification
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
                        voiceHint(window.i18n('请按照语音提示操作（默认按手机键盘上数字1即可验证成功），如果没有接到联系电话，请') + sec + window.i18n('s 后重试'))
                        sec--
                    }
                },1000)
            }

            this.registerUserDisabled = ko.observable(false)

            this.user.subscribe(function (user) {
                if(user) {
                    this.nickname(user.nickname)
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
                this.smoke(params.smoke)
                this.baby(params.baby)
                this.pet(params.pet)
                this.visa(params.visa)
                this.description(params.description)
                this.birthTime(params.date_of_birth)
                this.gender(params.gender)
                this.occupation(params.occupation.id)
                if(params.referrer) {
                    if(/[a-z0-9]{24}/.test(params.referrer)) {
                        this.referrer(params.referrer)
                    } else {
                        this.referrerText(params.referrer)
                    }
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
                            this.initUpload()
                        }, this))
                        .fail(_.bind(function (ret) {
                            window.dhtmlx.message({ type:'error', text: window.getErrorMessageFromErrorCode(ret)})
                            this.initUpload()
                        }, this))
                } else {
                    this.initUpload()
                }
            }

            this.params = ko.computed(function () {
                var params = {
                    nickname: this.nickname(),
                    phone: '+' + (this.country() ? this.country().countryCode : '') + this.phone(),
                    email: this.email(),
                    tenant_count: this.tenantCount(),
                    gender: this.gender(),
                    date_of_birth: this.birthTime(),
                    occupation: this.occupation(),
                    smoke: this.smoke(),
                    baby: this.baby(),
                    pet: this.pet(),
                    visa: this.visa(),
                    disable_matching: true,
                    interested_rent_tickets: JSON.stringify([this.ticketId()]),
                    rent_available_time: this.rentAvailableTime(),
                    rent_deadline_time: this.rentDeadlineTime(),
                    description: this.description(),
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
                    rentTime: function () {
                        if(!this.params().rent_available_time) {
                            return errorList.push(window.i18n('请选择起租日期'))
                        }
                        if(!this.params().rent_deadline_time) {
                            return errorList.push(window.i18n('请选择租期结束日期'))
                        }
                        // Because selected date start from 0am, so current date should use yesterday
                        if(this.params().rent_available_time < (Date.now()/1000 - 24*60*60) ) {
                            return errorList.push(window.i18n('起租日期不能早于今天'))
                        }
                        if(this.params().rent_available_time > this.params().rent_deadline_time) {
                            return errorList.push(window.i18n('起租日期不能晚于结束日期'))
                        }
                        if(this.params().rent_available_time > this.params().rent_deadline_time - 24 * 60 * 60) {
                            return errorList.push(window.i18n('租期至少一天'))
                        }
                    },
                    description: function () {
                        var wordBlacklist = ['微信', '微博', 'QQ', '电话', 'weixin', 'wechat', 'whatsapp', 'facebook', 'weibo']
                        var description = this.params().description
                        if(!description) {
                            return errorList.push(window.i18n('请填写您入住的原因和对房东的问题'))
                        }
                        if (window.project.includePhoneOrEmail(description) || _.some(wordBlacklist, function (v) {
                                return description.toLowerCase().indexOf(v.toLowerCase()) !== -1
                            })) {
                            return errorList.push(window.i18n('请不要在描述中填写任何形式的联系方式'))
                        }
                    },
                    visa: function () {
                        if (!this.params().visa) {
                            return errorList.push(window.i18n('申请此房源需上传护照或身份信息'))    
                        }
                    },
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
            this.validateStep1 = function () {
                if (this.rentTicket().no_handling_fee) {
                    return this.validate('rentTime', 'description', 'visa')
                }
                else {
                    return this.validate('rentTime', 'description')
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
                var keyList = ['no_pet', 'no_smoking', 'no_baby', 'occupation', 'min_age', 'max_age', 'gender_requirement', 'accommodates', 'rent_available_time', 'rent_deadline_time', 'minimum_rent_period']
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
                if(this.requirements.no_smoking && this.smoke() === true) {
                    unmatchRequirements.push({
                        request: i18n('入住者吸烟'),
                        requirement: i18n('禁止吸烟'),
                    })
                }
                if(this.requirements.no_pet && this.pet() === true) {
                    unmatchRequirements.push({
                        request: i18n('入住者携带宠物'),
                        requirement: i18n('禁止携带宠物'),
                    })
                }
                if(this.requirements.no_baby && this.baby() === true) {
                    unmatchRequirements.push({
                        request: i18n('入住者携带小孩'),
                        requirement: i18n('禁止携带小孩'),
                    })
                }
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
                //考虑到时差问题，检查时对rent_available_time和rent_deadline_time宽限一天时间（即86400s）
                if(this.requirements.rent_available_time && (this.requirements.rent_available_time - 86400) > this.rentAvailableTime()) {
                    unmatchRequirements.push({
                        request: i18n('入住日期：') + $.format.date(new Date(this.rentAvailableTime() * 1000), 'yyyy-MM-dd'),
                        requirement: i18n('租期开始日期：') + $.format.date(new Date(this.requirements.rent_available_time * 1000), 'yyyy-MM-dd'),
                    })
                }
                if(this.requirements.rent_deadline_time && (this.requirements.rent_deadline_time + 86400) < this.rentDeadlineTime()) {
                    unmatchRequirements.push({
                        request: i18n('搬出日期：') + $.format.date(new Date(this.rentDeadlineTime() * 1000), 'yyyy-MM-dd'),
                        requirement: i18n('租期结束日期：') + $.format.date(new Date(this.requirements.rent_deadline_time * 1000), 'yyyy-MM-dd'),
                    })
                }

                if(this.requirements.minimum_rent_period && this.requirements.rent_available_time && this.requirements.rent_deadline_time && window.project.transferTime(this.requirements.minimum_rent_period, 'second').value_float > this.requirements.rent_deadline_time - this.requirements.rent_available_time) {
                    this.requirements.minimum_rent_period = window.project.transferTime(_.extend(_.clone(this.requirements.minimum_rent_period), {value_float: this.requirements.rent_deadline_time - this.requirements.rent_available_time, unit: 'second'}), 'day')
                }

                var rentTimeDeltaDay = (this.rentDeadlineTime() - this.rentAvailableTime()) / 86400
                if(rentTimeDeltaDay >= 27) {
                    rentTimeDeltaDay += 3
                }
                if(this.requirements.minimum_rent_period && (rentTimeDeltaDay < window.project.transferTime(this.requirements.minimum_rent_period, 'day').value_float)) {
                    unmatchRequirements.push({
                        request: i18n('您的租住天数：') + (this.rentDeadlineTime() - this.rentAvailableTime()) / 86400 + i18n('天'),
                        requirement: i18n('最短租期') + this.requirements.minimum_rent_period.value + window.team.parsePeriodUnit(this.requirements.minimum_rent_period.unit),
                    })
                }
                return unmatchRequirements
            }, this)
            this.submit = function () {
                ga('send', 'event', 'rentRequestIntention', 'click', 'submit-button')
                if(!this.validate('rentTime', 'description', 'nickname', 'gender', 'occupation', 'university', 'birthday', 'phone', 'email', 'captchaCode', 'smsCode',  'uploading')) {
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
                        this.errorMsg(window.i18n('请使用语音验证手机号码'))
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
            this.getShortId = function (ticketId) {
                $.betterGet('/api/1/rent_intention_ticket/' + ticketId)
                    .done(_.bind(function (val) {
                        if(val.short_id) {
                            this.shortIdStatus('success')
                            this.shortId(val.short_id)
                        } else {
                            this.getShortId(ticketId)
                        }
                    }, this))
                    .fail(_.bind(function () {
                        this.shortIdStatus('fail')
                    }, this))
            }
            this.submitTicket = function () {
                this.submitDisabled(true)
                $.betterPost('/api/1/rent_intention_ticket/add', this.params())
                    .done(_.bind(function (val) {
                        this.getShortId(val)
                        this.requestTicketId(val)
                        this.showSuccessWrap()
                        this.fetchCoupon()
                        window.team.setUserType('tenant')
                        ga('send', 'event', 'rentRequestIntention', 'result', 'submit-success')
                        ga('send', 'pageview', '/submit-rent-request-intention/submit-success')
                        //_hmt.push(['_trackPageview', '/submit-rent-request-intention/submit-success'])
                    }, this))
                    .fail(_.bind(function (ret) {
                        this.errorMsg(window.getErrorMessageFromErrorCode(ret))
                        ga('send', 'event', 'rentRequestIntention', 'result', 'submit-failed',window.getErrorMessageFromErrorCode(ret))
                    }, this))
                    .always(_.bind(function () {
                        this.submitDisabled(false)
                    }, this))
            }

            this.formWrapVisible = ko.observable()
            this.successWrapVisible = ko.observable()
            this.showSuccessWrap = function () {
                this.successWrapVisible(true)
                this.formWrapVisible(false)
                this.scrollTopOnMobile()
            }

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

            function getPayment(value, unit) {
                var minPayment = {
                    'CNY': 1898,
                    'GBP': 200,
                    'USD': 288,
                    'EUR': 264,
                    'HKD': 2244
                }
                return minPayment[unit] > value ? minPayment[unit] : value
            }
            this.payment = ko.computed(function () {
                if(this.rentDeadlineTime() && this.rentAvailableTime()) {
                    var day = (this.rentDeadlineTime() - this.rentAvailableTime()) / 3600 / 24
                    if(day < 30) {
                        return parseInt(this.price().value_float / 7 * day / 4)
                    } else {
                        return getPayment(parseInt(this.price().value_float), this.price().unit)
                    }
                }
            }, this)
            this.paymentLocal = ko.computed(function () {
                if(this.price().localized_value && this.price().localized_unit_symbol) {
                    return {
                        value: parseInt(parseFloat(this.price().localized_value) / parseFloat(this.price().value) * this.payment()),
                        unit_symbol: this.price().localized_unit_symbol
                    }
                } else {
                    return {}
                }
            }, this)
            this.isConfirmed = ko.observable(false)
            this.confirm = function () {
                this.isConfirmed(true)
                $.betterPost('/api/1/rent_intention_ticket/' + this.requestTicketId() +'/edit', {custom_fields: JSON.stringify([{key: 'payment_confirmed', value: 'true'}])})
                    .done(_.bind(function () {
                        ga('send', 'event', 'rent-request', 'result', 'payment-confirmed')
                        if(window.team.isPhone()) {
                            if (team.isCurrantClient('>1.2.0')) {
                                if (window.bridge !== undefined) {
                                    var goBack = function () {
                                        window.bridge.callHandler('queryControllers', null, function(urls) {
                                            var controllerUrl =_.find(urls, function (url) {
                                                return url.indexOf('/property-to-rent-list') !== -1
                                            })
                                            window.bridge.callHandler('goBackToController', controllerUrl)
                                        })
                                    }
                                    //user register, need reload
                                    if (oldUser !== window.user) {
                                        //login will refresh webview
                                        window.bridge.callHandler('updateUser', window.user, goBack)
                                    }
                                    else {
                                        goBack()
                                    }
                                }
                            }
                            else {
                                location.href = '/property-to-rent/' + this.ticketId()
                            }
                        } else {
                            this.close()
                        }
                    }, this))

            }
            this.isLearnMore = ko.observable(false)
            this.learnMore = function () {
                ga('send', 'event', 'rent-request', 'result', 'learn-more')
                this.isLearnMore(true)
            }
            $('body').on('openRentRequestForm', function (e, ticketId, isPopup) {
                this.ticketId(ticketId)
                this.open(isPopup)

                //Let the phone field number only for editing and paste
                var phoneInput = $('rent-request input.phone').get(0)                
                window.inputTypeNumberPolyfill.polyfillElement(phoneInput)
            }.bind(this))
            $('body').trigger('rentRequestReady')
        },
        template: { element: 'rent-request-tpl' }
    })

    ko.components.register('whether-radio', {
        viewModel: function (params) {
            this.radioItems = ko.observableArray(params.radioItems ? params.radioItems() : [{value: true, text: i18n('是')}, {value: false, text: i18n('否')}])
            this.key = ko.observable('whether-radio-' + params.key)
            this.parentVM = params.vm
            this.value = ko.computed({
                read: function () {
                    return this.parentVM[params.key]()
                },
                write: function (value) {
                    this.parentVM[params.key](value)
                }
            }, this)
        },
        template: { element: 'whetherRadio'}
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
