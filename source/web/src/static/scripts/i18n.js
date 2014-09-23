$(function () {
    //setup language select
    var language = window.lang
    $('select[name=language]').find('option[value='+language+']').prop('selected',true)
    var currency = window.currency
    $('select[name=currency]').find('option[value='+currency+']').prop('selected',true)
})


$('select[name=language]').change(function(){
    var language=$(this).children('option:selected').val();
    team.setLocationHrefParam('_i18n', language)
    $.cookie('currant_lang', language)
})

$('select[name=currency]').change(function () {
    var currency = $(this).children('option:selected').val()
    team.setLocationHrefParam('_currency', currency)
    $.cookie('currant_currency', currency)
})
