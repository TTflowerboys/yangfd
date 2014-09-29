

$('button[name=code]').click(function (e) {

    var phone = window.user.phone
    var country = window.user.country.id
    var theParams = {'country':country, 'phone': phone}
    $.post('/api/1/user/sms_verification/send', theParams)
        .done(function (val) {
            //var  userId = val
        })
        .fail(function () {
            
        })
        .always(function () {
        })

})


$('form[name=changePhone2]').submit(function (e) {
    e.preventDefault()

    var resultArea = $(this).find('.resultMessage')
    resultArea.hide()
    var valid = $.validate(this, {onError: function (dom, validator, index) {
        resultArea.text(window.getErrorMessage(dom.name, validator))
        resultArea.show()
    }})

    if (!valid) {return}
    var params = $(this).serializeObject()

    $.post('/api/1/user/' + window.user.id + '/sms_verification/verify', params)
        .done(function (data) {
            window.user = data
            resultArea.text(window.i18n('验证成功'))
            resultArea.show()
            location.href = '/user_settings'
        })
	.fail(function (ret) {
            resultArea.text(window.i18n('验证失败'))
            resultArea.show()
	})
        .always(function () {
            
        })
   
})

