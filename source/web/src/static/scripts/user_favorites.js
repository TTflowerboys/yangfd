$(function () {

    var $list = $('#list')
    var $placeholder = $('.emptyPlaceHolder')
    var $ownPlaceholder = $('#ownPlaceHolder')
    var $rentPlaceholder = $('#rentPlaceHolder')
    var isLoading = false

    //Init page with rent
    loadRentProperty()

    function loadOwnProperty() {
        $placeholder.hide()
        $list.empty()
        $('#loadIndicator').show()

        var params = {
            'per_page':-1
        }
        $.betterPost('/api/1/user/admin/' + window.user.id + '/favorite', params)
            .done(function(val){
                //Check if tab is still rent
                if($('.buttons .own').hasClass('button')){
                    var array = val
                    if(array && array.length > 0){
                        _.each(array, function (fav) {
                            var houseResult = _.template($('#houseCard_template').html())({fav: fav})
                            $list.append(houseResult)
                        })
                    }else{
                        $ownPlaceholder.show()
                    }
                }
            }).fail(function(){
                $ownPlaceholder.show()
            }).always(function () {
                $('#loadIndicator').hide()
                isLoading = false
            })
    }


    function loadRentProperty() {
        $placeholder.hide()
        $list.empty()
        $('#loadIndicator').show()
        isLoading = true

        var params = {
            //'user_id': window.user.id,
            'per_page':-1,
            'status':['draft','to rent','rent']
        }
        $.betterPost('/api/1/rent_ticket/search', params)
            .done(function(val){
                //Check if tab is still rent
                if($('.buttons .rent').hasClass('button')){
                    var array = val
                    if(array && array.length > 0){
                        _.each(array, function (rent) {
                            var houseResult = _.template($('#fav_rentCard_template').html())({rent: rent})
                            $list.append(houseResult)
                        })

                    }else{
                        $rentPlaceholder.show()
                    }
                }
            }).fail(function(){
                $rentPlaceholder.show()
            }).always(function () {
                $('#loadIndicator').hide()
                isLoading = false
            })
    }

    function switchTypeTab(state) {
        $('.ui-tabs-nav li').removeClass('ui-tabs-selected')
        $('.ui-tabs-nav .'+state).addClass('ui-tabs-selected')

        $('.buttons .button').removeClass('button').addClass('ghostButton')
        $('.buttons .' + state).removeClass('ghostButton').addClass('button')
    }

    /*
     * User interaction on page
     * */
    $('button#showRentBtn').click(function () {
        switchTypeTab('rent')
        loadRentProperty()
    })

    $('button#showOwnBtn').click(function () {
        switchTypeTab('own')
        loadOwnProperty()
    })

    $('#showRentTab').click(function () {
        switchTypeTab('rent')
        loadRentProperty()
    })

    $('#showOwnTab').click(function () {
        switchTypeTab('own')
        loadOwnProperty()
    })

    /*
     * User interaction on PC web list item
     * */
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
        $.betterPost('/api/1/user/favorite/add', {'property_id': propertyId, 'type':'property'})
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

    /*
     * User interaction on mobile web list item
     * */
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
        $.betterPost('/api/1/user/favorite/add', {'property_id': propertyId, 'type':'property'})
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
})


