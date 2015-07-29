/**
 * Created by levy on 15-5-13.
 */
(function(Swiper){
    //Display ask invitation when from sign in page
    var from = window.team.getQuery('from', location.href)
    if(from === 'signin'){
        $('.downloadWrap').hide()
        $('.emailWrap').show()
    }else{
        $('.downloadWrap').show()
        $('.emailWrap').hide()
    }

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
            $('.emailWrap').hide().siblings('.info').show()
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
    $('a.appStore').click(function (e) {
        if (window.team.isWeChat()) {
            e.preventDefault()
            showGuideLine()
        }
    })
    function showGuideLine () {
        $('.guideLine').fadeIn(300).click(function () {
            $(this).fadeOut(300)
        })
    }

    window.team.initDisplayOfElement()
    $(window).resize(window.team.initDisplayOfElement)
})(window.Swiper)