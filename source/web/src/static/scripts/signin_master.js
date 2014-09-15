$(window).on('resize', function () {
    $('#main').css({minHeight: $(window).height() - $('#copyright').height()})
})

$(function () {
    $('#main').css({minHeight: $(window).height() - $('#copyright').height()})

    //setup language select
    var language = $('#current_Language').text()
    $('select[name=language]').find('option[value='+language+']').prop('selected',true)
})

$('select[name=language]').change(function(){
    var language=$(this).children('option:selected').val();
    team.setLocationHrefParam('_i18n', language)
})
