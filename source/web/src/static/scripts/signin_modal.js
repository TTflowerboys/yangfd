$('#login').click(function () {
    $('#modal_shadow').show()
    $('#modal').show()
});
$('#modal_shadow').click(function () {
    $('#modal_shadow').hide()
    $('#modal').hide()
});

var errorArea = $('form[name=signin]').find('.errorMessage')
$('form[name=signin]').submit(function (e) {
    e.preventDefault()
    errorArea.hide()
    var valid = $.validate(this, {onError: function (dom,validator,index) {
        errorArea.text(dom.name + ' validate error ' + validator)
        errorArea.show()
    }})
    if(!valid){return}

    var params = $(this).serializeObject()
    params.password = Base64.encode(params.password)
    $.post('/api/1/user/login',
           params,
           function (data, status) {
               if (data.ret !== 0) {
                   errorArea.text(data.msg)
                   errorArea.show()
               }
               else {
                   location.reload()
                   $('#modal_shadow').hide()
                   $('#modal').hide()
               }
           });
})

$('#logout').click(function () {
    $.get('/logout',
          null,
          function (data, status) {
              location.reload()
          }
         )
});

$('select[name=language]').change(function(){
    var language=$(this).children('option:selected').val();
    team.setLocationHrefParam('_i18n', language)
})
