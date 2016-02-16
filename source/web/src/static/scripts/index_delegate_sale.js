(function (module) {
    var addressArray
    module.openDelegateSale = function (option) {
        option = option || {}
        if(window.team.isPhone()) {
            location.href = '/delegate-sale' + ($.param(option) ? '?' + $.param(option) : '')
            return
        }
        var popup = $('#delegate_sale_popup')
        module.resetDelegateSaleForm(popup, option)
        popup.find('.requirement_title').show()
        showDelegateRentCancelButton(popup)

        module.setupDelegateSaleForm(popup, option, function () {

        })

        var wrapper = popup.find('.requirement_wrapper')
        var headerHeight = wrapper.outerHeight() - wrapper.innerHeight()
        if (wrapper.outerHeight() - headerHeight > $(window).height()) {
            wrapper.css('top', $(window).scrollTop() - headerHeight)
        }
        else {
            wrapper.css('top', $(window).scrollTop() - headerHeight + ($(window).height() - (wrapper.outerHeight() - headerHeight)) / 2)
        }
    }


    module.resetDelegateSaleForm = function resetDelegateSaleForm (container, option) {
        var successArea = container.find('.requirement .successWrap')
        successArea.hide().siblings().show()
        var $errorMsg = container.find('.delegateRentFormError')
        $errorMsg.hide()

        container.show()
    }

    function showDelegateRentCancelButton(container) {
        container.find('button[name=cancel]').show()
    }

    function initLocation(container) {
        var $countrySelect = container.find('.country-select')
        var $citySelect = container.find('.city-select')
        if(!container.data('initLocation')){
            container.data('initLocation', true)
            $countrySelect.bind('change', function () {
                var country = $countrySelect.val()
                if(country) {
                    $citySelect.html('').trigger('chosen:updated')
                    getCityListForSelect(country)
                } else {
                    $citySelect.find('option').eq(0).attr('selected',true)
                    $citySelect.trigger('chosen:updated')
                }

            })

            getCountryList()
        } else {
            $citySelect.trigger('change')
        }

        function getCountryList() { //通过window.team.countryMap来获取国家列表
            var defaultValue = $countrySelect.attr('data-value') || 'GB'
            $countrySelect.append(
                _.reduce(JSON.parse($('#fullCountryData').text()), function(pre, val, key) {
                    return pre + '<option value="' + val.code + '"' + (val.code === defaultValue ? ' selected' : '') +  '>' + window.team.countryMap[val.code] + '</option>'
                }, '<option value="">' + i18n('请选择国家') + '</option>')
            ).trigger('chosen:updated').trigger('change')
        }

        function getCityListForSelect(country) {
            if(!country){
                return
            }
            var $span = $citySelect.next('.chosen-container').find('.chosen-single span')
            var originContent = $span.html()
            $citySelect.html(
                '<option value="">' + i18n('城市列表加载中') + '</option>'
            ).trigger('chosen:updated')
            window.geonamesApi.getCity(country, function (val) {
                if(country === $countrySelect.val()) {
                    var defaultValue = $citySelect.attr('data-value') || 'London'
                    $span.html(originContent)
                    $citySelect.html(
                        _.reduce(val, function(pre, val, key) {
                            return pre + '<option value="' + val.id + '"' + (val.name === defaultValue ? ' selected' : '') + '>' + val.name + (country === 'US' ? ' (' + val.admin1 + ')' : '') + '</option>' //美国的城市有很多重名，要在后面加上州名缩写
                        }, '<option value="">' + i18n('请选择城市') + '</option>')
                    ).trigger('chosen:updated').trigger('change')
                }
            })
        }
    }





    module.setupDelegateSaleForm = function setupDelegateSaleForm (container, option, submitSuccessCallBack) {
        var $errorMsg = container.find('.delegateRentFormError')
        var delegateRentAgreeWrap = $('.delegateRentAgreeWrap')
        if (window.user) {
            delegateRentAgreeWrap.hide()
        } else {
            container.find('[name=delegateRentAgree]').prop('checked', true)
        }

        function getPhone() {
            return '+' + container.find('[name=country_code]').val() + container.find('[name=delegateRentPhone]').val()
        }
        function enableSubmitButton(enable) {
            var button = container.find('button[type=submit]')
            if (enable) {
                button.prop('disabled', false);
                button.removeClass('gray').addClass('red')
            }
            else {
                button.prop('disabled', true);
                button.removeClass('red').addClass('gray')
            }
        }
        function checkForm(element) {
            var validate = true
            var errorMsg = ''
            var regex = {
                'email': window.project.emailReg,
                'nonDecimal': /[^0-9.\s,]/,
                'number': /^[0-9]+$/,
                'decimalNumber': /^\d+(\.(\d)+)?$/,
                'date': /^\d{4}-\d{2}-\d{2}$/,
                'phone': /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/
            }
            $errorMsg.text('').hide()
            function highlightErrorElem(elem){
                elem.css('border', '2px solid #f00').on('focus', function(){
                    $(this).css('border', '')
                })
            }
            function removeHighlightElem(elem){
                elem.css('border', '')
            }
            element.find('[data-validator]').each(function(index, elem){
                var $this = $(this)
                var validator = $(elem).data('validator').split(',').map(function(v){
                    return v.trim()
                })
                var value = ($(this).val() === undefined || $(this).val() === null) ? '' : $(this).val()
                removeHighlightElem($(this))
                if(validator.indexOf('trim') >= 0){
                    value = value.trim()
                }
                if(validator.indexOf('required') >= 0 && value === ''){
                    validate = false
                    errorMsg = $(this).data('name') + i18n('不能为空')
                    highlightErrorElem($(this))
                    //return false
                }
                for(var key in regex){
                    if(value.length > 0 && validator.indexOf(key) >= 0 && !regex[key].test(value)){
                        validate = false
                        errorMsg = $(this).data('name') + i18n('格式不正确')
                        highlightErrorElem($(this))
                        //return false
                    }
                }
                $.each(validator, function(i, v){
                    if(/maxLength\((\d+)\)/.test(v)) {
                        var maxLength = parseInt(v.match(/maxLength\((\d+)\)/)[1])
                        if(value.length > maxLength){
                            validate = false
                            errorMsg = $this.data('name') + i18n('超出长度限制')
                            highlightErrorElem($this)
                        }
                    }
                })
            })
            if(element.find('.startDate').val() && element.find('.endDate').val() && new Date(element.find('.endDate').val()) <= new Date(element.find('.startDate').val())) {
                validate = false
                errorMsg = i18n('结束日期需要大于开始日期')
                highlightErrorElem(element.find('.endDate'))
            }
            if(!validate){
                window.dhtmlx.message({ type:'error', text: errorMsg})
                $errorMsg.text(errorMsg).show()
            }
            return validate
        }
        function initAddressLookup (container) {
            var $addressLookupBtn = container.find('.addressLookupBtn')
            if(!$addressLookupBtn.data('initAddressLookup')) {
                $addressLookupBtn.data('initAddressLookup', true)
                $addressLookupBtn.on('click', function (e) {
                    var postcode = container.find('[name=postcode]').val()
                    if(postcode && postcode.length) {
                        $.betterPost('/api/1/uk-address-lookup', {postcode: postcode})
                            .done(function (val) {
                                addressArray = val
                                container.find('.house-name-select').html(
                                    _.reduce(val, function(pre, val, key) {
                                        return pre + '<option value="' + key + '">' + val.summaryline + '</option>'
                                    }, '<option value="">' + i18n('请选择门牌号') + '</option>')
                                ).trigger('chosen:updated').trigger('chosen:open')
                            })
                            .fail(function (ret) {
                                window.dhtmlx.message({ type:'error', text: window.getErrorMessageFromErrorCode(ret)})
                                $errorMsg.empty().append(window.getErrorMessageFromErrorCode(ret)).show()
                            })
                    } else {
                        window.dhtmlx.message({ type:'error', text: i18n('请先填写postcode')})
                        $errorMsg.text(i18n('请先填写postcode')).show()
                    }
                })
            }

        }
        function initContactInfo (container) {
            var $errorMsg = container.find('.delegateRentFormError')


            function onPhoneNumberChange () {
                function checkPhoneValid () {
                    if (theParams.phone) {
                        //enableSubmitButton(false)
                        $.betterPost('/api/1/user/phone_test', theParams)
                            .done(function () {
                                $errorMsg.hide()
                                $input.css('border', '')
                                //enableSubmitButton(true)
                                checkExist()
                            })
                            .fail(function () {
                                window.dhtmlx.message({ type:'error', text: window.getErrorMessage('phone', 'number')})
                                $errorMsg.text(window.getErrorMessage('phone', 'number'))
                                $errorMsg.show()
                                $input.css('border', '2px solid red')
                            })
                    }
                    else {
                        $errorMsg.hide()
                        $input.css('border', '')
                        //enableSubmitButton(true)
                    }
                }

                function checkExist () {
                    var params = {
                        phone : getPhone()
                    }
                    if (params.phone) {
                        $.betterPost('/api/1/user/check_exist', params)
                            .done(function (val) {
                                if(val === true) {
                                    if(!window.user) {
                                        $passwordWrap.show()
                                        window.dhtmlx.message({ type:'error', text: i18n('您填写的手机号已注册，请输入密码登录后继续')})
                                        $errorMsg.text(i18n('您填写的手机号已注册，请输入密码登录后继续')).show()
                                        container.find('.login').on('click', function () {
                                            $errorMsg.hide()
                                            var password = $passwordWrap.find('input').val()
                                            if(password && password.length) {
                                                var params = {
                                                    phone: getPhone(),
                                                    password: Base64.encode(password)
                                                }
                                                $.betterPost('/api/1/user/login', params)
                                                    .done(function (val) {
                                                        window.user = val
                                                        $errorMsg.hide()
                                                        $passwordWrap.hide()
                                                        checkVerified()
                                                    })
                                                    .fail(function (ret) {
                                                        window.dhtmlx.message({ type:'error', text: window.getErrorMessageFromErrorCode(ret)})
                                                        $errorMsg.empty().append(window.getErrorMessageFromErrorCode(ret)).show()
                                                    })
                                            } else {
                                                window.dhtmlx.message({ type:'error', text: i18n('密码不能为空')})
                                                $errorMsg.text(i18n('密码不能为空'))
                                            }
                                        })
                                    } else {
                                        checkVerified()
                                    }
                                } else {
                                    //快速注册流程
                                    $codeWrap.show()
                                    $emailWrap.show().find('input').attr('data-validator', 'required,trim,email')
                                    fastRegister()

                                }
                            }).fail(function (ret) {
                                window.dhtmlx.message({ type:'error', text: window.getErrorMessageFromErrorCode(ret)})
                                $errorMsg.empty().append(window.getErrorMessageFromErrorCode(ret)).show()
                            })
                    }
                }

                function checkVerified () {
                    if (window.user.phone_verified) {
                        $errorMsg.hide()
                        enableSubmitButton(true)
                        initSubmit(container)
                    } else {
                        window.dhtmlx.message({ type:'error', text: i18n('您的手机号码尚未验证过，请先获取短信验证码后再继续')})
                        $errorMsg.text(i18n('您的手机号码尚未验证过，请先获取短信验证码后再继续')).show()
                        $codeWrap.show()
                        initSubmit(container, {
                            needVerified: true
                        })
                    }
                }
                function fastRegister () {
                    if(!$requestSMSCodeBtn.data('fastRegister')){
                        $requestSMSCodeBtn.data('fastRegister', true)
                        $requestSMSCodeBtn.on('click', function (e) {
                            $errorMsg.empty().hide()
                            var $btn = $(this)
                            if (!checkForm(container.find('form'))) {return}

                            var params = {
                                country: window.team.getCountryFromPhoneCode(container.find('[name=country_code]').val()),
                                phone: getPhone(),
                                nickname: container.find('[name=delegateRentName]').val(),
                                email: container.find('[name=delegateRentEmail]').val()
                            }

                            //倒计时60s后再将获取验证码按钮变为可用状态
                            function countDown () {
                                var text = i18n('{time}s后可用')
                                var time = 60
                                function update() {
                                    if(time === 0) {
                                        $btn.prop('disabled', false).text(i18n('重新获取验证码'))
                                    } else{
                                        $btn.prop('disabled', true).text(text.replace('{time}', time--))
                                        setTimeout(update, 1000)
                                    }
                                }
                                update()
                            }
                            // Fast register user
                            function requestSMSCode () {
                                $btn.prop('disabled', true)

                                $.betterPost('/api/1/user/sms_verification/send', {
                                    phone: getPhone()
                                }).done(function () {
                                    $errorMsg.text(i18n('验证码已成功发送到您的手机，请注意查收')).show()
                                }).fail(function (ret) {
                                    window.dhtmlx.message({ type:'error', text: window.getErrorMessageFromErrorCode(ret)})
                                    $errorMsg.html(window.getErrorMessageFromErrorCode(ret)).show()
                                }).always(function () {
                                    $('.buttonLoading').trigger('end')
                                    countDown()
                                })
                            }
                            if (!$btn.data('register')) {
                                $btn.prop('disabled', true).text(window.i18n('发送中...'))
                                $.betterPost('/api/1/user/fast-register', params)
                                    .done(function (val) {
                                        $btn.data('register', true)
                                        window.user = val
                                        container.find('[name=delegateRentPhone]').prop('readonly', true)

                                        $btn.prop('disabled', true)
                                        $('.buttonLoading').trigger('end')
                                        countDown()
                                        initSubmit(container, {
                                            needVerified: true
                                        })
                                    })
                                    .fail(function (ret) {
                                        $('.buttonLoading').trigger('end')
                                        window.dhtmlx.message({ type:'error', text: window.getErrorMessageFromErrorCode(ret)})
                                        $errorMsg.html(window.getErrorMessageFromErrorCode(ret)).show()
                                        $btn.text(window.i18n('重新获取验证码')).prop('disabled', false)
                                    })
                            } else {
                                requestSMSCode()
                                initSubmit(container, {
                                    needVerified: true
                                })
                            }
                        })

                    }
                }

                var $input = container.find('form input[name=delegateRentPhone]')
                var $codeWrap = container.find('.codeWrap')
                var $passwordWrap = container.find('.passwordWrap')
                var $emailWrap = container.find('.emailWrap')
                var $requestSMSCodeBtn = $codeWrap.find('button')

                $passwordWrap.hide()
                $codeWrap.hide()
                enableSubmitButton(false)
                var theParams = {}
                theParams.phone = getPhone()
                $errorMsg.hide()
                checkPhoneValid()
            }
            container.find('form select[name=country_code]').on('change', onPhoneNumberChange)
            container.find('form input[name=delegateRentPhone]').on('change', onPhoneNumberChange)
            if (!container.data('initContactInfo')) {
                container.data('initContactInfo', true)
                if (window.user) {
                    if (window.user.nickname) {
                        container.find('[name=delegateRentName]').val(window.user.nickname)
                    }
                    if (window.user.country && window.user.country.code) {
                        container.find('[name=country_code]').val(window.user.country_code).prop('readonly',true).trigger('chosen:updated')
                    }
                    if (window.user.phone) {
                        container.find('[name=delegateRentPhone]').val(window.user.phone).trigger('change').prop('readonly',true)
                    }
                }
            }
        }
        function getSerializeObject (form) {
            var data = {}
            form.find('[data-serialize]').each(function () {
                var serialize = $(this).attr('data-serialize').split('|')
                var key = serialize[0].trim()
                var option = serialize[1] ? serialize[1].trim() : undefined
                var val
                if ($(this).is('[type=checkbox]')) {
                    val = $(this).is(':checked')
                } else {
                    val = $(this).val()
                }
                if(val === undefined || val === '' || val === null) {
                    return
                }
                if (!option) {
                    data[key] = val
                    return
                }
                if (option === 'time') {
                    data[key] = new Date(val).getTime() / 1000
                    return
                }
                if (option === 'reverse') {
                    data[key] = !val
                    return
                }
            })
            data.phone = getPhone()
            return data
        }
        function initRequestVerifyBtn () {
            var $codeWrap = container.find('.codeWrap')
            var $requestSMSCodeBtn = $codeWrap.find('button')
            if(!$requestSMSCodeBtn.data('initRequestVerifyBtn')) {
                $requestSMSCodeBtn.data('initRequestVerifyBtn', true)
                $requestSMSCodeBtn.on('click', function (e) {
                    $errorMsg.empty().hide()
                    var $btn = $(this)
                    requestSMSCode()

                    //倒计时60s后再将获取验证码按钮变为可用状态
                    function countDown () {
                        var text = i18n('{time}s后可用')
                        var time = 60
                        function update() {
                            if(time === 0) {
                                $btn.prop('disabled', false).text(i18n('重新获取验证码'))
                            } else{
                                $btn.prop('disabled', true).text(text.replace('{time}', time--))
                                setTimeout(update, 1000)
                            }
                        }
                        update()
                    }
                    // Fast register user
                    function requestSMSCode () {
                        $btn.prop('disabled', true).text(i18n('发送中...'))

                        $.betterPost('/api/1/user/sms_verification/send', {
                            phone: getPhone()
                        }).done(function () {
                            $errorMsg.text(i18n('验证码已成功发送到您的手机，请注意查收')).show()
                        }).fail(function (ret) {
                            window.dhtmlx.message({ type:'error', text: window.getErrorMessageFromErrorCode(ret)})
                            $errorMsg.html(window.getErrorMessageFromErrorCode(ret)).show()
                        }).always(function () {
                            $('.buttonLoading').trigger('end')
                            countDown()
                        })
                    }
                })

            }
        }
        function initSubmit (container, option) {
            var $codeWrap = container.find('.codeWrap')
            enableSubmitButton(true)
            function submitForm (form) {
                var successArea = container.find('.requirement .successWrap')
                var params = getSerializeObject(form)
                var index = container.find('.house-name-select').val()
                if(addressArray && addressArray.length && index.length) {
                    params.premise = addressArray[index].premise
                    params.street = addressArray[index].street
                    params.posttown = addressArray[index].posttown
                }
                var delegate_sale_ticket_id = (location.href.match(/delegate\-sale\/([0-9a-fA-F]{24})\/edit/) || [])[1]
                var api = delegate_sale_ticket_id ?  '/api/1/sell_request_ticket/' + delegate_sale_ticket_id + '/edit' : '/api/1/sell_request_ticket/add'
                $.betterPost(api, params)
                    .done(function (val) {
                        successArea.show().siblings().hide()
                        submitSuccessCallBack()
                    })
                    .fail(function (ret) {
                        $errorMsg.empty()
                        window.dhtmlx.message({ type:'error', text: window.getErrorMessageFromErrorCode(ret)})
                        $errorMsg.append(window.getErrorMessageFromErrorCode(ret))
                        $errorMsg.show()
                    })
            }
            if(!container.data('initSubmit')) {
                if(option && option.needVerified) {
                    initRequestVerifyBtn()
                }
                container.data('initSubmit', true)
                container.find('button[type=submit]').on('click', function () {
                    container.find('form.delegate_rent_form').trigger('submit')
                })
                container.find('form.delegate_rent_form').submit(function (e) {
                    var $form = $(this)
                    window.team.setUserType('landlord')
                    e.preventDefault()
                    $errorMsg.hide()
                    container.find('form input, form textarea').each(function (index) {
                        $(this).css('border', '')
                    })

                    if (!checkForm($(this))) {return}
                    if(option && option.needVerified) {
                        var code = $codeWrap.find('input').val()
                        if(code && code.length) {
                            $.betterPost('/api/1/user/' + window.user.id + '/sms_verification/verify', {code: code})
                                .done(function (val) {
                                    window.user.phone_verified = true
                                    submitForm($form)
                                })
                                .fail(function (ret) {
                                    window.dhtmlx.message({ type:'error', text: window.getErrorMessageFromErrorCode(ret)})
                                    $errorMsg.empty().append(window.getErrorMessageFromErrorCode(ret)).show()
                                })
                        } else {
                            window.dhtmlx.message({ type:'error', text: i18n('请输入手机验证码')})
                            $errorMsg.text(i18n('请输入手机验证码')).show()
                        }
                    } else if(!option) {
                        submitForm($form)
                    }
                })
            }
        }

        container.find('.select-chosen').add(container.find('[name=country_code]')).each(function (index, elem) {
            if(!$(elem).data('chosen')) {
                if(!window.team.isPhone()) {
                    $(elem).data('chosen', true).chosen({
                        disable_search_threshold: 8,
                    }) //调用chosen插件
                } else {
                    $(elem).data('chosen', true).chosenPhone({
                        disable_search_threshold: 8,
                        callback: function () {
                            this.chosenSingle.prepend('<div class="hint">' + $(elem).attr('data-hint') + '</div>')
                        }
                    }) //调用chosen插件
                }
            }
        })
        initLocation(container)
        initContactInfo(container)
        initAddressLookup(container)
        //Only bind click once
        container.find('button[name=cancel]').off('click').on('click', function () {
            container.hide()

            ga('send', 'event', 'rentRequirementPopup', 'click', 'cancel-requirement-popup')
        });
        container.find('.requirement_popup_shadow').on('click', function () {
            container.hide()
        })
    }
})(window.currantModule = window.currantModule || {})
