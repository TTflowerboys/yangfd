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
        return window.i18n('简体中文(中国)')
    }
    else if (language === 'en_GB') {
        return window.i18n('English (United Kingdom)')
    }
    else {
        return language
    }
}

window.changeCurrency = function(currency) {
    var newUrl = team.setQuery('_i18n_currency', currency)
    $.cookie('currant_currency', currency)
    location.href = newUrl
}

window.getCurrencyPresentation = function (currency) {
    if (currency === 'CNY') {
        return window.i18n('人民币')
    }
    else if (currency === 'GBP') {
        return window.i18n('英镑')
    }
    else if (currency === 'USD') {
        return window.i18n('美元')
    }
    else if (currency === 'EUR') {
        return window.i18n('欧元')
    }
    else if (currency === 'HKD') {
        return window.i18n('港币')
    }
}

$('select[name=language]').change(function () {
    var language = $(this).children('option:selected').val();
    window.changeLanguage(language)

    ga('send', 'event', 'i18n', 'change', 'language-change')
})

$('select[name=currency]').change(function () {
    var currency = $(this).children('option:selected').val()
    window.changeCurrency(currency)

    ga('send', 'event', 'i18n', 'change', 'currency-change')
})


//check previous time language changed
$(function () {
    if (window.user) {
        var requiredValue = window.lang
        var userValue = _.first(window.user.locales)
        if (requiredValue) {
            if (requiredValue !== userValue) {

                $.betterPost('/api/1/user/edit', {'locales':requiredValue})
            }
        }
    }
})
