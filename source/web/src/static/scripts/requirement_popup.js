(function () {

    window.resetRequirementForm = function(container){
        var successArea = container.find('.requirement .successMessage')
        successArea.hide()
        var errorArea = container.find('.errorMessage')
        errorArea.hide()
        container.find('.requirement_form').show()

        if(container.find('form[name=requirement]')[0]){
            container.find('form[name=requirement]')[0].reset()
        }

        if (window.user) {
            if (window.user.nickname) {
                container.find('input[name=nickname]').val(window.user.nickname)
            }

            if (window.user.country_code) {
                container.find('select[name=country_code]').val(window.user.country_code)
            }

            if (window.user.email) {
                container.find('input[name=email]').val(window.user.email)
            }

            if (window.user.phone) {
                container.find('input[name=phone]').val(window.user.phone)
            }
        }
        container.show()
    }

    window.showRequirementCancelButton = function(container) {
        container.find('button[name=cancel]').show()
    }

    window.setupRequirementForm = function(container, submitSuccessCallBack) {

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
            var params = container.find('form[name=requirement]').serializeObject()
            var theParams = {}
            theParams.phone = '+' + params.country_code + params.phone
            var errorArea = container.find('form[name=requirement]').find('.errorMessage')
            errorArea.hide()
            var $input = container.find('form[name=requirement] input[name=phone]')
            if (theParams.phone) {
                enableSubmitButton(false)
                $.betterPost('/api/1/user/phone_test', theParams)
                    .done(function () {
                        errorArea.hide()
                        $input.css('border', '2px solid #ccc')
                        enableSubmitButton(true)
                    })
                    .fail(function () {
                        errorArea.text(window.getErrorMessage('phone', 'number'))
                        errorArea.show()
                        $input.css('border', '2px solid red')
                    })
            }
            else {
                errorArea.hide()
                $input.css('border', '2px solid #ccc')
                enableSubmitButton(true)
            }
        }

        var requirementAgreeWrap = $('.requirementAgreeWrap')
        if (window.user) {
            requirementAgreeWrap.hide()
        } else {
            container.find('[name=requirementAgree]').prop('checked', true)
        }
        //remove bind event first Bug #5515
        container.find('form[name=requirement]').off('submit').submit(function (e) {
            window.team.setUserType('investor')
            e.preventDefault()

            var errorArea = $(this).find('.errorMessage')
            errorArea.hide()
            var successArea = container.find('.successMessage')
            container.find('form[name=requirement] input, form[name=requirement] textarea').each(
                function (index) {
                    $(this).css('border', '2px solid #ccc')
                }
            )

            var valid = $.validate(this, {
                onError: function (dom, validator, index) {
                    errorArea.text(window.getErrorMessage(dom.name, validator))
                    errorArea.show()
                    $(dom).css('border', '2px solid red')
                },
                exclude: ['phone']
            })
            if (!valid) {return}

            var params = $(this).serializeObject()
            params.phone = '+' + params.country_code + params.phone
            params.country = params.countrySelect
            params.locales = window.lang
            var phoneReg = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/
            if(!phoneReg.test(params.phone)) {
                errorArea.text(window.i18n('电话格式不正确'))
                errorArea.show()
                return
            }
            //for requirement phone page
            var propertyIdFromURL = window.team.getQuery('property', location.href)
            if (propertyIdFromURL) {
                params.property_id = propertyIdFromURL
            }

            if (!params.property_id) {
                //still don't have, remove it
                delete params.property_id
            }
            if($('#requirementAgree').is(':checked')) {
                params.noregister = false
            } else {
                params.noregister = true
            }
            var button = $('form[name=requirement] button[type=submit]')
            button.css('cursor', 'wait')
            var api = '/api/1/intention_ticket/add'
            $.betterPost(api, params)
                .done(function (val) {
                    successArea.show()
                    container.find('.requirement_form').hide()
                    submitSuccessCallBack()

                    ga('send', 'event', 'requirementPopup', 'result', 'submit-success');
                })
                .fail(function (ret) {
                    errorArea.empty()
                    errorArea.append(window.getErrorMessageFromErrorCode(ret, api))
                    errorArea.show()

                    ga('send', 'event', 'requirementPopup', 'click', 'submit-failed',window.getErrorMessageFromErrorCode(ret, api));
                })
                .always(function () {
                    button.css('cursor', 'default')
                })
        })

        container.find('form[name=requirement] select[name=country]').on('change', onPhoneNumberChange)
        container.find('form[name=requirement] input[name=phone]').on('change', onPhoneNumberChange)

        //Only bind click once
        container.find('button[name=cancel]').off('click').on('click', function () {
            container.hide()

            ga('send', 'event', 'floatBar', 'click', 'cancel-requirement-popup')
        });
    }

    window.setRequirementFormContent = function (popup, budgetId, intentionId, propertyId) {
        if (budgetId) {
            popup.find('select.budget option[value=' + budgetId + ']').attr('selected', 'selected')
        }

        if (budgetId && intentionId) {

            var selectedBudget =  popup.find('select.budget option[value=' + budgetId + ']').text()
            var selectedIntention
            var rawIntentionList = $('#dataIntentionList').text()
            if (rawIntentionList) {
                var intentionArray = JSON.parse(rawIntentionList)
                _.each(intentionArray, function (item) {
                    if (item.id === intentionId) {
                        selectedIntention = item.value
                    }
                })
            }

            var description =  window.i18n('我想投资价值为')
            if (selectedBudget) {
                description = description  + ' ' +
                    selectedBudget + ' '
            }

            if (selectedIntention) {
                description = description + window.i18n('的房产，投资意向为') + ' ' +
                    selectedIntention
            }
            description = description + window.i18n('。')

            popup.find('[name=description]').text(description)
        }

        if (propertyId) {
            popup.find('input[name=property_id]').val(propertyId)
        }
    }

    window.openRequirementForm = function (event, budgetId, intentionId, propertyId) {
        var popup = $('#requirement_popup')
        window.resetRequirementForm(popup)
        window.setRequirementFormContent(popup, budgetId, intentionId, propertyId)
        popup.find('.requirement_title').show()
        window.showRequirementCancelButton(popup)

        window.setupRequirementForm(popup, function () {
            popup.find('.requirement_title').hide()

            setTimeout(function () {
                popup.hide()
            }, 2000)
        })

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

    $('.floatBar #requirement').click(function(){
        window.openRequirementForm()

        ga('send', 'event', 'floatBar', 'click', 'open-requirement-popup');
    })
})()
