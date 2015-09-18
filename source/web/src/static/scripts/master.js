$(function () {
    window.project.updateMenuTitle($('title').text());

    $(window).scroll(function(){
        if ($(this).scrollTop() > $(this).height()) {
            $('#floatBar #scrollToTop').show();
        } else {
            $('#floatBar #scrollToTop').hide();
        }
    });

    $('#floatBar #scrollToTop').click(function () {
        $('html, body').animate({scrollTop : 0},400);
        return false;
    })

    $('#floatBar .section').mouseenter(function (e) {
        ga('send', 'event', 'floatBar', 'mouseEnter', e.currentTarget.id);
    })

    $('#floatBar .section').hover(function () {
        $(this).addClass('hover').siblings().removeClass('hover')
    }, function () {
        var $this = $(this)
        setTimeout(function () {
            $this.removeClass('hover')
        }, 500)
    })
    //Display float app download bar based on cookie
    if(typeof $.cookie === 'function' && $.cookie('show-app-floatbar') === 'false'){
        $('.app-floatbar').hide()
    }else{
        if (window.team.isPhone() && !window.project.isMobileClient()) {
            if($('.floatBar_phone').length){
                $('.app-floatbar').css('bottom', $('.floatBar_phone').height() + 'px')
            }
            $('.app-floatbar').show()
        }
    }

    $('.app-floatbar-close').on('click',function(e){
        $('.app-floatbar').hide()
        if(_.isFunction($.cookie)) {
            $.cookie('show-app-floatbar',false,{ path: '/' })
        }
    })

    window.addEventListener('contextmenu', function(e) {
        if(window.team.isPhone()) {
            e.preventDefault()
            return false
        }
    })

    $('[data-utc-time]').each(function () {
        var format = $(this).attr('data-utc-format') || 'YYYY-MM-DD'
        $(this).append(window.moment.utc($(this).attr('data-utc-time')).format(format))
    })

    //检测由js动态添加的dom已经被插入
    function checkDomExist (exp, interval) {
        var deferred = $.Deferred()
        interval = interval || 200
        function check() {
            if($(exp).length) {
                deferred.resolve($(exp))
            } else {
                setTimeout(function () {
                    check ()
                }, interval)
            }
        }
        check()
        return deferred.promise()
    }
    if($('link[href*=baiduBridge]').length) {
        checkDomExist('.qiao-mess-wrap')
            .then(function (elem) {
                elem.find('.qiao-mess-head')
                    .prepend('<h2><i class="icon-email"></i><span>' + i18n('请您留言') + '</span></h2>')
                    .append('<a id="qiao-mess-head-hide" class="qiao-mess-head-hide"></a>')
                    .delegate('.qiao-mess-head-hide', 'click', function () {
                        elem.hide()
                    })
                    .find('.qiao-mess-head-text').hide().end().end()
                    .find('[name=bd_bp_messName]').prop('placeholder', i18n('请填写您的姓名')).end()
                    .find('[name=bd_bp_messPhone]').prop('placeholder', i18n('请填写您的电话')).end()
                    .find('[name=bd_bp_messAddress]').prop('placeholder', i18n('请填写您的地址')).end()
                    .find('[name=bd_bp_messEmail]').prop('placeholder', i18n('请填写您的邮箱')).end()
            })
    }
})

