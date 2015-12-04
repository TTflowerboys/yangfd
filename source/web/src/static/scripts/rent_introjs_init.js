/**
 * Created by levy on 15-6-10.
 */
function PhoneIntroJs(options) {
    options = $.extend({duration: 300, arrow: 'top'}, options)
    this.init = function () {
        this.elem = $('<div class="intro-phone" style="display: none;"><table><tbody><tr><td class="text"></td><td class="close"><i class="icon-circle_close_delete"></i></td></tr></tbody></table><div class="introjs-arrow-phone"></div></div>')
        this.elem.css(options.style).find('.text').text(options.text).end().find('.introjs-arrow-phone').addClass(options.arrow)
        this.show()
        this.bindEvent()
    }
    this.bindEvent = function () {
        this.elem.delegate('.close', 'click', this.close.bind(this))
        if(options.closeTrigger) {
            $(options.closeTrigger.elem).bind(options.closeTrigger.event, this.close.bind(this))
        }
    }
    this.show = function () {
        this.elem.appendTo($('body')).fadeIn(options.duration)
    }
    this.close = function () {
        this.elem.fadeOut(options.duration)
    }
}
function startIntroOnPhone() {
    /*new PhoneIntroJs({
        text: i18n('点击此处可以咨询房东'),
        arrow: 'bottom',
        style : {
            position: 'fixed',
            bottom: '50px',
            left: '10%'
        },
        closeTrigger: {
            elem: '.floatBar_phone .phone a',
            event: 'click'
        }
    }).init()*/

    new PhoneIntroJs({
        text: i18n('点击此处可以收藏房产'),
        arrow: 'bottom-right',
        style : {
            position: 'fixed',
            bottom: '50px',
            right: '1.3%'
        },
        closeTrigger: {
            elem: '.floatBar_phone .favorite',
            event: 'click'
        }
    }).init()
}

function startIntroOnWeb() {
    var intro = window.introJs();
    var steps = [
        /*{
            element: $('#contactRequest')[0],
            intro: i18n('小提示：点击此处可以咨询房东'),
            position: 'bottom'
        },*/
        {
            element: $('.actions tr').eq(0)[0],
            intro: i18n('小提示：看到中意的房产，可以点击此处的收藏按钮来收藏，也可以点击分享按钮将房产分享给您的朋友'),
            position: 'bottom'
        },
    ]
    if(!$('#contactRequest').length) {
        steps.shift()
    }
    intro.setOptions({
        steps: steps,
        'skipLabel': window.i18n('跳过'),
        'doneLabel': window.i18n('关闭'),
        'nextLabel': window.i18n('下一条'),
        'prevLabel': window.i18n('上一条'),
    })
    intro.start()
}

function initIntro() {
    if($.cookie('introjs_rent') !== 'hasShow') {
        $.cookie('introjs_rent', 'hasShow', {
            path: '/',
            expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365)
        })
        if(window.team.isPhone()) {
            startIntroOnPhone()
        } else {
            startIntroOnWeb()
        }
    }
}
initIntro()