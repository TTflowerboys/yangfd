(function (ko, module) {

    ko.components.register('filter-tags', {
        viewModel: function (params) {
            this.parentVM = params.vm
            if(!this.parentVM[params.key]) {
                this.parentVM[params.key] = ko.observable()
            }
            this.list = ko.observableArray(_.isFunction(params.list) ? params.list() : params.list)
            if(params.unLimited) {
                this.list.unshift({
                    id: undefined,
                    value: i18n('不限')
                })
            }
            this.key = params.key

            this.choose = function (data, event) {
                if (this.parentVM[params.key]() === data.id) {
                    this.parentVM[params.key]('')
                } else {
                    this.parentVM[params.key](data.id)
                }
                this.initAutoSelectFirstItem()
                /*if (params.gaConfig) {
                    ga('send', 'event', params.gaConfig.ec, params.gaConfig.ea, params.gaConfig.el, data[params.gaConfig.ev])
                }*/
                if(event) {
                    setTimeout(function () {
                        $(event.target).parents('filter-tags').trigger('change')
                    })
                }
            }

            this.initAutoSelectFirstItem = function () {
                if(params.autoSelectFirstItem && this.parentVM[this.key]() === '') {
                    this.choose.call(this, this.list()[0])
                }
            }
            this.initAutoSelectFirstItem()
            return this
        },
        template: '<div data-bind="foreach: list"><div class="toggleTag noBorder" data-bind="text: value, click: $parent.choose.bind($parent), css: {selected: id === $parent.parentVM[$parent.key]()}"></div></div>'
    })


    ko.bindingHandlers.fastChosen = {
        init: function(element, valueAccessor, allBindings)  {
            $(element)[window.team.isPhone() ? 'chosenPhone' : 'chosen']({disable_search_threshold: 10, inherit_select_classes: true, disable_search: true, width: '100%'})
            //ko.bindingHandlers.value.init.apply(this, arguments)
        },
        update: function(element, valueAccessor, allBindings) {
            if(typeof valueAccessor()() === 'string' && valueAccessor()().length) {
                $(element).trigger('chosen:updated')
            }
        }
    }

    ko.bindingHandlers.changeText = {
        init: function(element, valueAccessor, allBindings)  {
            $(element).on('change', function () {
                var originObj = _.extend(valueAccessor().obj())
                if($(element).is('select')) {
                    originObj[valueAccessor().prop] = $(this).find('option:selected').text()
                } else if($(element).is('input')) {
                    originObj[valueAccessor().prop] = $(this).val()
                } else if($(element).is('filter-tags')) {
                    originObj[valueAccessor().prop] = $(this).find('.toggleTag.selected').text()
                }
                ga('send', 'event', 'rent_list', 'change', valueAccessor().prop, originObj[valueAccessor().prop])
                valueAccessor().obj(originObj)
            })
        },
    }

})(window.ko, window.currantModule = window.currantModule || {})
