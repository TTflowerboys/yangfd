(function () {
    $('form[name=subscription]').submit(function (e) {
        e.preventDefault()
        var errorArea = $(this).find('.errorMessage')
        errorArea.hide()
        var successArea = $('.opening .successMessage')

        var valid = $.validate(this, {
            onError: function (dom, validator, index) {
                errorArea.text(window.getErrorMessage(dom.name, validator))
                errorArea.show()
            }
        })
        if (!valid) {return}
        var params = $(this).serializeObject()

        params.locales = window.lang
        $.betterPost('/api/1/subscription/add', params)
            .done(function () {
                successArea.show()
                $('form[name=subscription]').hide()
            })
            .fail(function () {
                errorArea.text(window.i18n('订阅失败'))
                errorArea.show()
            })
    })

    function enableSubmitButton(enable) {
        var button = $('form[name=requirement] button[type=submit]')
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
        var params = $('form[name=requirement]').serializeObject()
        var theParams = {'country': '', 'phone': ''}
        theParams.country = params.country
        theParams.phone = params.phone
        var errorArea = $('form[name=requirement]').find('.errorMessage')
        errorArea.hide()
        var $input = $('form[name=requirement] input[name=phone]')
        if (theParams.phone) {
            enableSubmitButton(false)
            $.betterPost('/api/1/user/phone_test',
                theParams,
                function (data, status) {
                    if (data.ret !== 0) {
                        errorArea.text(window.getErrorMessage('phone', 'number'))
                        errorArea.show()
                        $input.css('border', '2px solid red')
                    }
                    else {
                        errorArea.hide()
                        $input.css('border', '2px solid #ccc')
                        enableSubmitButton(true)
                    }
                });
        }
        else {
            errorArea.hide()
            var dom = $('form[name=requirement] input[name=phone]')[0]
            $(dom).css('border', '2px solid #ccc')
            enableSubmitButton(false)
        }
    }


    $('form[name=requirement] select[name=country]').on('change', onPhoneNumberChange)
    $('form[name=requirement] input[name=phone]').on('change', onPhoneNumberChange)

    $('form[name=requirement]').submit(function (e) {
        e.preventDefault()
        var errorArea = $(this).find('.errorMessage')
        errorArea.hide()
        var successArea = $('.requirement .successMessage')
        $('form[name=requirement] input, form[name=requirement] textarea').each(
            function (index) {
                $(this).css('border', '2px solid #ccc')
            }
        )

        var valid = $.validate(this, {
            onError: function (dom, validator, index) {
                errorArea.text(window.getErrorMessage(dom.name, validator))
                errorArea.show()
                $(dom).css('border', '2px solid red')
            }
        })
        if (!valid) {return}
        var params = $(this).serializeObject()


        params.locales = window.lang
        var button = $('form[name=requirement] button[type=submit]')
        button.css('cursor', 'wait')
        $.betterPost('/api/1/intention_ticket/add', params)
            .done(function () {
                successArea.show()
                $('.requirement_title').hide()
                $('.requirement_form').hide()
            })
            .fail(function () {
                errorArea.text(window.i18n('提交需求失败'))
                errorArea.show()
            })
            .always(function () {
                button.css('cursor', 'default')
            })
    })

    $(document).ready(function () {
        ga.('_setCustomVar',1,'hint',$('.hint').length > 0,2)
    })
})()
