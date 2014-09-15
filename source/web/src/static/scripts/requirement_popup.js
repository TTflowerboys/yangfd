$('.floatWindow #requirement').click(function () {

    var language = $('#current_Language').text()
    //setup budget select
    $.get('/api/1/enum?type=budget&_i18n=' + language,
          null,
          function (data, status) {
              if (data.ret === 0) {
                  var budgetSelect = $('#requirement_popup select[name=budget]')
                  for (var i = 0, len = data.val.length; i < len; i = i+ 1) {
                      budgetSelect.append('<option value=' + data.val[i].id + '>' + data.val[i].value + '</option>')
                  }
              }
          }
         )
    $('#requirement_popup').show()
    $('#requirement_popup .requirement_wrapper').css('top', $(window).scrollTop() -125)
})

var localization = $('#data_localization')

function errorMessageFormValidatorType(validator) {
    if (validator === 'required') {
        return localization.find('#notEmpty').text()
    }
    else if (validator === 'number') {
        return localization.find('#badNumber').text()
    }
    else if (validator === 'email') {
        return localization.find('#badEmail').text()
    }
}


$('#requirement_popup form[name=requirement]').submit(function (e) {
    e.preventDefault()
    var errorArea = $(this).find('.errorMessage')
    errorArea.hide()
    var successArea = $('.requirement .successMessage')
    $('form[name=requirement] input, form[name=requirement] textarea').each(
        function (index) {
            $(this).css('border', '2px solid #ccc')
        }
    )

    var valid = $.validate(this, {onError: function (dom, validator, index) {
        var prefix = ''
        if (dom.name === 'nickname')
        {
            prefix = localization.find('#Name').text()
        }
        else if (dom.name === 'phone')
        {
            prefix = localization.find('#Phone').text()
        }
        else if (dom.name === 'email')
        {
            prefix = localization.find('#Email').text()
        }

        errorArea.text(prefix + ' ' + errorMessageFormValidatorType(validator))
        errorArea.show()
        $(dom).css('border', '2px solid red')
    }})
    if (!valid) {return}
    var params = $(this).serializeObject()

    var language = $('#current_Language').text()
    params.locales = language
    $.post('/api/1/intention_ticket/add',
           params,
           function (data, status) {
               if (data.ret !== 0) {
                   errorArea.text(localization.find('#submitRequirementFailure').text())
                   errorArea.show()
               }
               else {
                   successArea.show()
                   $('.requirement_title').hide()
                   $('.requirement_form').hide()

                   setInterval(function () {
                       $('#requirement_popup').hide()
                   }, 2000)
               }
           });
})

$('#requirement_popup form[name=requirement] input[name=phone]').on('change', function () {
    var params = $('form[name=requirement]').serializeObject()
    var theParams = {'country':'', 'phone':''}
    theParams.country = params.country
    theParams.phone = params.phone
    var errorArea = $('form[name=requirement]').find('.errorMessage')
    errorArea.hide()
    $.post('/api/1/user/phone_test',
           theParams,
           function (data, status) {
               if (data.ret !== 0) {
                   errorArea.text(localization.find('#Phone').text() + ' '  + localization.find('#badNumber').text())
                   errorArea.show()
                   var dom = $('form[name=requirement] input[name=phone]')[0]
                   $(dom).css('border', '2px solid red')
               }
           });
})

$('#requirement_popup button[name=cancel]').click(function () {
    $('#requirement_popup').hide()
});
