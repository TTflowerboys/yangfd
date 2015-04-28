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
            'user_id': window.user.id,
            'status': 'bought',
            'per_page':-1
        }
        $.betterPost('/api/1/intention_ticket/search', params)
            .done(function(val){
                //Check if tab is still rent
                if($('.buttons .own').hasClass('button')){
                    var array = val
                    if(array && array.length > 0){
                        _.each(array, function (ticket) {
                            var houseResult = _.template($('#houseCard_template').html())({ticket: ticket})
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
            'per_page':-1
        }
        $.betterPost('/api/1/rent_ticket/search', params)
            .done(function(val){
                //Check if tab is still rent
                if($('.buttons .rent').hasClass('button')){
                    var array = val
                    if(array && array.length > 0){
                        _.each(array, function (rent) {
                            var houseResult = _.template($('#my_rentCard_template').html())({rent: rent})
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
    * User interaction
    * */
    $('button#showRentBtn').click(function () {
        switchTypeTab('rent')
        loadRentProperty()
    })

    $('button#showOwnBtn').click(function () {
        switchTypeTab('own')
        loadOwnProperty()
    })

    $('button#showRentTab').click(function () {
        switchTypeTab('rent')
        loadRentProperty()
    })

    $('button#showOwnTab').click(function () {
        switchTypeTab('own')
        loadOwnProperty()
    })

    $('#list').on('click', '.houseCard #removeProperty', function (event) {
        if (window.confirm(window.i18n('确定删除该房产吗？')) === true) {
            var ticketId = $(event.target).attr('data-id')
            $.betterPost('/api/1/intention_ticket/' + ticketId + '/remove')
                .done(function (data) {
                    location.reload()
                })
                .fail(function (ret) {
                    window.alert(window.i18n('移除失败'))
                })
        }

    })
    $('#list').on('click', '.houseCard_phone #removeProperty', function (event) {
        if (window.confirm(window.i18n('确定删除该房产吗？')) === true) {
            var ticketId = $(event.target).attr('data-id')
            $.betterPost('/api/1/intention_ticket/' + ticketId + '/remove')
                .done(function (data) {
                    location.reload()
                })
                .fail(function (ret) {
                    window.alert(window.i18n('移除失败'))
                })
        }

    })

})
