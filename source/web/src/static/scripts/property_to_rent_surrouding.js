(function (ko) {
    ko.bindingHandlers.chosen = {
        init: function(element)  {
            ko.bindingHandlers.options.init.call(this, element)
            $(element)[window.team.isPhone() ? 'chosenPhone' : 'chosen']({disable_search_threshold: 10, inherit_select_classes: true, disable_search: true, width: $(element).outerWidth() + 'px'})
        },
        update: function(element, valueAccessor, allBindings) {
            ko.bindingHandlers.options.update.call(this, element, valueAccessor, allBindings)
            $(element).trigger('chosen:updated')
        }
    }

    ko.components.register('show-travel-time', {
        viewModel: function(params) {
            this.travel = ko.observableArray(params.travel.map(function (val) {
                val.formatTime = val.value + {minute: 'min', hour: 'hour', second: 'sec'}[val.unit]
                return val
            }))
            this.selectedType = ko.observable(this.travel()[0])
        },
        template: { element: 'show-travel-time' }
    })

    function SurroudingViewModel() {
        this.surrouding = ko.observableArray(JSON.parse($('#surroundingData').text()))
    }
    ko.applyBindings(SurroudingViewModel)
})(window.ko)