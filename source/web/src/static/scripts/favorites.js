
$('.list').on('click', '.houseCard #cancelFavorite', function (event) {
    var favoriteId = $(event.target).attr('data-id')
    $.post('/api/1/user/favorite/' + favoriteId + '/remove')
        .done(function (data) {
            location.reload()
        })
        .fail (function (ret) {
            window.alert(window.i18n('取消收藏失败'))
        })
})
