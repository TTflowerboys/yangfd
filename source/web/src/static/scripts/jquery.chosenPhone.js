(function($) {
    $.fn.chosenPhone = function (option) {
        return this.each(function() {
            var elem, data;
            elem = $(this)
            data = elem.data('chosen')
            if(!(data instanceof Chosen) && elem.css('display') !== 'none') {
                elem.data('chosen', new Chosen(this, option))
            }
        })
    }
    function Chosen(elem, option) {
        this.elem = $(elem)
        this.fetch = function () {
            return _.map(this.elem.find('option'), function(option, index){
                return {
                    index: index,
                    value: $(option).attr('value'),
                    text: $(option).text(),
                    selected: $(option).is(':selected')
                }
            })
        }
        this.create = function () {
            this.chosen = $('<div class="chosen-container chosen-container-single' + ((option.disable_search_threshold && option.disable_search_threshold >= this.data.length) ? ' chosen-container-single-nosearch' : '') + '"><a class="chosen-single" tabindex="-1"><span></span><div><b></b></div></a><div class="chosen-drop"><div class="chosen-search"><input type="text" autocomplete="off" spellcheck="false" autofocus><i class="icon-search"></i></div><ul class="chosen-results"></ul></div></div>')
            this.chosenSingle = this.chosen.find('.chosen-single')
            this.chosenSingleSpan = this.chosenSingle.find('span')
            this.chosenSearch = this.chosen.find('.chosen-search input')
            this.chosenDrop = this.chosen.find('.chosen-drop').hide()
            this.chosenResults = this.chosen.find('.chosen-results')
            this.update(this.data)
            this.elem.after(this.chosen)
            this.initStyle()
            this.bindEvent()
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
            this.chosenSingleSpan.text(_.find(this.data, function (obj) {
                return obj.selected
            }).text)
            this.chosenResults.html(_.reduce(data, function (pre, cur, index) {
                return pre + '<li class="active-result' + (cur.selected ? ' result-selected' : '') + '" data-option-array-index="' + cur.index + '">' + cur.text + '</li>'
            }, ''))
        }
        this.hideDrop = function () {
            this.chosenDrop.hide()
        }
        this.bindEvent  = function () {
            var _this = this
            this.chosenSingle.bind('click', function () {
                _this.chosenDrop.toggle()
            })
            this.chosenSearch.bind('keyup', function () {
                var input = $(this).val()
                var containInputData = _.filter(_this.data, function (obj) {
                    return obj.text.toLowerCase().indexOf(input.toLowerCase()) === 0
                })
                _this.update(containInputData)
            })
            this.chosenResults.delegate('li', 'click', function () {
                var hasChanged = !$(this).hasClass('result-selected')
                var index = $(this).attr('data-option-array-index')
                $(this).addClass('result-selected').siblings().removeClass('result-selected')
                if(hasChanged) {
                    _this.elem.val(_this.data[index].value).trigger('chosen:updated').trigger('change')
                }
                _this.hideDrop()
            })
            this.elem.bind('chosen:updated', function () {
                _this.data = _this.fetch()
                _this.update(_this.data)
            })
        }
        this.data = this.fetch()
        this.create()

    }
})(jQuery)