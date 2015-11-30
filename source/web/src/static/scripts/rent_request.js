(function (ko) {
    window.openRentRequestForm = function (ticketId, isPopup) {
        $('body').trigger('openRentRequestForm', Array.prototype.slice.call(arguments))
    }
    ko.components.register('rent-request', {
        viewModel: function(params) {
            this.step = ko.observable(1)
            this.goNext = function () {
                if(this.validateStep1()) {
                    this.step(this.step() + 1)
                }
            }
            this.goPrev = function () {
                this.errorMsg('')
                this.step(this.step() - 1)
            }

            this.visible = ko.observable()
            this.open = function (isPopup) {
                this.visible(true)
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
            }
            this.close = function () {
                this.visible(false)
            }


            this.ticketId = ko.observable()

            this.rentAvailableTimeFormated = ko.observable($.format.date(new Date(), 'yyyy-MM-dd'))
            this.rentAvailableTime = ko.computed(function () {
                return this.rentAvailableTimeFormated() ? new Date(this.rentAvailableTimeFormated()).getTime() / 1000 : ''
            }, this)

            this.rentDeadlineTimeFormated = ko.observable()
            this.rentDeadlineTime = ko.computed(function () {
                return this.rentDeadlineTimeFormated() ? new Date(this.rentDeadlineTimeFormated()).getTime() / 1000: ''
            }, this)

            this.tenantCountList = ko.observableArray([1,2,3,4,5,6,7,8])
            this.tenantCount = ko.observable(1)

            this.smoke = ko.observable(false)
            this.baby = ko.observable(false)
            this.pet = ko.observable(false)

            this.description = ko.observable()

            this.visa = ko.observable()
            this.uploadProgressVisible = ko.observable(false)
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
                        this.uploadProgressVisible(false)
                    }, this),
                    deleteCallback: _.bind(function(data, pd){
                        this.visa('')
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
                            return window.alert(window.i18n('上传错误：错误代码') + '(' + data.ret + '),' + data.debug_msg)
                        }
                        pd.progressDiv.hide()
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
                        this.uploadProgressVisible(true)
                    }, this),
                    onError: _.bind(function (files,status,errMsg,pd) {
                        //files: list of files
                        //status: error status
                        //errMsg: error message
                        window.alert(i18n('图片') + files.toString() + i18n('上传失败(') + status + ':' + errMsg + i18n(')，请重新上传'))
                        this.uploadProgressVisible(false)
                    }, this)
                }
                if(window.team.getClients().indexOf('ipad') >= 0) {
                    uploadFileConfig.allowDuplicates = true
                }
                $('#fileuploader').uploadFile(uploadFileConfig)

            }
            this.initUpload()

            this.user = ko.observable(window.user) //当前登录用户

            this.nickname = ko.observable(this.user() ? this.user().nickname : '')

            this.genderList = ko.observableArray([{
                text: window.i18n('男'),
                value: 'male'
            },{
                text: window.i18n('女'),
                value: 'female'
            }])
            this.genderObj = ko.observable(this.user() ? _.find(this.genderList(), {value: this.user().gender}) : undefined)

            this.occupationList = ko.observableArray([])
            window.project.getEnum('occupation')
                .then(_.bind(function (arr) {
                    this.occupationList(arr)
                }, this))
            this.occupationObj = ko.observable(this.user() ? _.find(this.occupationList(), {id: this.user().occupation}) : undefined)

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
            this.birthYear = ko.observable(new Date().getFullYear())
            this.birthMonthList = ko.observableArray(window.team.generateArray(12))
            this.birthMonth = ko.observable(1)
            this.birthDateList = ko.computed(function () {
                return generateDateList(this.birthYear(), this.birthMonth())
            }, this)
            this.birthDate = ko.observable(1)
            this.birthDay = ko.observable()
            this.birthTime = ko.computed(function () {
                return window.team.isPhone() ? (new Date(this.birthDay()).getTime() / 1000) : (new Date(this.birthYear(), this.birthMonth(), this.birthDate()).getTime() / 1000)
            }, this)

            this.countryCodeList = ko.observableArray(_.map(JSON.parse($('#countryData').text()), function (country) {
                country.name = window.team.countryMap[country.code]
                country.countryCode = window.team.countryCodeMap[country.code]
                return country
            }))
            this.country = ko.observable(this.user() ? _.find(this.countryCodeList(), {countryCode: this.user().country_code.toString()}) : this.countryCodeList()[0])
            this.phone = ko.observable(this.user() ? this.user().phone : '')
            this.email = ko.observable(this.user() ? this.user().email : '')

            this.phoneVerified = ko.observable(this.user() ? this.user().phone_verified : false)
            this.smsCode = ko.observable()
            this.getSmsCodeText = ko.observable(window.i18n('发送短信验证码'))
            this.getSmsCodeDisabled = ko.observable()
            this.getSmsCode = function () {
                this.getSmsCodeDisabled(true)
                this.getSmsCodeText(window.i18n('发送中...'))
                $.betterPost('/api/1/user/sms_verification/send', {phone: this.params().phone})
                    .done(_.bind(function (data) {
                        this.errorMsg(window.i18n('验证码发送成功'))
                    }, this))
                    .fail(_.bind(function (ret) {
                        this.errorMsg(window.i18n('验证码发送失败'))
                    }, this))
                    .always(_.bind(function () {
                        this.countdown()
                    }, this))
            }
            this.countdown = function () {
                var text = i18n('{time}s后可再次获取')
                var time = 60
                function update() {
                    if(time === 0) {
                        this.getSmsCodeDisabled(false)
                        this.getSmsCodeText(window.i18n('重新获取验证码'))
                    } else {
                        this.getSmsCodeText(text.replace('{time}', time--))
                        setTimeout(_.bind(update, this), 1000)
                    }
                }
                update.call(this)
            }

            this.registerUserDisabled = ko.observable(false)

            this.user.subscribe(function (user) {
                if(user) {
                    this.nickname(user.nickname)
                    this.country(_.find(this.countryCodeList(), {countryCode: user.country_code.toString()}))
                    this.phone(user.phone)
                    this.email(user.email)
                    if(user.occupation) {
                        this.occupationObj(_.find(this.occupationList(), {id: user.occupation.id}))
                    }
                    if(user.gender) {
                        this.genderObj(_.find(this.genderList(), {value: user.gender}))
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

            this.params = ko.computed(function () {
                return {
                    nickname: this.nickname(),
                    phone: '+' + (this.country() ? this.country().countryCode : '') + this.phone(),
                    email: this.email(),
                    tenant_count: this.tenantCount(),
                    gender: this.genderObj() ? this.genderObj().value : '',
                    date_of_birth: this.birthTime(),
                    occupation: this.occupationObj() ? this.occupationObj().id : '',
                    smoke: this.smoke(),
                    baby: this.baby(),
                    pet: this.pet(),
                    visa: this.visa(),
                    disable_matching: true,
                    interested_rent_tickets: JSON.stringify([this.ticketId()]),
                    rent_available_time: this.rentAvailableTime(),
                    rent_deadline_time: this.rentDeadlineTime(),
                    description: this.description(),
                    status: 'requested',
                }
            }, this)

            this.registerParams = ko.computed(function () {
                return {
                    country: this.country() ? this.country().code : '',
                    nickname: this.nickname(),
                    phone: '+' + (this.country() ? this.country().countryCode : '') + this.phone(),
                    email: this.email(),
                    gender: this.genderObj() ? this.genderObj().value : '',
                    occupation: this.occupationObj() ? this.occupationObj().id : '',
                }
            }, this)

            this.errorMsg = ko.observable()
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
                        if(this.params().rent_available_time > this.params().rent_deadline_time) {
                            return errorList.push(window.i18n('起租日期不能晚于结束日期'))
                        }
                    },
                    description: function () {
                        if(!this.params().description) {
                            errorList.push(window.i18n('请填写写下您入住的原因和对房东的问题'))
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
                    },
                    birthday: function () {
                        if(isNaN(this.params().date_of_birth)) {
                            return errorList.push(window.i18n('请填写生日'))
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
                        if(!this.phoneVerified() && !this.smsCode()) {
                            return errorList.push(window.i18n('请填写短信验证码'))
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
                return this.validate('rentTime', 'description')
            }
            this.validateRegister = function () {
                return this.validate('nickname', 'gender', 'occupation', 'phone', 'email', 'captchaCode')
            }
            this.registerUser = function () {
                if(this.validateRegister()) {
                    this.registerUserDisabled(true)
                    $.betterPost('/api/1/user/register', _.extend(this.registerParams(), {
                        challenge: $('[name=challenge]').val(),
                        solution: $('[name=solution]').val()
                    }))
                        .done(_.bind(function (val) {
                            window.user = val
                            this.user(val)
                            this.getSmsCode()
                            ga('send', 'event', 'rent-request', 'result', 'signup-success')
                        }, this))
                        .fail(_.bind(function (ret) {
                            this.errorMsg(window.getErrorMessageFromErrorCode(ret))
                            ga('send', 'event', 'rent-request', 'result', 'signup-failed',window.getErrorMessageFromErrorCode(ret))
                            window.project.showRecaptcha('captcha_div')
                        }, this))
                        .always(_.bind(function () {
                            this.registerUserDisabled(false)
                        }, this))
                }
            }

            this.id = ko.observable()
            this.submit = function () {
                if(!this.validate()) {
                    return
                }
                if(this.phoneVerified()) {
                    this.submitTicket()
                } else {
                    this.verifyPhone()
                        .then(_.bind(function () {
                            this.submitTicket()
                        }, this))
                        .fail(_.bind(function (ret) {
                            this.errorMsg(window.getErrorMessageFromErrorCode(ret))
                        }, this))
                }
            }
            this.verifyPhone = function () {
                return window.Q($.betterPost('/api/1/user/' + this.user().id + '/sms_verification/verify', {code: this.smsCode()}))
            }
            this.submitDisabled = ko.observable()
            this.submitTicket = function () {
                this.submitDisabled(true)
                $.betterPost('/api/1/rent_intention_ticket/add', this.params())
                    .done(_.bind(function (val) {
                        this.showSuccessWrap()
                    }, this))
                    .fail(_.bind(function (ret) {
                        this.errorMsg(window.getErrorMessageFromErrorCode(ret))
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
            }

            $('body').on('openRentRequestForm', function (e, ticketId, isPopup) {
                this.ticketId(ticketId)
                this.open(isPopup)
            }.bind(this))
            $('body').trigger('rentRequestReady')
        },
        template: { element: 'rent-request-tpl' }
    })

    ko.components.register('whether-radio', {
        viewModel: function (params) {
            this.key = ko.observable('whether-radio-' + params.key)
            this.parentVM = params.vm
            this.value = ko.observable(this.parentVM[params.key]())
            this.value.subscribe(function (value) {
                this.parentVM[params.key](!!value)
            }, this)
        },
        template: { element: 'whetherRadio'}
    })


})(window.ko)