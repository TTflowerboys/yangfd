$('[name=userChangeLanguage]').click(function () {
    var $button = $(this)
    var state = $button.attr('data-state')

    if (state === 'normal') {
        $button.attr('data-state', 'editing')
        $button.text(window.i18n('确定'))
        if (window.team.isPhone()) {
            $button.removeClass('btn-edit').addClass('btn-red')
        }
        $('select[name=userLanguage]').show()
        $('label[name=userLanguage]').hide()
    }
    else {
        var language = $('select[name=userLanguage]').children('option:selected').val();
        window.changeLanguage(language)
    }
})
$('[name=userCurrency]').click(function () {
    var $button = $(this)
    var state = $button.attr('data-state')

    if (state === 'normal') {
        $button.attr('data-state', 'editing')
        $button.text(window.i18n('确定'))
        if (window.team.isPhone()) {
            $button.removeClass('btn-edit').addClass('btn-red')
        }
        $('select[name=userCurrency]').show()
        $('label[name=userCurrency]').hide()
    }
    else {
        var currency = $('select[name=userCurrency]').children('option:selected').val();
        window.changeCurrency(currency)
    }
})

$('[name=userChangeWechat]').click(function () {
    var $button = $(this)
    var state = $button.attr('data-state')

    if (state === 'normal') {
        $button.attr('data-state', 'editing')
        $button.text(window.i18n('确定'))
        if (window.team.isPhone()) {
            $button.removeClass('btn-edit').addClass('btn-red')
        }

        $('input[name=userWechat]').show()
        $('label[name=userWechat]').hide()
    }
    else {
        var wechat = $('input[name=userWechat]').val();
        if (wechat !== '') {
            $.betterPost('/api/1/user/edit', {
                'wechat': wechat
            })
                .done(function (data) {
                    window.user = data
                    $('label[name=userWechat]').text(window.user.wechat)

                    $('input[name=userWechat]').hide()
                    $('label[name=userWechat]').show()

                    $button.text(window.i18n('修改'))
                    if (window.team.isPhone()) {
                        $button.removeClass('btn-red').addClass('btn-edit').html('<i class="icon-nav-arrow-right"></i>')
                    }
                    $button.attr('data-state', 'normal')
                })
        } else {
            $.betterPost('/api/1/user/edit', {
                'unset_fields': 'wechat'
            })
                .done(function (data) {
                    window.user = data
                    $('label[name=userWechat]').text('')

                    $('input[name=userWechat]').hide()
                    $('label[name=userWechat]').show()

                    $button.text(window.i18n('修改'))
                    $button.attr('data-state', 'normal')
                })
        }

    }
})

$('[name=userWechat]').keyup(function (e) {
    // Enter
    if (e.keyCode === 13) {
        $('button[name=userChangeWechat]').trigger('click')
    }
})

//Setup pages by remove duplicated nodes by device
//TODO: only temporary walkaround for michael's code
$(function () {
    if (team.isPhone()) {
        $('.setting').remove()
    }else{
        $('.setting_phone').remove()
    }
})
