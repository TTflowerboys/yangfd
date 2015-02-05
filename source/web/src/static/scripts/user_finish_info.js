(function () {
    $('#date').combodate();


    $('button[name=code]').click(function (e) {
        var errorArea = $('form[name=info]').find('.error')
        errorArea.text(window.i18n('发送中...'))
        errorArea.show()
        var phone = $('form[name=info]').find('.phone input[name=phone]').val()
        var country = $('form[name=info]').find('.phone select[name=country]').val()

        if (!country) {
            errorArea.text(window.i18n('国家不能为空'))
            errorArea.show()
            return
        }

        if (!phone) {
            errorArea.text(window.i18n('电话不能为空'))
            errorArea.show()
            return
        }

        var theParams = {'country':country, 'phone': phone}
        $.betterPost('/api/1/user/sms_verification/send', theParams)
            .done(function (val) {
                errorArea.text(window.i18n('发送成功'))
            })
            .fail(function (ret) {
                errorArea.text(window.i18n('发送失败，请重试'))
            })
            .always(function () {
            })

    })


    $('form[name=info]').submit(function (e) {

        e.preventDefault()

        var successArea = $(this).find('.success')
        var errorArea = $(this).find('.error')
        successArea.hide()
        errorArea.hide()
        var valid = $.validate(this, {onError: function (dom, validator, index) {
            errorArea.text(window.getErrorMessage(dom.name, validator))
            errorArea.show()
        }})

        if (!valid) {return}
        var params = $(this).serializeObject()

        if (!params.nickname) {
            errorArea.text(window.i18n('姓名不能为空'))
            errorArea.show()
            return
        }
        if (!params.gender) {
            errorArea.text(window.i18n('性别不能为空'))
            errorArea.show()
            return
        }
        if (!params.date_of_birth) {
            errorArea.text(window.i18n('生日不能为空'))
            errorArea.show()
            return
        }
        if (!params.country) {
            errorArea.text(window.i18n('国家不能为空'))
            errorArea.show()
            return
        }
        if (!params.state) {
            errorArea.text(window.i18n('省份不能为空'))
            errorArea.show()
            return
        }
        if (!params.city) {
            errorArea.text(window.i18n('城市不能为空'))
            errorArea.show()
            return
        }
        if (!params.address1) {
            errorArea.text(window.i18n('地址不能为空'))
            errorArea.show()
            return
        }

        if (!params.zipcode) {
            errorArea.text(window.i18n('邮政编码不能为空'))
            errorArea.show()
            return
        }

        if (!params.code) {
            errorArea.text(window.i18n('验证码不能为空'))
            errorArea.show()
            return
        }
        $.betterPost('/api/1/user/' + window.user.id + '/sms_verification/verify', {'code':params.code})
            .done(function (data) {
                errorArea.text(window.i18n('验证成功'))
                errorArea.show()
                delete params.code
                $.betterPost('/api/1/user/edit', params)
                    .done(function (data) {
                        window.user = data
                        successArea.text(window.i18n('更新成功'))
                        successArea.show()
                    })
                    .fail(function (data) {
                        errorArea.text(window.i18n('更新失败'))
                        errorArea.show()
                    })

            })
            .fail(function (ret) {
                errorArea.text(window.i18n('验证失败'))
                errorArea.show()
            })
            .always(function () {

            })
    })

})()
