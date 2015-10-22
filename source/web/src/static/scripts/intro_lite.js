(function (module) {
    function IntroLite() {}
    IntroLite.prototype = {
        init: function (options) {
            function isFixed(elem) {
                return elem.css('position') === 'fixed' || (elem.is('body') ? false : isFixed(elem.parent()))
            }
            if(options.targetElem && options.targetElem.is(':visible') && options.targetElem.data('initIntroLite') !== true) {
                options.targetElem.data('initIntroLite', true)
                options = $.extend({duration: 300, arrow: 'top', arrowSize: {width: 10, height: 10}}, options)
                this.elem = $('<div class="intro-lite" style="display:none;"><div class="text"></div><div class="intro-lite-arrow"></div><div class="close"><i class="icon-delete"></i></div></div>')
                if(options.style) {
                    this.elem.css(options.style)
                }
                this.isFixed = isFixed(options.targetElem)
                if(this.isFixed) {
                    this.elem.css({position: 'fixed'})
                } else {
                    this.elem.css({position: 'absolute'})
                }
                this.elem.find('.text').text(options.text).end().find('.intro-lite-arrow').addClass(options.arrow)
                this.show(options)
                this.initPos(options)
                this.bindEvent(options)
            }
        },
        initPos: function (options) {
            var targetElemLeft,
                targetElemTop,
                targetElemWidth,
                targetElemHeight,
                elemWidth,
                elemHeight

            if(options.targetElem) {
                targetElemLeft = options.targetElem.offset().left - (this.isFixed ? $(window).scrollLeft() : 0)
                targetElemTop = options.targetElem.offset().top - (this.isFixed ? $(window).scrollTop() : 0)
                targetElemWidth = options.targetElem.outerWidth()
                targetElemHeight = options.targetElem.outerHeight()
                elemWidth = this.elem.outerWidth()
                elemHeight = this.elem.outerHeight()
                var cssOption = {}
                switch(options.arrow) {
                    case 'top':
                        cssOption = {
                            top: (targetElemTop - options.arrowSize.height - elemHeight) + 'px',
                            left: (targetElemLeft + (targetElemWidth - elemWidth) / 2) + 'px'
                        }
                        break;
                    case 'left':
                        cssOption = {
                            top: (targetElemTop + (targetElemHeight - elemHeight) / 2) + 'px',
                            left: (targetElemLeft - options.arrowSize.width - elemWidth) + 'px'
                        }
                        break;
                    case 'right':
                        cssOption = {
                            top: (targetElemTop + (targetElemHeight - elemHeight) / 2) + 'px',
                            left:  (targetElemLeft + options.arrowSize.width + targetElemWidth) + 'px'
                        }
                        break;
                }
                if(this.isFixed) {
                    cssOption.bottom = $(window).height() - parseInt(cssOption.top) - elemHeight + 'px'
                    delete cssOption.top
                }
                this.elem.css(cssOption)
            }
        },
        bindEvent : function (options) {
            var raf
            var _this = this
            function touchHanddler () {
                _this.initPos(options)
                raf = window.requestAnimationFrame(touchHanddler)
            }
            this.elem.bind('click', this.close.bind(this))
            if(options.closeTrigger) {
                $(options.closeTrigger.elem).bind(options.closeTrigger.event, this.close.bind(this))
            }
            if (!this.isFixed) {
                $(window).resize(function () {
                    _this.initPos(options)
                })
                $(window).scroll(function () {
                    _this.initPos(options)
                })
                document.body.addEventListener('touchstart', touchHanddler)
                document.body.addEventListener('touchend', function () {
                    window.cancelAnimationFrame(raf)
                })
            }
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