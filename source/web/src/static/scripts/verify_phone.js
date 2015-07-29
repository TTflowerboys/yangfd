(function () {
    var $phoneInupt = $('[name=phone]')
    var $errorMsg = $('.errorMessage')
    var $getCodeBtn = $('.getCode')
    $('.phoneRow').click(function () {
       $(this).find('.phoneReadonly').hide().next('.phoneEdit').show()
    })
    function enableSubmitButton(enable) {
        var button = $('button[type=submit]')
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
        var params = {
            country: $('[name=country]').val(),
            phone: $('[name=phone]').val()
        }
        if (params.phone) {
            enableSubmitButton(false)
            $.betterPost('/api/1/user/phone_test', params)
                .done(function () {
                    $errorMsg.hide()
                    $phoneInupt.css('border', '')
                    enableSubmitButton(true)
                })
                .fail(function () {
                    $errorMsg.text(window.getErrorMessage('phone', 'number'))
                    $errorMsg.show()
                    $phoneInupt.css('border', '2px solid red')
                })
        }
        else {
            $errorMsg.hide()
            $phoneInupt.css('border', '')
            enableSubmitButton(true)
        }
    }
    $phoneInupt.on('change', onPhoneNumberChange)
})()