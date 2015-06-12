$('button[name=userChangeLanguage]').click(function () {
    var $button = $(this)
    var state = $button.attr('data-state')

    if (state === 'normal') {
        $button.attr('data-state', 'editing')
        $button.text(window.i18n('确定'))
        $('select[name=userLanguage]').show()
        $('label[name=userLanguage]').hide()
    }
    else {
        var language = $('select[name=userLanguage]').children('option:selected').val();
        window.changeLanguage(language)
    }
})

$('button[name=userChangeWechat]').click(function () {
    var $button = $(this)
    var state = $button.attr('data-state')

    if (state === 'normal') {
        $button.attr('data-state', 'editing')
        $button.text(window.i18n('确定'))

        $('input[name=userWechat]').show()
        $('label[name=userWechat]').hide()
    }
    else {
        var wechat = $('input[name=userWechat]').val();
        if(wechat !== ''){
            $.betterPost('/api/1/user/edit', {
                'wechat':wechat
            })
                .done(function (data) {
                    window.user = data
                    $('label[name=userWechat]').text(window.user.wechat)

                    $('input[name=userWechat]').hide()
                    $('label[name=userWechat]').show()

                    $button.text(window.i18n('修改'))
                })
        }else{
            $.betterPost('/api/1/user/edit', {
                'unset_fields':'wechat'
            })
                .done(function (data) {
                    window.user = data
                    $('label[name=userWechat]').text('')

                    $('input[name=userWechat]').hide()
                    $('label[name=userWechat]').show()

                    $button.text(window.i18n('修改'))
                })
        }

    }
})

$('[name=userWechat]').keyup(function (e) {
    // Enter
    if(e.keyCode === 13) {
        $('button[name=userChangeWechat]').trigger('click')
    }
})

//check previous time language changed
$(function () {
    if (window.user) {
        var requiredValue = window.lang
        var userValue = _.first(window.user.locales)
        if (requiredValue) {
            if (requiredValue !== userValue) {
                $('label[name=userLanguage]').text(window.getI18nOfLanguage(requiredValue))
                $('select[name=userLanguage]').val(window.getI18nOfLanguage(requiredValue))
            }
        }
    }
})
