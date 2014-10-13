
$(function () {

    var favoriteList = JSON.parse($('#favoriteData').text())

    _.each(favoriteList, function (fav) {
        var houseResult = _.template($('#houseCard_template').html())({fav: fav})
        $('#list').append(houseResult)
    })
    
})

$('.list').on('click', '.houseCard #cancelFavorite', function (event) {
    var favoriteId = $(event.currentTarget).attr('data-id')
    $.betterPost('/api/1/user/favorite/' + favoriteId + '/remove')
        .done(function (data) {
            $(event.currentTarget).hide()
            var $undoButton = $(event.currentTarget).parent().parent().find('#undoFavorite[data-id=' + favoriteId + ']')
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
            var favId = data
            $.betterPost('/api/1/user/favorite/' + favId)
                .done(function (data) {
                    var fav = data
                    var houseResult = _.template($('#houseCard_template').html())({fav: fav})
                    $('.houseCard[data-property-id=' + propertyId + ']').replaceWith(houseResult)
                })
		.fail(function (ret) {
                    window.alert(window.i18n('撤销失败'))
		})
        })
        .fail (function (ret) {
            window.alert(window.i18n('撤销失败'))
        })
})

