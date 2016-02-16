(function () {
    $('.birthday input').combodate();

    $('.countrySelector').change(function () {
        var optionSelected = $('.countrySelector option:selected')
        var slug = $(optionSelected).attr('data-slug')
        $('.countryOptions').hide()
        $('.countryOptions.' + slug).show()
    })

    $('.manuallyInputAddress').click(function (e) {
        var button = e.target
        $(button).parents('.address1').find('.detail').show()
        $(button).parents('.address1').parent().find('.addressOverOneYear').show()
        $(button).hide()
    })

    $('.addressOverOneYear button').click(function (e) {
        var button = e.target
        if ($(button).hasClass('selected')) {
            $(button).siblings('button').addClass('selected')
            $(button).siblings('button').addClass('button')
            $(button).siblings('button').removeClass('ghostButton')
            $(button).removeClass('selected')
            $(button).addClass('ghostButton')
            $(button).removeClass('button')
        }
        else {
            $(button).siblings('button').removeClass('selected')
            $(button).siblings('button').addClass('ghostButton')
            $(button).siblings('button').removeClass('button')
            $(button).addClass('selected')
            $(button).addClass('button')
            $(button).removeClass('ghostButton')
        }

        if ($(button).parents('.addressOverOneYear').find('button.selected').attr('name') === 'yes') {
            $(button).parents('.countryOptions').find('.address2').hide()
        }
        else {
            $(button).parents('.countryOptions').find('.address2').show()
        }

    })

    $('button[name=code]').click(function (e) {
        var errorArea = $('form[name=info]').find('.error')
        errorArea.text(window.i18n('发送中...'))
        errorArea.show()
        var phone = $('form[name=info]').find('.phone input[name=phone]').val()
        var country_code = $('form[name=info]').find('.phone select[name=country_code]').val()

        if (!country_code) {
            window.dhtmlx.message({type:'error', text: window.i18n('电话区号不能为空')})
            errorArea.text(window.i18n('电话区号不能为空'))
            errorArea.show()
            return
        }

        if (!phone) {
            window.dhtmlx.message({type:'error', text: window.i18n('电话不能为空')})
            errorArea.text(window.i18n('电话不能为空'))
            errorArea.show()
            return
        }

        var theParams = {'phone': '+' + country_code + phone}
        $.betterPost('/api/1/user/sms_verification/send', theParams)
            .done(function (val) {
                errorArea.text(window.i18n('发送成功'))
            })
            .fail(function (ret) {
                window.dhtmlx.message({type:'error', text: window.i18n('发送失败，请重试')})
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
            window.dhtmlx.message({type:'error', text: window.getErrorMessage(dom.name, validator)})
            errorArea.text(window.getErrorMessage(dom.name, validator))
            errorArea.show()
        }})

        if (!valid) {return}
        var params = $(this).serializeObject()

        if (!params.nickname) {
            window.dhtmlx.message({type:'error', text: window.i18n('姓名不能为空')})
            errorArea.text(window.i18n('姓名不能为空'))
            errorArea.show()
            return
        }
        if (!params.gender) {
            window.dhtmlx.message({type:'error', text: window.i18n('性别不能为空')})
            errorArea.text(window.i18n('性别不能为空'))
            errorArea.show()
            return
        }
        if (!params.date_of_birth) {
            window.dhtmlx.message({type:'error', text: window.i18n('生日不能为空')})
            errorArea.text(window.i18n('生日不能为空'))
            errorArea.show()
            return
        }
        if (!params.country) {
            window.dhtmlx.message({type:'error', text: window.i18n('国家不能为空')})
            errorArea.text(window.i18n('国家不能为空'))
            errorArea.show()
            return
        }
        if (!params.state) {
            window.dhtmlx.message({type:'error', text: window.i18n('省份不能为空')})
            errorArea.text(window.i18n('省份不能为空'))
            errorArea.show()
            return
        }
        if (!params.city) {
            window.dhtmlx.message({type:'error', text: window.i18n('城市不能为空')})
            errorArea.text(window.i18n('城市不能为空'))
            errorArea.show()
            return
        }
        if (!params.address1) {
            window.dhtmlx.message({type:'error', text: window.i18n('地址不能为空')})
            errorArea.text(window.i18n('地址不能为空'))
            errorArea.show()
            return
        }

        if (!params.zipcode) {
            window.dhtmlx.message({type:'error', text: window.i18n('邮政编码不能为空')})
            errorArea.text(window.i18n('邮政编码不能为空'))
            errorArea.show()
            return
        }

        if (!params.code) {
            window.dhtmlx.message({type:'error', text: window.i18n('验证码不能为空')})
            errorArea.text(window.i18n('验证码不能为空'))
            errorArea.show()
            return
        }
        params.phone = '+' + params.country_code + params.phone
        delete params.country_code
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
                        window.dhtmlx.message({type:'error', text: window.i18n('更新失败')})
                        errorArea.text(window.i18n('更新失败'))
                        errorArea.show()
                    })

            })
            .fail(function (ret) {
                window.dhtmlx.message({type:'error', text: window.i18n('验证失败')})
                errorArea.text(window.i18n('验证失败'))
                errorArea.show()
            })
            .always(function () {

            })
    })

})()
