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
                            var houseResult = _.template($('#my_rentCard_template').html())({rent: rent})
                            $list.append(houseResult)
                        })

                        bindRentItemWechatShareClick()
                        bindRentItemRefreshClick()
                        bindRentItemConfirmRentClick()
                        bindRentItemRemoveClick()
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
     * User interaction on rent list item
     * */

    function bindRentItemWechatShareClick(){
        $('.actions #wechatShare').click(function (e) {
            var ticketId = $(this).attr('data-id')
            $('#popupShareToWeChat')
                .find('img').prop('src', '/qrcode/generate?content=' + encodeURIComponent(location.origin + '/wechat-poster/' + ticketId)).end()
                .modal()
            //ga('send', 'event', 'property_detail', 'share', 'open-wechat-web')
        })
    }

    function bindRentItemRefreshClick(){
        $('.actions #refresh').click(function (e) {
            var ticketId = $(e.target).attr('data-id')
            var params = {
                'status': 'to rent'
            }
            $.betterPost('/api/1/rent_ticket/' + ticketId + '/edit', params)
                .done(function (data) {
                    $(e.target).unbind('click')
                    $(e.target).text(window.i18n('刚刚刷新过'))
                    $(e.target).parent().parent().parent().find('.imgAction_wrapper .date').text(window.i18n('刚刚刷新过'))
                    $(e.target).addClass('disabled')
                })
                .fail(function (ret) {
                    window.alert(window.i18n('刷新失败'))
                })
        })
    }

    function bindRentItemConfirmRentClick(){
            $('.actions #confirmRent').click(function (e) {
                if (window.confirm(window.i18n('确定已经成功出租了吗？确定将不再接收系统刷新提醒')) === true) {
                    var ticketId = $(e.target).attr('data-id')
                    var params = {
                        'status': 'rent'
                    }
                    $.betterPost('/api/1/rent_ticket/' + ticketId + '/edit', params)
                        .done(function (data) {
                            location.reload()
                        })
                        .fail(function (ret) {
                            window.alert(window.i18n('失败'))
                        })
                }
            })
    }

    function bindRentItemRemoveClick(){
        $('.imgAction_wrapper #remove').on('click', function (e) {
            if (window.confirm(window.i18n('确定删除该出租房吗？注意：此操作不可逆')) === true) {
                var ticketId = $(e.target).attr('data-id')
                var params = {
                    'status': 'deleted'
                }
                $.betterPost('/api/1/rent_ticket/' + ticketId + '/edit', params)
                    .done(function (data) {
                        location.reload()
                    })
                    .fail(function (ret) {
                        window.alert(window.i18n('失败'))
                    })
            }
        })
    }

    /*
     * User interaction on rent list item
     * */
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
