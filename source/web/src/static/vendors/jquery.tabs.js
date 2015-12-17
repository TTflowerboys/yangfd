/* Created by frank on 14-9-25. */
(function ($) {
    var defatuls = {
        trigger: 'click', // or hover
        autoSelectFirst: true,
        className: 'selectedTab'
    }
    $.fn.tabs = function (_options) {
        var options = $.extend({}, defatuls, _options)
        if (options.trigger === 'hover') {
            options.trigger = 'mouseover'
        }

        this.each(function () {
            var $tabContainer = $(this)
            $tabContainer
                .on(options.trigger + '.tabs', '[data-tab]', function (e) {
                    var $target = $(e.currentTarget)
                    $target.addClass(options.className).siblings().removeClass(options.className)
                    var tabName = $target.data('tab')
                    var $tabContents = $tabContainer.find('[data-tab-name=' + tabName + ']')
                    $tabContents.map(function (index, ele) {
                        $(ele).addClass(options.className).show()
                        $(ele).siblings().removeClass(options.className).hide()
                        $tabContainer.trigger('openTab', [e.currentTarget, tabName])
                    })
                })
            if (options.autoSelectFirst && $tabContainer.find('[data-tab-name]' + '.' + options.className).length === 0) {
                var $firstTab = $tabContainer.find('[data-tab]').eq(0)
                $firstTab.addClass(options.className).show()

                var tabName = $firstTab.attr('data-tab')
                var $tabContents = $tabContainer.find('[data-tab-name=' + tabName + ']')
                $tabContents.map(function (index, ele) {
                    $(ele).addClass(options.className).show()
                })
            }
        })
        this.switch = function (tabName) {
            $(this).find('[data-tab=' + tabName + ']').trigger(options.trigger)
        }
        return this
    }
})(jQuery)
