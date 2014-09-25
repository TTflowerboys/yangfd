$(function () {
    //setup language select
    var language = window.lang
    $('select[name=language]').find('option[value=' + language + ']').prop('selected', true)
    var currency = window.currency
    $('select[name=currency]').find('option[value=' + currency + ']').prop('selected', true)
})


$('select[name=language]').change(function () {
    var language = $(this).children('option:selected').val();
    var newUrl = team.setQuery('_i18n', language)
    $.cookie('currant_lang', language)
    location.href = newUrl
})

$('select[name=currency]').change(function () {
    var currency = $(this).children('option:selected').val()
    var newUrl = team.setQuery('_currency', currency)
    $.cookie('currant_currency', currency)
    location.href = newUrl
})
