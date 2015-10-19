(function (module) {
    function IntroLite() {}
    IntroLite.prototype = {
        init: function (options) {
            options = $.extend({duration: 300, arrow: 'top', arrowSize: {width: 10, height: 10}}, options)
            this.elem = $('<div class="intro-lite" style="display:none;"><div class="text"></div><div class="intro-lite-arrow"></div><div class="close"><i class="icon-delete"></i></div></div>')
            if(options.style) {
                this.elem.css(options.style)
            }
            this.elem.find('.text').text(options.text).end().find('.intro-lite-arrow').addClass(options.arrow)
            this.show(options)
            this.initPos(options)
            this.bindEvent(options)
        },
        initPos: function (options) {
            var targetElemLeft,
                targetElemTop,
                targetElemWidth,
                targetElemHeight,
                elemWidth,
                elemHeight

            if(options.targetElem) {
                targetElemLeft = options.targetElem.offset().left
                targetElemTop = options.targetElem.offset().top
                targetElemWidth = options.targetElem.outerWidth()
                targetElemHeight = options.targetElem.outerHeight()
                elemWidth = this.elem.outerWidth()
                elemHeight = this.elem.outerHeight()

                switch(options.arrow) {
                    case 'top':
                        this.elem.css({
                            top: (targetElemTop - options.arrowSize.height - elemHeight) + 'px',
                            left: (targetElemLeft + (targetElemWidth - elemWidth) / 2) + 'px'
                        })
                        break;
                    case 'left':
                        this.elem.css({
                            top: (targetElemTop + (targetElemHeight - elemHeight) / 2) + 'px',
                            left: (targetElemLeft - options.arrowSize.width - elemWidth) + 'px'
                        })
                        break;
                    case 'right':
                        this.elem.css({
                            top: (targetElemTop + (targetElemHeight - elemHeight) / 2) + 'px',
                            left:  (targetElemLeft + options.arrowSize.width + targetElemWidth) + 'px'
                        })
                }
            }
        },
        bindEvent : function (options) {
            var _this = this
            this.elem.bind('click', this.close.bind(this))
            if(options.closeTrigger) {
                $(options.closeTrigger.elem).bind(options.closeTrigger.event, this.close.bind(this))
            }
            $(window).scroll(function () {
                _this.initPos(options)
            })
            $(window).resize(function () {
                _this.initPos(options)
            })
        },
        show: function (options) {
            this.elem.appendTo($('body')).fadeIn(options.duration)
        },
        close: function (options) {
            var elem = this.elem
            elem.fadeOut(options.duration, function () {
                elem.remove()
            })
        }
    }
    module.IntroLite = IntroLite
})(window.currantModule = window.currantModule || {})