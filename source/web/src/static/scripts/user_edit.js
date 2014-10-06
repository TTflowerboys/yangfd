$('#cvView').find('button[name=edit]').on('click', function () {
    $('#cvView').hide()
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

     $.betterPost('/api/1/user/edit', params)
            .done(function (data) {
                window.user = data
                successArea.text(window.i18n('更新成功'))
                successArea.show()

                location.reload()
            })
            .fail(function (data) {
                errorArea.text(window.i18n('更新失败'))
                errorArea.show()
            })


})
