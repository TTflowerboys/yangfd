/**
 * Created by levy on 15-5-13.
 */
(function(Swiper){
    window.swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        autoplay: 4000
    });
    $('#submitBtn').bind('click', function (e) {
        var email = $('[name=email]').val()
        if(!/.+@.+\..+/.test(email)) {
            window.alert(i18n('邮件格式不正确，请重新填写'))
            return false
        }
        if($(this).data('disabled') === true) {
            return false
        }
        $('.emailWrap').find('button').text(i18n('提交中...')).data('disabled', true)
        $.betterPost('/api/1/subscription/add', {
            'email': email
        }).done(function (val) {
            $('.emailWrap').find('input,button').hide().siblings('.info').show()
        }).fail(function (ret) {
            window.alert(window.getErrorMessageFromErrorCode(ret))
        }).always(function () {
            $('.emailWrap').find('button').text(i18n('申请内测')).data('disabled', false)
        })
    })
    $('[name=email]').keyup(function (e) {
        if(e.keyCode === 13) {
            $('#submitBtn').trigger('click')
        }
    })
})(window.Swiper)