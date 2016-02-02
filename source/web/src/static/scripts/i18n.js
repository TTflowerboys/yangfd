$(function () {
    //setup language select
    var language = window.team.getQuery('_i18n') || window.lang
    $('select[name=language]').find('option[value=' + language + ']').prop('selected', true)
    $.cookie('currant_lang', language,{ path: '/' })
    var currency = window.currency
    $('select[name=currency]').find('option[value=' + currency + ']').prop('selected', true)
})

window.changeLanguage = function (language) {
    $.cookie('currant_lang', language,{ path: '/' })
    function reset () {
        if(window.team.getQuery('_i18n')) {
            location.href = window.team.setQuery('_i18n', language)
        } else {
            location.reload()
        }
    }
    if(window.user && language !== _.first(window.user.locales)){
        $.betterPost('/api/1/user/edit', {
            'locales': language
        }).done(function (data) {
            window.user = data
            reset()
        })
    }else{
        reset()
    }
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

window.changeCurrency = function (currency) {
    $.cookie('currant_currency', currency,{ path: '/' })

    if(window.user && currency !== _.first(window.user.currencies)){
        $.betterPost('/api/1/user/edit', {
            'currencies': currency
        }).done(function (data) {
            window.user = data
            location.reload()
        })
    }else{
        location.reload()
    }
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

window.getCurrencySymbol = function (currency) {
    if (currency === 'CNY') {
        return window.i18n('¥')
    }
    else if (currency === 'GBP') {
        return window.i18n('£')
    }
    else if (currency === 'USD') {
        return window.i18n('$')
    }
    else if (currency === 'EUR') {
        return window.i18n('€')
    }
    else if (currency === 'HKD') {
        return window.i18n('HK$')
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