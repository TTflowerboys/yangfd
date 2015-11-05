(function (ko) {
    ko.bindingHandlers.chosen = {
        init: function(element)  {
            ko.bindingHandlers.options.init.call(this, element)
            $(element)[window.team.isPhone() ? 'chosenPhone' : 'chosen']({disable_search_threshold: 10, inherit_select_classes: true, disable_search: true, width: $(element).outerWidth() + 'px'})
        },
        update: function(element, valueAccessor, allBindings) {
            ko.bindingHandlers.options.update.call(this, element, valueAccessor, allBindings)
            //如果直接触发chosen:updated，在更改time后再更改mode，chosen的更新有问题
            setTimeout(function () {
                $(element).trigger('chosen:updated')
            }, 100)
        }
    }

    ko.components.register('show-travel-time', {
        viewModel: function(params) {
            this.travel = ko.observableArray(params.travel.map(function (val) {
                val.formatTime = val.time.value + {minute: 'min', hour: 'hour', second: 'sec'}[val.time.unit]
                return val
            }))
            this.selectedType = ko.observable(_.find(this.travel(), {default: true}))
        },
        template: { element: 'show-travel-time' }
    })

    function SurroudingViewModel() {
        this.surrouding = ko.observableArray(_.map(JSON.parse($('#featuredFacilityData').text()), function (item) {
            //todo 目前featured_facility中的学校的数据没有展开，所以加上这一段来mock展开后的数据
            if (typeof item[item.type.slug] === 'string' || typeof item[item.type.slug] === 'undefined') {
                item[item.type.slug] = {
                    id: item[item.type.slug],
                    name: 'Mock Data'
                }
            }

            item.id = item[item.type.slug].id
            item.name = item[item.type.slug].name

            return item
        }))
    }
    ko.applyBindings(SurroudingViewModel)
})(window.ko)