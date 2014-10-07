(function () {

    window.resetRequirementForm = function(container){
        var successArea = container.find('.requirement .successMessage')
        successArea.hide()
        var errorArea = container.find('.errorMessage')
        errorArea.hide()
        container.find('.requirement_form').show()

        container.find('form[name=requirement]')[0].reset()

        if (window.user) {
            if (window.user.nickname) {
                container.find('input[name=nickname]').val(window.user.nickname)
            }

            if (window.user.country) {
                container.find('select[name=country]').val(window.user.country.id)
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
            var theParams = {'country': '', 'phone': ''}
            theParams.country = params.country
            theParams.phone = params.phone
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


        container.find('form[name=requirement]').submit(function (e) {
            e.preventDefault()

            var errorArea = $(this).find('.errorMessage')
            errorArea.hide()
            var successArea = container.find('.successMessage')
            container.find('form[name=requirement] input, form[name=requirement] textarea').each(
                function (index) {
                    $(this).css('border', '2px solid #ccc')
                }
            )

            var valid = $.validate(this, {onError: function (dom, validator, index) {
                errorArea.text(window.getErrorMessage(dom.name, validator))
                errorArea.show()
                $(dom).css('border', '2px solid red')
            }})
            if (!valid) {return}

            var params = $(this).serializeObject()
            params.locales = window.lang

            var button = $('form[name=requirement] button[type=submit]')
            button.css('cursor', 'wait')
            $.betterPost('/api/1/intention_ticket/add', params)
                .done(function (val) {
                    successArea.show()
                    container.find('.requirement_form').hide()

                    submitSuccessCallBack()

                })
                .fail(function () {
                    errorArea.text(window.i18n('提交需求失败'))
                    errorArea.show()
                })
                .always(function () {
                    button.css('cursor', 'default')
                })
        })

        container.find('form[name=requirement] select[name=country]').on('change', onPhoneNumberChange)
        container.find('form[name=requirement] input[name=phone]').on('change', onPhoneNumberChange)

        container.find('button[name=cancel]').click(function () {
            container.hide()
        });
    }


    $('.floatBar #requirement').click(function () {
        var popup = $('#requirement_popup')
        window.resetRequirementForm(popup)
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
    })
})()
