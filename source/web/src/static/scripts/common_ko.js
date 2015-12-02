
(function (ko, module) {
    ko.bindingHandlers.chosen = {
        init: function(element, valueAccessor, allBindings)  {
            ko.bindingHandlers.options.init.call(this, element)
            $(element)[window.team.isPhone() ? 'chosenPhone' : 'chosen']({disable_search_threshold: 10, inherit_select_classes: true, disable_search: true, width: $(element).css('width')})
            if(allBindings().value) {
                allBindings().value.subscribe(function (val) {
                    if(!_.isObject(val)) {
                        setTimeout(function () {
                            $(element).val(val)
                            $(element).trigger('chosen:updated')
                        }, 100)
                    } else {
                        setTimeout(function () {
                            $(element).trigger('chosen:updated')
                        }, 100)
                    }

                })
            }
        },
        update: function(element, valueAccessor, allBindings) {
            ko.bindingHandlers.options.update.call(this, element, valueAccessor, allBindings)
            //如果直接触发chosen:updated，在更改time后再更改mode，chosen的更新有问题
            setTimeout(function () {
                $(element).trigger('chosen:updated')
            }, 50)
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
})(window.ko, window.currantModule = window.currantModule || {})