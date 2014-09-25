/* Created by frank on 14-9-25. */
(function ($) {
    $.fn.tabs = function () {
        this.each(function () {
            var $tabs = $(this)
            $tabs.on('click.tabs', '[data-tab]', function (e) {
                var $target = $(e.currentTarget)
                var tabName = $target.data('tab')
                $target.closest('[data-tabs]').find('[data-tab-name=' + tabName + ']').eq(0).show()
                    .siblings().hide()
            })
        })
    }
})(jQuery)
