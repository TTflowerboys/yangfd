$(function () {

    var favoriteList = JSON.parse($('#favoriteData').text())

    _.each(favoriteList, function (fav) {
        var houseResult = _.template($('#houseCard_template').html())({fav: fav})
        $('#list').append(houseResult)
    })

})

$('.list').on('click', '.houseCard #cancelFavorite', function (event) {
    ga('send', 'event', 'user-fav', 'click', 'cancel-fav')

    var favoriteId = $(event.currentTarget).attr('data-id')
    $.betterPost('/api/1/user/favorite/' + favoriteId + '/remove')
        .done(function (data) {
            $(event.currentTarget).hide()
            var $undoButton = $(event.currentTarget).parents('.houseCard').find('#undoFavorite[data-id=' + favoriteId + ']')
            $undoButton.parent().show()

            ga('send', 'event', 'user-fav', 'click', 'cancel-fav-success')
        })
        .fail(function (ret) {
            window.alert(window.i18n('取消收藏失败'))
            ga('send', 'event', 'user-fav', 'click', 'cancel-fav-failed')
        })
})


$('.list').on('click', '.houseCard #undoFavorite', function (event) {
    ga('send', 'event', 'user-fav', 'click', 'undo-cancel-fav')
    var propertyId = $(event.currentTarget).attr('data-property-id')
    $.betterPost('/api/1/user/favorite/add', {'property_id': propertyId})
        .done(function (data) {
            var favId = data
            $.betterPost('/api/1/user/favorite/' + favId)
                .done(function (data) {
                    var fav = data
                    var houseResult = _.template($('#houseCard_template').html())({fav: fav})
                    $('.houseCard_phone[data-property-id=' + propertyId + ']').remove()
                    $('.houseCard[data-property-id=' + propertyId + ']').replaceWith(houseResult)
                })
            ga('send', 'event', 'user-fav', 'click', 'undo-cancel-fav-success')
        })
        .fail(function (ret) {
            window.alert(window.i18n('撤销失败'))
            ga('send', 'event', 'user-fav', 'click', 'undo-cancel-fav-failed')
        })
})

$('.list').on('click', '.houseCard_phone #cancelFavorite', function (event) {
    ga('send', 'event', 'user-fav', 'click', 'cancel-fav')

    var favoriteId = $(event.currentTarget).attr('data-id')
    $.betterPost('/api/1/user/favorite/' + favoriteId + '/remove')
        .done(function (data) {
            var $undoButton = $(event.currentTarget).parents('.houseCard_phone').find('#undoFavorite[data-id=' + favoriteId + ']')
            $undoButton.parent().show()

            ga('send', 'event', 'user-fav', 'click', 'cancel-fav-success')
        })
        .fail(function (ret) {
            window.alert(window.i18n('取消收藏失败'))
            ga('send', 'event', 'user-fav', 'click', 'cancel-fav-failed')
        })
})


$('.list').on('click', '.houseCard_phone #undoFavorite', function (event) {
    ga('send', 'event', 'user-fav', 'click', 'undo-cancel-fav')
    var propertyId = $(event.currentTarget).attr('data-property-id')
    $.betterPost('/api/1/user/favorite/add', {'property_id': propertyId})
        .done(function (data) {
            var favId = data
            $.betterPost('/api/1/user/favorite/' + favId)
                .done(function (data) {
                    var fav = data
                    var houseResult = _.template($('#houseCard_template').html())({fav: fav})
                    $('.houseCard[data-property-id=' + propertyId + ']').remove()
                    $('.houseCard_phone[data-property-id=' + propertyId + ']').replaceWith(houseResult)
                })
            ga('send', 'event', 'user-fav', 'click', 'undo-cancel-fav-success')
        })
        .fail(function (ret) {
            window.alert(window.i18n('撤销失败'))
            ga('send', 'event', 'user-fav', 'click', 'undo-cancel-fav-failed')
        })
})
