(function () {

    window.resetRequirementRentForm = function(container, option){
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
        var $countrySelect = container.find('.country-select')
        var $citySelect = container.find('.city-select')
        var $neighborhoodSelect = container.find('.neighborhood-select')
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
            $citySelect.bind('change', function () {
                $neighborhoodSelect.html('').trigger('chosen:updated')
                if(container.find('.city-select :selected').text().toLowerCase() === 'london'){
                    $neighborhoodSelect.next('.chosen-container').parents('.row').show()
                    getNeighborhoodListForSelect($citySelect.val())
                } else {
                    //clearData('neighborhood')
                    $neighborhoodSelect.find('option').eq(0).attr('selected',true)
                    $neighborhoodSelect.trigger('chosen:updated')
                    $neighborhoodSelect.next('.chosen-container').parents('.row').hide()
                }
            })
            getCountryList()
        } else {
            $citySelect.trigger('change')
        }

        function getCountryList() { //通过window.team.countryMap来获取国家列表

            $countrySelect.append(
                _.reduce(JSON.parse($('#fullCountryData').text()), function(pre, val, key) {
                    return pre + '<option value="' + val.code + '"' + (val.code === 'GB' ? ' selected' : '') +  '>' + window.team.countryMap[val.code] + '</option>'
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
                    $span.html(originContent)
                    $citySelect.html(
                        _.reduce(val, function(pre, val, key) {
                            return pre + '<option value="' + val.id + '"' + (val.name === 'London' ? ' selected' : '') + '>' + val.name + (country === 'US' ? ' (' + val.admin1 + ')' : '') + '</option>' //美国的城市有很多重名，要在后面加上州名缩写
                        }, '<option value="">' + i18n('请选择城市') + '</option>')
                    ).trigger('chosen:updated').trigger('change')
                }
            })
        }
        function getNeighborhoodListForSelect(city) {
            var $neighborhoodSelectChosen = $neighborhoodSelect.next('.chosen-container')
            var $span = $neighborhoodSelectChosen.find('.chosen-single span')
            var originContent = $span.html()
            $span.html(window.i18n('街区列表加载中...(选填)'))
            window.geonamesApi.getNeighborhood({city: city}, function (val) {
                if(container.find('.city-select :selected').text().toLowerCase() === 'london') {
                    $span.html(originContent)
                    $neighborhoodSelect.html(
                        _.reduce(val, function(pre, val, key) {
                            return pre + '<option value="' + val.id + '">' + val.name + (val.parent && val.parent.name ? ', ' + val.parent.name : '') + '</option>'
                        }, '<option value="">' + i18n('请选择街区(选填)') + '</option>')
                    ).trigger('chosen:updated')
                    $neighborhoodSelect.trigger('chosen:open')
                }
            })
        }
    }

    function initDateInput (container) {
        if (!container.data('initDateInput')) {
            var $dateInput = container.find('.dateInput')
            container.data('initDateInput', true)
            $dateInput.each(function (index, elem) {
                if($(elem).hasClass('startDate')) {
                    $(elem).val(window.moment().format('YYYY-MM-DD'))
                }
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
            return i18n('我想在') + getText(container.find('.city-select')) +
                (container.find('.neighborhood-select').val() ? (i18n('的') + getText(container.find('.neighborhood-select'))) : '') +
                i18n('求租') + getText(container.find('.rentBudget')) + window.getCurrencyPresentation(window.currency) + i18n('/周的') +
                getText(container.find('.rentType')) + i18n('出租房')
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

    function initShowAndHide(container, option) {
        if(option && option.requestContact === 'true') {
            container.find('[data-show=requestContact]').show()
            container.find('[data-hide=requestContact]').hide()
        } else {
            container.find('[data-show=requestContact]').hide()
            container.find('[data-hide=requestContact]').show()
        }
    }
    function getHostContact(container, option) {
        if(option && option.requestContact === 'true' && option.ticketId) {
            $.betterPost('/api/1/rent_ticket/' + option.ticketId + '/contact_info')
                .done(function (val) {
                    var host = val
                    host.private_contact_methods = host.private_contact_methods || []
                    if(host.private_contact_methods.indexOf('phone') < 0 && host.phone) {
                        $('.hostPhone').addClass('show').each(function(){
                            $(this).find('span').eq(0).text('+' + host.country_code)
                            $(this).find('span').eq(1).text(host.phone)
                        })
                        $('.hostPhone a').attr('href', 'tel:+' + host.country_code + host.phone)
                    } else {
                        $('.hostPhone').removeClass('show')
                    }
                    if(host.private_contact_methods.indexOf('email') < 0 && host.email) {
                        $('.hostEmail').addClass('show').find('span').text(host.email)
                        $('.hostEmail a').attr('href', 'mailto:' + host.email)
                    } else {
                        $('.hostEmail').removeClass('show')
                    }
                    if(host.private_contact_methods.indexOf('wechat') < 0 && host.wechat) {
                        $('.hostWechat').addClass('show').find('span').text(host.wechat)
                    } else {
                        $('.hostWechat').removeClass('show')
                    }
                    $('.hostName').text(host.nickname)
                    $('.hostType').text(host.landlord_type)
                    $('.hostContactWrap .hint').hide().next('.host').show()
                })
                .fail(function (ret) {
                    $('.hostContactWrap .hint').text(window.i18n('获取联系方式失败：' + window.getErrorMessageFromErrorCode(ret)))
                })
        }
    }

    window.setupRequirementRentForm = function(container, option, submitSuccessCallBack) {
        var $errorMsg = container.find('.requirementRentFormError')
        var requirementRentAgreeWrap = $('.requirementRentAgreeWrap')
        if (window.user) {
            requirementRentAgreeWrap.hide()
        } else {
            container.find('[name=requirementRentAgree]').prop('checked', true)
        }

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

                    var api = '/api/1/rent_intention_ticket/add'
                    $.betterPost(api, params)
                        .done(function (val) {
                            successArea.show().siblings().hide()
                            successArea.find('.qrcode').prop('src', '/qrcode/generate?content=' + encodeURIComponent(location.protocol + '//' + location.host + '/app-download'))
                            getHostContact(container, option)
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

        initShowAndHide(container, option)
        $('.neighborhood-select').parents('.row').show()
        container.find('.select-chosen').add(container.find('[name=country_code]')).each(function (index, elem) {
            if(!$(elem).data('chosen')) {
                if(!window.team.isPhone()) {
                    $(elem).data('chosen', true).chosen({ disable_search_threshold: 8 }) //调用chosen插件
                } else {
                    $(elem).data('chosen', true).chosenPhone({
                        disable_search_threshold: 8,
                        callback: function () {
                            this.chosenSingle.prepend('<p class="hint">' + $(elem).attr('data-hint') + '</p>')
                        }
                    }) //调用chosen插件
                }
            }
        })
        $('.neighborhood-select').parents('.row').hide()
        initLocation(container)
        initStep(container)
        initDateInput(container)
        initRequirementRentTitle(container)
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



    window.openRequirementRentForm = function (option) {
        option = option || {}
        if(window.team.isPhone()) {
            location.href = '/requirement-rent?' + $.param(option)
            return
        }
        var popup = $('#requirement_rent_popup')
        window.resetRequirementRentForm(popup, option)
        popup.find('.requirement_title').show()
        window.showRequirementRentCancelButton(popup)

        window.setupRequirementRentForm(popup, option, function () {

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
    if (window.team.getQuery('rent_intention_ticket',location.href) === 'true') {
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
