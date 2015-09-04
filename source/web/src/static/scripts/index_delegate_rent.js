(function (module) {
    module.openDelegateRent = function (option) {
        option = option || {}
        if(window.team.isPhone()) {
            location.href = '/delegate-rent' + ($.param(option) ? '?' + $.param(option) : '')
            return
        }
        var popup = $('#delegate_rent_popup')
        module.resetDelegateRentForm(popup, option)
        popup.find('.requirement_title').show()
        showDelegateRentCancelButton(popup)

        module.setupDelegateRentForm(popup, option, function () {

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

    module.resetDelegateRentForm = function resetDelegateRentForm (container, option) {
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


    function initContactInfo (container) {
        var $errorMsg = container.find('.delegateRentFormError')
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

        var onPhoneNumberChange = function () {
            var params = container.find('form').serializeObject()
            var theParams = {}
            theParams.phone = '+' + params.country_code + params.requirementRentPhone
            $errorMsg.hide()
            var $input = container.find('form input[name=requirementRentPhone]')
            if (theParams.phone) {
                enableSubmitButton(false)
                $.betterPost('/api/1/user/phone_test', theParams)
                    .done(function () {
                        $errorMsg.hide()
                        $input.css('border', '')
                        enableSubmitButton(true)
                    })
                    .fail(function () {
                        $errorMsg.text(window.getErrorMessage('phone', 'number'))
                        $errorMsg.show()
                        $input.css('border', '2px solid red')
                    })
            }
            else {
                $errorMsg.hide()
                $input.css('border', '')
                enableSubmitButton(true)
            }
        }
        container.find('form select[name=country]').on('change', onPhoneNumberChange)
        container.find('form input[name=requirementRentPhone]').on('change', onPhoneNumberChange)
        if (!container.data('initContactInfo')) {
            container.data('initContactInfo', true)
            if (window.user) {
                if (window.user.nickname) {
                    container.find('[name=requirementRentName]').val(window.user.nickname)
                }
                if (window.user.country && window.user.country.code) {
                    container.find('[name=country]').val(window.user.country.code).trigger('chosen:updated')
                }
                if (window.user.phone) {
                    container.find('[name=requirementRentPhone]').val(window.user.phone)
                }
                if (window.user.email) {
                    container.find('[name=requirementRentEmail]').val(window.user.email)
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
        data.phone = '+' + form.find('[name=country_code]').val() + form.find('[name=requirementRentPhone]').val()
        return data
    }


    module.setupDelegateRentForm = function setupDelegateRentForm (container, option, submitSuccessCallBack) {
        var $errorMsg = container.find('.delegateRentFormError')
        var delegateRentAgreeWrap = $('.delegateRentAgreeWrap')
        if (window.user) {
            delegateRentAgreeWrap.hide()
        } else {
            container.find('[name=requirementRentAgree]').prop('checked', true)
        }


        function checkForm(element) {
            var validate = true
            var errorMsg = ''
            var regex = {
                'email': /.+@.+\..+/,
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
                $errorMsg.text(errorMsg).show()
            }
            return validate
        }


        function initSubmit (container, option) {
            if(!container.data('initSubmit')) {
                container.data('initSubmit', true)
                container.find('button[type=submit]').on('click', function () {
                    container.find('form.requirement_rent_form').trigger('submit')
                })
                container.find('form.requirement_rent_form').submit(function (e) {
                    window.team.setUserType('tenant')
                    e.preventDefault()
                    $errorMsg.hide()
                    var successArea = container.find('.successWrap')
                    container.find('form input, form textarea').each(function (index) {
                        $(this).css('border', '')
                    })

                    if (!checkForm($(this))) {return}

                    var params = getSerializeObject($(this))
                    params.locales = window.lang
                    var rent_intention_ticket_id = (location.href.match(/rent\-intention\/([0-9a-fA-F]{24})\/edit/) || [])[1]
                    var api = rent_intention_ticket_id ?  '/api/1/rent_intention_ticket/' + rent_intention_ticket_id + '/edit' : '/api/1/rent_intention_ticket/add'
                    $.betterPost(api, params)
                        .done(function (val) {
                            successArea.show().siblings().hide()
                            successArea.find('.qrcode').prop('src', '/qrcode/generate?content=' + encodeURIComponent(location.protocol + '//' + location.host + '/app-download'))
                            submitSuccessCallBack()
                            ga('send', 'event', 'rentRequirementPopup', 'result', 'submit-success');
                        })
                        .fail(function (ret) {
                            $errorMsg.empty()
                            $errorMsg.append(window.getErrorMessageFromErrorCode(ret))
                            $errorMsg.show()

                            ga('send', 'event', 'rentRequirementPopup', 'click', 'submit-failed',window.getErrorMessageFromErrorCode(ret));
                        })

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
        initSubmit(container, option)



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
