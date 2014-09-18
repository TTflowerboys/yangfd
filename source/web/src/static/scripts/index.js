$('#announcement').on('click', 'ul>li>.close', function (event) {
    var $item = $(event.target.parentNode)
    $item.remove()
    var $container =$(event.delegateTarget)
    if ($container.find('ul>li').length === 0) {
        $container.hide()
    }
})
