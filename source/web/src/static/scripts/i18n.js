$(function () {
    //setup language select
    var language = window.lang
    $('select[name=language]').find('option[value=' + language + ']').prop('selected', true)
    var currency = window.currency
    $('select[name=currency]').find('option[value=' + currency + ']').prop('selected', true)
})


window.changeLanguage = function(language) {
    var newUrl = team.setQuery('_i18n', language)
    $.cookie('currant_lang', language)
    location.href=newUrl
}

window.getI18nOfLanguage = function (language) {
    if (language === 'zh_Hans_CN') {
        return window.i18n('简体中文quote中国quote')
    }
    else if (language === 'en_GB') {
        return window.i18n('EnglishquoteUnitedblankKingdomquote')
    }
    else {
        return language
    }

}

window.changeCurrency = function(currency) {
    var newUrl = team.setQuery('_currency', currency)
    $.cookie('currant_currency', currency)
    location.href = newUrl
}

$('select[name=language]').change(function () {
    var language = $(this).children('option:selected').val();
    window.changeLanguage(language)
})

$('select[name=currency]').change(function () {
    var currency = $(this).children('option:selected').val()
    window.changeCurrency(currency)
})


//check previous time language changed
$(function () {
    if (window.user) {
        var requiredValue = window.lang
        var userValue = _.first(window.user.locales)
        if (requiredValue) {
            if (requiredValue !== userValue) {

                $.post('/api/1/user/edit', {'locales':requiredValue})
            }
        }
    }
})
