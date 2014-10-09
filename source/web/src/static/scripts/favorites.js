
$('.list').on('click', '.houseCard #cancelFavorite', function (event) {
    var favoriteId = $(event.currentTarget).attr('data-id')
    $.betterPost('/api/1/user/favorite/' + favoriteId + '/remove')
        .done(function (data) {
            $(event.currentTarget).hide()
            var $undoButton = $('#undoFavorite[data-id=' + favoriteId + ']')
            $undoButton.parent().show()
        })
        .fail (function (ret) {
            window.alert(window.i18n('取消收藏失败'))
        })
})


$('.list').on('click', '.houseCard #undoFavorite', function (event) {
    var propertyId = $(event.currentTarget).attr('data-property-id')
    $.betterPost('/api/1/user/favorite/add', {'property_id':propertyId})
        .done(function (data) {
            $(event.currentTarget).parent().hide()
            location.reload()
        })
        .fail (function (ret) {
            window.alert(window.i18n('撤销失败'))
        })
})

