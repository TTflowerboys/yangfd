$('#cvView').find('button[name=edit]').on('click', function () {
    $('#cvView').hide()

    var $editView = $('#cvEdit')
    $editView.find('.success').hide()
    $editView.find('.error').hide()

    $editView.find('input[name=nickname]').val(window.user.nickname)
    if (window.user.gender) {
        $editView.find('input[name=gender][value=' + window.user.gender + ']').attr('checked', 'checked')
    }
    else {
        $editView.find('input[name=gender]').removeAttr('checked')
    }
    if (window.user.country) {
        $editView.find('[name=country] option[value=' + window.user.country.code + ']').attr('selected', 'selected')
    }
    else {
        $editView.find('[name=country] option').removeAttr('selected')
    }

    $('#cvEdit').show()
})

$('#cvEdit').find('button[name=cancel]').on('click', function () {
    $('#cvView').show()
    $('#cvEdit').hide()

})

$('#cvEdit').submit(function (e) {

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
    if (!params.gender) {
        errorArea.text(window.i18n('性别不能为空'))
        errorArea.show()
         return
    }
    if (!params.country) {
        errorArea.text(window.i18n('国家不能为空'))
        errorArea.show()
        return
    }

     $.betterPost('/api/1/user/edit', params)
            .done(function (data) {
                window.user = data
                successArea.text(window.i18n('更新成功'))
                successArea.show()

                window.location.reload()
            })
            .fail(function (data) {
                errorArea.text(window.i18n('更新失败'))
                errorArea.show()
            })


})
