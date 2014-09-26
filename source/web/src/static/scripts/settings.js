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

//check previous time language changed
$(function () {
    if (window.user) {
        var requiredValue = window.lang
        var userValue = _.first(window.user.locales)
        if (requiredValue) {
            if (requiredValue !== userValue) {
                $('label[name=userLanguage]').text(window.getI18nOfLanguage(requiredValue))
            }
        }
    }
})
