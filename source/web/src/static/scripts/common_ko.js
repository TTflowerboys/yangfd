
(function (ko, module) {
    ko.bindingHandlers.chosen = {
        init: function(element, valueAccessor, allBindings)  {
            ko.bindingHandlers.options.init.call(this, element)
            $(element)[window.team.isPhone() ? 'chosenPhone' : 'chosen']({disable_search_threshold: 10, inherit_select_classes: true, disable_search: true, width: $(element).css('width')})
            if(allBindings().value && _.isFunction(allBindings().value.subscribe)) {
                allBindings().value.subscribe(function (val) {
                    if(!_.isObject(val)) {
                        $(element).val(val)
                    }
                    setTimeout(function () {
                        $(element).trigger('chosen:updated')
                    }, 100)
                })
            }
        },
        update: function(element, valueAccessor, allBindings) {
            ko.bindingHandlers.options.update.call(this, element, valueAccessor, allBindings)
            //如果直接触发chosen:updated，在更改time后再更改mode，chosen的更新有问题
            setTimeout(function () {
                $(element).trigger('chosen:updated')
            }, 100)
        }
    }

    ko.bindingHandlers.initializeValue = {
        init: function(element, valueAccessor) {
            if (element.getAttribute('value')) {
                valueAccessor()(element.getAttribute('value'));
            } else if (element.tagName === 'SELECT') {
                valueAccessor()(element.options[element.selectedIndex].value);
            }
        },
        update: function(element, valueAccessor) {
            var value = valueAccessor();
            element.setAttribute('value', ko.utils.unwrapObservable(value));
        }
    }

    ko.components.register('tags', {
        viewModel: function(params) {
            this.list = ko.observableArray(params.list())
            this.key = params.key
            this.choose = function (data, event) {
                this[params.key](data.id)
                $(event.target).parents('tags').trigger('change')
            }
        },
        template: '<div data-bind="foreach: list"><span class="property_type" data-bind="text: value, click: $parent.choose.bind($root), css: {selected: id === $root[$parent.key]()}"></span></div>'
    })

    ko.bindingHandlers.dateRangePicker = {
        init: function(element, valueAccessor)  {
            $(element).find('input').dateRangePicker({
                autoClose: true,
                singleDate: true,
                showShortcuts: false,
                lookBehind: false,
                getValue: function() {
                    return valueAccessor()() ? valueAccessor()() : ''
                }
            })
                .bind('datepicker-change', function (event, obj) {
                    valueAccessor()($.format.date(new Date(obj.date1), 'yyyy-MM-dd'))
                    $(event.target).trigger('change')
                })
                .dateRangePickerCustom($(element).find('input'))
        }
    }

    ko.components.register('tips', {
        viewModel: function(params) {
            this.tips = ko.observable(params.tips)
            this.visible = ko.observable(false)
            this.showTips = function (data, event) {
                if(!window.team.isPhone()) {
                    this.visible(true)
                }
            }
            this.hideTips = function () {
                if(!window.team.isPhone()) {
                    this.visible(false)
                }
            }
            this.toggleTips = function () {
                this.visible(!this.visible())
            }
        },
        template: '<div class="tipsWrap" data-bind="event: {mouseover: showTips, mouseout: hideTips, click: toggleTips}"><i class="questionMark">?</i><div class="tips" data-bind="text: tips, visible: visible"></div></div>'
    })
})(window.ko, window.currantModule = window.currantModule || {})