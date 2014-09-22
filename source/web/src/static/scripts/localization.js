$(function () {
    //setup language select
    var language = window.lang
    $('select[name=language]').find('option[value='+language+']').prop('selected',true)
})


$('select[name=language]').change(function(){
    var language=$(this).children('option:selected').val();
    team.setLocationHrefParam('_i18n', language)
    $.cookie('currant_lang', language)
})
