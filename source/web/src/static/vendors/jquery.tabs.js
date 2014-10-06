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
                    $tabContainer.find('[data-tab-name=' + tabName + ']').eq(0).show().addClass(options.className)
                        .siblings().removeClass(options.className).hide()
                    $tabContainer.trigger('openTab', e.currentTarget)
                })
            if (options.autoSelectFirst) {
                $tabContainer.find('[data-tab]').eq(0).addClass(options.className).show()
                $tabContainer.find('[data-tab-name]').eq(0).addClass(options.className).show()
                console.log($tabContainer.find('[data-tab-name]').eq(0))
            }
        })
        return this
    }
})(jQuery)
