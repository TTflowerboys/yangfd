$(window).on('resize', function () {
    $('#main').css({minHeight: $(window).height() - $('#copyright').height()})
})

$(function () {
    $('#main').css({minHeight: $(window).height() - $('#copyright').height()})
    //setup language select
    var language = $('#current_Language').text()
    $('select[name=language]').find('option[value=' + language + ']').prop('selected', true)
    //setup budget select
    $.get('/api/1/enum?type=budget&_i18n=' + language,
          null,
          function (data, status) {
              if (data.ret === 0) {
                  var budgetSelect = $('select[name=budget]')
                  for (var i = 0, len = data.val.length; i < len; i = i+1) {
                      budgetSelect.append('<option value=' + data.val[i].id + '>' + data.val[i].value + '</option>')
                  }
              }
          }
         )
})

$('select[name=language]').change(function () {
    var language = $(this).children('option:selected').val();
    team.setLocationHrefParam('_i18n', language)
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

$('form[name=subscription]').submit(function (e) {
    e.preventDefault()
    var errorArea = $(this).find('.errorMessage')
    errorArea.hide()
    var successArea = $('.opening .successMessage')

    var valid = $.validate(this, {onError: function (dom, validator, index) {
        errorArea.text(localization.find('#Email').text() + ' ' + errorMessageFormValidatorType(validator))
        errorArea.show()
    }})
    if (!valid) {return}
    var params = $(this).serializeObject()

    var language = $('#current_Language').text()
    params.locales = language
    $.post('/api/1/subscription/add',
           params,
           function (data, status) {
               if (data.ret !== 0) {
                   errorArea.text(localization.find('#subscriptionFailure').text())
                   errorArea.show()
               }
               else {
                   successArea.show()
                   $('form[name=subscription]').hide()
               }
           });
})

function enableSubmitButton(enable) {
    var button = $('form[name=requirement] button[type=submit]')
    if (enable) {
        button.prop('disabled', false);
        button.removeClass('gray').addClass('red')
    }
    else {
        button.prop('disabled',true);
        button.removeClass('red').addClass('gray')
    }
}

var onPhoneNumberChange = function () {
    var params = $('form[name=requirement]').serializeObject()
    var theParams = {'country':'', 'phone': ''}
    theParams.country = params.country
    theParams.phone = params.phone
    var errorArea = $('form[name=requirement]').find('.errorMessage')
    errorArea.hide()
    var $input = $('form[name=requirement] input[name=phone]')
    if (theParams.phone){
        enableSubmitButton(false)
        $.post('/api/1/user/phone_test',
               theParams,
               function (data, status) {
                   if (data.ret !== 0) {
                       errorArea.text(localization.find('#Phone').text() + ' ' + localization.find('#badNumber').text())
                       errorArea.show()
                       $input.css('border', '2px solid red')
                   }
                   else {
                       errorArea.hide()
                       $input.css('border', '2px solid #ccc')
                       enableSubmitButton(true)
                   }
               });
    }
    else {
        errorArea.hide()
        var dom = $('form[name=requirement] input[name=phone]')[0]
        $(dom).css('border', '2px solid #ccc')
        enableSubmitButton(false)
    }
}


$('form[name=requirement] select[name=country]').on('change', onPhoneNumberChange)
$('form[name=requirement] input[name=phone]').on('change', onPhoneNumberChange)

$('form[name=requirement]').submit(function (e) {
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
    var button = $('form[name=requirement] button[type=submit]')
    button.css('cursor', 'wait')
    $.post('/api/1/intention_ticket/add', params)
        .done(function (data) {
            if (data.ret !== 0) {
                errorArea.text(localization.find('#submitRequirementFailure').text())
                errorArea.show()
            }
            else {
                successArea.show()
                $('.requirement_title').hide()
                $('.requirement_form').hide()
            }
        })
        .always(function () {
            button.css('cursor', 'default')
        })
})
