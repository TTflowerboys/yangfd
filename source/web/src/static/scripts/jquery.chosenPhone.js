(function($) {
    $.fn.chosenPhone = function (option) {
        option = $.extend({
            duration: 200,
            display_disabled_options: true
        }, option)
        return this.each(function() {
            var elem, data;
            elem = $(this)
            data = elem.data('chosen')
            if(!(data instanceof Chosen)) {
                elem.data('chosen', new Chosen(this, option))
            }
        })
    }
    function Chosen(elem, option) {
        var _this = this
        this.elem = $(elem)
        this.fetch = function () {
            return _.map(this.elem.find('option'), function(option, index){
                return {
                    disabled: $(option).attr('disabled'),
                    class: $(option).attr('class'),
                    index: index,
                    value: $(option).attr('value'),
                    text: $(option).text(),
                    selected: $(option).is(':selected')
                }
            })
        }
        this.create = function () {
            this.body = this.elem.parents('body,html')
            this.chosen = $('<div class="chosen-container chosen-container-single' + ((option.disable_search_threshold && option.disable_search_threshold >= this.data.length) ? ' chosen-container-single-nosearch' : '') + '"><a class="chosen-single" tabindex="-1"><span></span><div><b></b></div></a><div class="chosen-drop"><div class="chosen-search"><input type="text" autocomplete="off" spellcheck="false"><i class="icon-search"></i></div><ul class="chosen-results"></ul><div class="close-chosen-drop"><span>' + i18n('取消') + '</span></div></div></div>')
            this.chosenSingle = this.chosen.find('.chosen-single')
            this.chosenSingleSpan = this.chosenSingle.find('span')
            this.chosenSearch = this.chosen.find('.chosen-search input')
            this.chosenDrop = this.chosen.find('.chosen-drop').hide()
            this.chosenResults = this.chosen.find('.chosen-results')
            this.closeBtn = this.chosen.find('.close-chosen-drop')
            this.update(this.data)
            this.elem.after(this.chosen)
            this.initStyle()
            this.bindEvent()
            if(option.callback && _.isFunction(option.callback)) {
                option.callback.call(this)
            }
        }
        this.initStyle = function () {
            this.elem.hide()
            this.chosen.css({
                width: option.width || '100%',
            })
        }
        this.update = function (data) {
            if (option.disable_search_threshold && option.disable_search_threshold >= this.data.length) {
                this.chosen.addClass('chosen-container-single-nosearch')
            } else {
                this.chosen.removeClass('chosen-container-single-nosearch')
            }
            this.chosenSingleSpan.text((_.find(this.data, function (obj) {
                return obj.selected
            }) || {}).text)
            var palceholder = this.elem.attr('data-placeholder') ? this.elem.attr('data-placeholder') : ''
            var dropHtml = _.reduce(data, function (pre, cur, index) {
                if(!option.display_disabled_options && cur.disabled){
                    return pre
                }
                return pre + '<li class="active-result' + (cur.selected ? ' result-selected' : '') + (option.inherit_select_classes ? ' ' + cur.class : '') + '" data-option-array-index="' + cur.index + '">' + cur.text + '</li>'
            }, '')
            if(dropHtml === '') {
                dropHtml = '<li class="active-result">' + palceholder + '</li>'
            }
            this.chosenResults.html(dropHtml)
        }
        this.hideDrop = function () {
            this.chosenDrop.fadeOut(option.duration, function () {
                _this.body.css({
                    'overflow-y': '',
                    'height': ''
                })
            })
        }
        this.showDrop = function () {
            document.body.scrollTop = 1
            document.body.scrollTop = 0
            this.body.css({
                'overflow': 'hidden',
                'height': $(window).height()
            })
            this.chosenDrop.fadeIn(option.duration)
        }
        this.bindEvent  = function () {
            this.chosenSingle.bind('click', function () {
                _this.showDrop()
            })
            this.chosenSearch
                .bind('focus', function () {
                    if (window.team.isIOS()) {
                        _this.chosenDrop.css({
                            'height': _this.chosenDrop.height() - 284
                        })
                    }
                })
                .bind('blur', function () {
                    _this.chosenDrop.css({
                        'height': ''
                    })
                })
                .bind('keyup', function () {
                    var input = $(this).val()
                    var containInputData = _.filter(_this.data, function (obj) {
                        return obj.text.toLowerCase().indexOf(input.toLowerCase()) === 0
                    })
                    _this.update(containInputData)
                })
            this.chosenResults.delegate('li', 'click', function (e) {
                e.stopPropagation()
                var hasChanged = !$(this).hasClass('result-selected')
                var index = $(this).attr('data-option-array-index')
                $(this).addClass('result-selected').siblings().removeClass('result-selected')

                setTimeout(function () {
                    _this.hideDrop()
                    if(hasChanged) {
                        _this.elem.val(_this.data[index].value).trigger('chosen:updated').trigger('change')
                    }
                },100)
            })
            this.closeBtn.bind('click', function () {
                _this.hideDrop()
            })
            this.elem.bind('chosen:updated', function () {
                _this.data = _this.fetch()
                _this.update(_this.data)
            })
            this.elem.bind('chosen:open', function () {
                _this.showDrop()
            })
        }
        this.data = this.fetch()
        this.create()

    }
})(jQuery)