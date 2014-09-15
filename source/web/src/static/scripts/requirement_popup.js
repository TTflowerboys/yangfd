var popup =  $('#requirement_popup')

$('.floatWindow #requirement').click(function () {
    var successArea = popup.find('.requirement .successMessage')
    successArea.hide()
    popup.find('.requirement_title').show()
    popup.find('.requirement_form').show()

    popup.find('form[name=requirement]')[0].reset()

    if (window.user.nickname)
    {
        popup.find('input[name=nickname]').val(window.user.nickname)
    }

    if (window.user.country)
    {
        popup.find('select[name=country]').val(window.user.country)
    }

    if (window.user.phone)
    {
        popup.find('input[name=phone]').val(window.user.phone)
    }

    var language = $('#current_Language').text()
    //setup budget select
    $.get('/api/1/enum?type=budget&_i18n=' + language,
          null,
          function (data, status) {
              if (data.ret === 0) {

                  var budgetSelect = popup.find('select[name=budget]')
                  budgetSelect.empty() //remove all sub nodes
                  for (var i = 0, len = data.val.length; i < len; i = i+ 1) {
                      budgetSelect.append('<option value=' + data.val[i].id + '>' + data.val[i].value + '</option>')
                  }
              }
          }
         )
    popup.show()
    popup.find('.requirement_wrapper').css('top', $(window).scrollTop() -125)
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


popup.find('form[name=requirement]').submit(function (e) {
    e.preventDefault()
    var errorArea = $(this).find('.errorMessage')
    errorArea.hide()
    var successArea = popup.find('.requirement .successMessage')
    popup.find('form[name=requirement] input, form[name=requirement] textarea').each(
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
                   popup.find('.requirement_title').hide()
                   popup.find('.requirement_form').hide()

                   setTimeout(function () {
                       popup.hide()
                   }, 2000)
               }
           });
})

popup.find('form[name=requirement] input[name=phone]').on('change', function () {
    var params = popup.find('form[name=requirement]').serializeObject()
    var theParams = {'country':'', 'phone':''}
    theParams.country = params.country
    theParams.phone = params.phone
    var errorArea = popup.find('form[name=requirement]').find('.errorMessage')
    errorArea.hide()
    $.post('/api/1/user/phone_test',
           theParams,
           function (data, status) {
               if (data.ret !== 0) {
                   errorArea.text(localization.find('#Phone').text() + ' '  + localization.find('#badNumber').text())
                   errorArea.show()
                   var dom = popup.find('form[name=requirement] input[name=phone]')[0]
                   $(dom).css('border', '2px solid red')
               }
           });
})

popup.find('button[name=cancel]').click(function () {
    popup.hide()
});
