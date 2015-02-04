(function () {
    $('#date').combodate();


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
        delete params.verificationCode

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

})()
