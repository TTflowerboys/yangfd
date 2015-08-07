(function () {
    var $floatBar = $('#floatBar')
    function setPosition() {
        if($(window).width() < 1380) {
            $floatBar.css({
                right: '15px',
                marginRight: '0px'
            })
        } else {
            $floatBar.attr('style', '')
        }
    }
    setPosition()
    $(window).resize(setPosition)
})()