


$('form[name=changePhone2]').submit(function (e) {
    e.preventDefault()

    var resultArea = $(this).find('.resultMessage')
    resultArea.hide()
    var valid = $.validate(this, {onError: function (dom, validator, index) {
        resultArea.text(window.getInputValidationMessage(dom.name, validator))
        resultArea.show()
    }})

    if (!valid) {return}
   // var params = $(this).serializeObject()
   
})
