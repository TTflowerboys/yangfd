(function (ko, module) {
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

})(window.ko, window.currantModule = window.currantModule || {})