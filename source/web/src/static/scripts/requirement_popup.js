var popup = $('#requirement_popup')

$('.floatBar #requirement').click(function () {
    var successArea = popup.find('.requirement .successMessage')
    successArea.hide()
    var errorArea = popup.find('.errorMessage')
    errorArea.hide()
    popup.find('.requirement_title').show()
    popup.find('.requirement_form').show()

    popup.find('form[name=requirement]')[0].reset()

    if (window.user) {
        if (window.user.nickname) {
            popup.find('input[name=nickname]').val(window.user.nickname)
        }

        if (window.user.country) {
            popup.find('select[name=country]').val(window.user.country.id)
        }

        if (window.user.phone) {
            popup.find('input[name=phone]').val(window.user.phone)
        }
    }

    //setup budget select
    $.get('/api/1/enum?type=budget&_i18n=' + window.lang)
        .done(function (val) {
            var budgetSelect = popup.find('select[name=budget]')
            budgetSelect.empty() //remove all sub nodes
            for (var i = 0, len = val.length; i < len; i = i + 1) {
                budgetSelect.append('<option value=' + val[i].id + '>' + val[i].value + '</option>')
            }
        })

    popup.show()
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

popup.find('form[name=requirement]').submit(function (e) {
    e.preventDefault()
    var errorArea = $(this).find('.errorMessage')
    errorArea.hide()
    var successArea = popup.find('.requirement .successMessage')
    popup.find('form[name=requirement] input, form[name=requirement] textarea').each(
        function (index) {
            $(this).css('border', '2px solid #ccc')
        }
    )

    var valid = $.validate(this, {onError: function (dom, validator, index) {
        errorArea.text(window.getErrorMessage(dom.name.validator))
        errorArea.show()
        $(dom).css('border', '2px solid red')
    }})
    if (!valid) {return}

    var params = $(this).serializeObject()
    params.locales = window.lang

    var button = $('form[name=requirement] button[type=submit]')
    button.css('cursor', 'wait')
    $.post('/api/1/intention_ticket/add', params)
        .done(function (val) {
            successArea.show()
            $('.requirement_title').hide()
            $('.requirement_form').hide()

            setTimeout(function () {
                popup.hide()
            }, 2000)
        })
        .fail(function () {
            errorArea.text(window.i18n('提交需求失败'))
            errorArea.show()
        })
        .always(function () {
            button.css('cursor', 'default')
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
    var params = popup.find('form[name=requirement]').serializeObject()
    var theParams = {'country': '', 'phone': ''}
    theParams.country = params.country
    theParams.phone = params.phone
    var errorArea = popup.find('form[name=requirement]').find('.errorMessage')
    errorArea.hide()
    var $input = popup.find('form[name=requirement] input[name=phone]')
    if (theParams.phone) {
        enableSubmitButton(false)
        $.post('/api/1/user/phone_test', theParams)
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


popup.find('form[name=requirement] select[name=country]').on('change', onPhoneNumberChange)
popup.find('form[name=requirement] input[name=phone]').on('change', onPhoneNumberChange)


popup.find('button[name=cancel]').click(function () {
    popup.hide()
});
