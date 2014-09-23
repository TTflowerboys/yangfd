/* Created by frank on 14-9-23. */
(function () {
    resizeMain()
    $(window).on('resize', resizeMain)
    function resizeMain() {
        var $main = $('#main')
        var siblingsHeight = 0
        $main.siblings().each(function (index, dom) {
            siblingsHeight += $(dom).height()
        })
        $main.css({minHeight: $(window).height() - siblingsHeight})
    }
})()
