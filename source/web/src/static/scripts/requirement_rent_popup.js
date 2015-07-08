(function () {

    window.resetRequirementRentForm = function(container){
        var successArea = container.find('.requirement .successWrap')
        successArea.hide().siblings().show()
        var $errorMsg = container.find('.requirementRentFormError')
        $errorMsg.hide()

        /*if(container.find('form[name=requirement]')[0]){
            container.find('form[name=requirement]')[0].reset()
        }*/
        container.show()
    }

    window.showRequirementRentCancelButton = function(container) {
        container.find('button[name=cancel]').show()
    }
    function initLocation(container) {
        if(!container.data('initLocation')){
            var geonamesApi = new GeonamesApi()
            container.data('initLocation', true)
            container.find('.country-select').bind('change', function () {
                container.find('.city-select').html('').trigger('chosen:updated')
                getCityListForSelect(container.find('.country-select').val())
            })
            getCountryList()
        }

        function getCountryList() { //通过window.team.countryMap来获取国家列表

            container.find('.country-select').append(
                _.reduce(JSON.parse($('#countryData').text()), function(pre, val, key) {
                    return pre + '<option value="' + val.code + '"' + (val.code === 'GB' ? ' selected' : '') +  '>' + window.team.countryMap[val.code] + '</option>'
                }, '<option value="">' + i18n('请选择国家') + '</option>')
            ).trigger('chosen:updated').trigger('change')
        }
        function GeonamesApi () {
            var url = '/api/1/geonames/search'
            this.getAdmin = function (config, callback, reject) {
                $.betterPost(url, config)
                    .done(function (val) {
                        callback.call(null, val)
                    })
                    .fail(function (ret) {
                        if(reject && typeof reject === 'function') {
                            reject(ret)
                        }
                    })
            }
            this.getCity = function (country, callback, reject) {
                this.getAdmin({
                    country: country,
                    feature_code: 'city'
                }, callback, reject)
            }
            this.getAdmin1 = function (country, callback, reject) {
                this.getAdmin({
                    country: country,
                    feature_code: 'ADM1'
                }, callback, reject)
            }
            this.getAdmin2 = function (country, admin1, callback, reject) {
                this.getAdmin({
                    country: country,
                    admin1: admin1,
                    feature_code: 'ADM2'
                }, callback, reject)
            }
            this.getCityByLocation = function (country, latitude, longitude, callback, reject) {
                this.getAdmin({
                    search_range: 50000,
                    country: country,
                    latitude: latitude,
                    longitude: longitude,
                    feature_code: 'city'
                }, callback, reject)
            }
        }
        function getCityListForSelect(country) {
            if(!country){
                return
            }
            var $span = container.find('.city-select').next('.chosen-container').find('.chosen-single span')
            var originContent = $span.html()
            container.find('.city-select').html(
                '<option value="">' + i18n('城市列表加载中') + '</option>'
            ).trigger('chosen:updated')
            geonamesApi.getCity(country, function (val) {
                if(country === container.find('.country-select').val()) {
                    $span.html(originContent)
                    container.find('.city-select').html(
                        _.reduce(val, function(pre, val, key) {
                            return pre + '<option value="' + val.id + '">' + val.name + (country === 'US' ? ' (' + val.admin1 + ')' : '') + '</option>' //美国的城市有很多重名，要在后面加上州名缩写
                        }, '<option value="">' + i18n('请选择城市') + '</option>')
                    ).trigger('chosen:updated')
                }
            })
        }
    }

    function initDateInput (container) {
        if (!container.data('initDateInput')) {
            var $dateInput = container.find('.dateInput')
            container.data('initDateInput', true)
            $dateInput.each(function (index, elem) {
                $(elem).dateRangePicker({
                    //startDate: new Date(new Date().getTime() + 3600 * 24 * 30 * 1000),
                    autoClose: true,
                    singleDate: true,
                    showShortcuts: false,
                    lookBehind: false,
                    container: container,
                    getValue: function() {
                        //return this.value || $.format.date(new Date(), 'yyyy-MM-dd');
                    }
                })
                    .bind('datepicker-change', function (event, obj) {
                        $(elem).val($.format.date(new Date(obj.date1), 'yyyy-MM-dd')).trigger('change')

                    })
            })
        }
    }

    function initRequirementRentTitle (container) {
        function getText (elem) {
            var text
            if (elem.is('select')) {
                elem.find('option').each(function (index, option) {
                    if (elem.val() === $(option).attr('value')) {
                        text = $(option).text().trim()
                    }
                })
            } else {
                return elem.val()
            }
            return text
        }
        function getRequirementRentTitle(container) {
            return i18n('我想在') + getText(container.find('.country-select')) + i18n('的') +
                getText(container.find('.city-select')) +
                i18n('求租') + getText(container.find('.rentType')) + i18n('出租的房子')
        }
        if (!container.data('initRequirementRentTitle')) {
            container.data('initRequirementRentTitle', true)
            container.find('[data-change-title]').on('change', function () {
                container.find('.requirementRentTitle').val(getRequirementRentTitle(container))
            })
        }
    }

    function initContactInfo (container) {
        var $errorMsg = container.find('.requirementRentFormError')
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
            var theParams = {'country': '', 'phone': ''}
            theParams.country = params.country
            theParams.phone = params.requirementRentPhone
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
                if (window.user.country.code) {
                    container.find('[name=country]').val(window.user.country.code).trigger('change').trigger('chosen:updated')
                }
                if (window.user.phone) {
                    container.find('[name=requirementRentPhone]').val(window.user.phone).trigger('change')
                }
                if (window.user.email) {
                    container.find('[name=requirementRentEmail]').val(window.user.email)
                }
            }
        }
    }
    function getPhoneCode (countryCode) {
        return {'GB':'+44','CN':'+86','HK':'+852','US':'+1'}[countryCode]
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
            if(val === undefined || val === '') {
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
        data.phone = getPhoneCode(form.find('[name=country]').val()) + form.find('[name=requirementRentPhone]').val()
        return data
    }


    window.setupRequirementRentForm = function(container, submitSuccessCallBack) {
        var $errorMsg = container.find('.requirementRentFormError')
        var requirementRentAgreeWrap = $('.requirementRentAgreeWrap')
        if (window.user) {
            requirementRentAgreeWrap.hide()
        }
        container.find('.select-chosen').add(container.find('[name=country]')).each(function (index, elem) {
            if(!$(elem).data('chosen')) {
                $(elem).data('chosen', true).chosen({ disable_search_threshold: 8 }) //调用chosen插件
            }
        })
        var actionMap = {
            gotoPrev: function gotoPrev ($formWrap) {
                var currentStep = parseInt($formWrap.attr('data-step'))
                if(currentStep > 1) {
                    gotoStep($formWrap, currentStep - 1)
                }
            },
            gotoNext: function gotoNext ($formWrap) {
                var currentStep = parseInt($formWrap.attr('data-step'))
                if(checkInputOfCurrentStep($formWrap, currentStep) && currentStep < 3) {
                    gotoStep($formWrap, currentStep + 1)
                }
            }

        }
        function initStep (container) {
            var $formWrap = container.find('.formWrap')
            gotoStep($formWrap, 1)
            $formWrap.find('[data-action]').off('click').on('click', function () {
                actionMap[$(this).attr('data-action')].call(null, $formWrap)
            })
        }
        function gotoStep ($formWrap, num) {
            $formWrap.removeClass('inStep1 inStep2 inStep3').addClass('inStep' + num).attr('data-step', num)
            $formWrap.find('[data-show-step]').each(function (index, elem) {
                $(elem)[$(elem).attr('data-show-step') === num.toString() ? 'show' : 'hide']()
            })
        }
        function checkInputOfCurrentStep($formWrap, currentStep) {
            return checkForm($formWrap.find('.requirement_rent_form .step' + currentStep))
        }

        function checkForm(element) {
            var validate = true
            var errorMsg = ''
            var regex = {
                'email': /.+@.+\..+/,
                'nonDecimal': /[^0-9.\s,]/,
                'number': /^[0-9]+$/,
                'decimalNumber': /^\d+(\.(\d)+)?$/,
                'date': /^\d{4}-\d{2}-\d{2}$/
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
            if(!validate){
                $errorMsg.text(errorMsg).show()
            }
            return validate
        }


        function initSubmit (container) {
            if(!container.data('initSubmit')) {
                container.data('initSubmit', true)
                container.find('button[type=submit]').on('click', function () {
                    container.find('form.requirement_rent_form').trigger('submit')
                })
                container.find('form.requirement_rent_form').submit(function (e) {
                    e.preventDefault()
                    $errorMsg.hide()
                    var successArea = container.find('.successWrap')
                    container.find('form input, form textarea').each(function (index) {
                        $(this).css('border', '')
                    })

                    if (!checkForm($(this))) {return}

                    var params = getSerializeObject($(this))
                    params.locales = window.lang

                    var api = '/api/1/rent_intention_ticket/add'
                    $.betterPost(api, params)
                        .done(function (val) {
                            successArea.show().siblings().hide()
                            successArea.find('.qrcode').prop('src', '/qrcode/generate?content=' + encodeURIComponent(location.protocol + '//' + location.host + '/app-download'))
                            submitSuccessCallBack()
                            //ga('send', 'event', 'requirementPopup', 'result', 'submit-success');
                        })
                        .fail(function (ret) {
                            $errorMsg.empty()
                            $errorMsg.append(window.getErrorMessageFromErrorCode(ret, api))
                            $errorMsg.show()

                            //ga('send', 'event', 'requirementPopup', 'click', 'submit-failed',window.getErrorMessageFromErrorCode(ret, api));
                        })

                })
            }
        }
        initStep(container)
        initLocation(container)
        initDateInput(container)
        initRequirementRentTitle(container)
        initContactInfo(container)
        initSubmit(container)



        //Only bind click once
        container.find('button[name=cancel]').off('click').on('click', function () {
            container.hide()

            //ga('send', 'event', 'floatBar', 'click', 'cancel-requirement-popup')
        });
        container.find('.requirement_popup_shadow').on('click', function () {
            container.hide()
        })
    }



    window.openRequirementRentForm = function (event, budgetId, intentionId, propertyId) {
        if(window.team.isPhone()) {
            location.href = '/requirement-rent'
            return
        }
        var popup = $('#requirement_rent_popup')
        window.resetRequirementRentForm(popup)
        popup.find('.requirement_title').show()
        window.showRequirementRentCancelButton(popup)

        window.setupRequirementRentForm(popup, function () {

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

    //入口
    //window.openRequirementRentForm()
    if (window.team.getQuery('rent_ticket',location.href) === 'true') {
        window.openRequirementRentForm()
    }

    $('[data-action=requirementRent]')
        .css({
            'cursor': 'pointer'
        })
        .click(function () {
        window.openRequirementRentForm()
    })
})()
