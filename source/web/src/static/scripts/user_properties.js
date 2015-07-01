$(function () {
    var $list = $('#list')
    var $placeholder = $('.emptyPlaceHolder')
    var $ownPlaceholder = $('#ownPlaceHolder')
    var $rentPlaceholder = $('#rentPlaceHolder')
    var isLoading = false
    var xhr

    var $headerButtons = $('.contentHeader .buttons')
    var $headerTabs = $('.tabs')

    //Init page with rent
    //TODO: do this for for production sync
    if (team.isProduction()) {

        // Display header buttons and tabs based on whether user have beta_renting role or not
        if (!_.isEmpty(window.user.role) && _.indexOf(window.user.role, 'beta_renting') !== -1) {
            if (team.isPhone()) {
                $headerTabs.show()
            } else {
                $headerButtons.show()
            }

            loadRentProperty()
        } else {
            $headerButtons.hide()
            $headerTabs.hide()
            switchTypeTab('own')
            loadOwnProperty()
        }

    } else {
        if (team.isPhone()) {
            $headerTabs.show()
        } else {
            $headerButtons.show()
        }
        loadRentProperty()
    }

    // Check url query from email
    if(team.getQuery('type') === 'rent_ticket' && team.getQuery('id')){

        $(document).on('rentListLoadedSuccessfully', function (e) {

            if(_.first(_.where(window.rentArray, {id: team.getQuery('id')}))){
                var cRent = _.first(_.where(window.rentArray, {id: team.getQuery('id')}))
                $('html, body').animate({
                    scrollTop: $('.rentCard[data-id=' + cRent.id + ']').offset().top - 100
                }, 500)

                if(team.getQuery('action') === 'refresh'  && cRent.status === 'to rent'){
                    $('.rentCard[data-id=' + cRent.id + ']').find('.actions #refresh').click()
                }else if(team.getQuery('action') === 'confirm_rent' && cRent.status === 'to rent'){
                    $('.rentCard[data-id=' + cRent.id + ']').find('.actions #editAction').click()
                }else{
                    window.alert(window.i18n('无法执行该操作，请检查您的房产状态后重试'))
                }
            }else{
                window.alert(window.i18n('您要找的房产不存在或者已被删除'))
            }

        })
    }

    $('body').dropload({ //下拉刷新
        domUp: {
            domClass: 'dropload-up',
            domRefresh: '<div class="dropload-refresh">↓ ' + i18n('下拉刷新') + '</div>',
            domUpdate: '<div class="dropload-update">↑ ' + i18n('松开刷新') + '</div>',
            domLoad: '<div class="dropload-load"><span class="loading"></span>' + i18n('加载中...') + '</div>'
        },
        loadUpFn: function (me) {
            if (isLoading) {
                return me.resetload();
            }
            loadProperty().done(function () {
                $('.dropload-load').html(i18n('加载成功'))
                setTimeout(function () {
                    me.resetload()
                }, 500)
            }).fail(function () {
                $('.dropload-load').html(i18n('加载失败'))
                setTimeout(function () {
                    me.resetload()
                }, 500)
            })
        },

    });
    function loadProperty() {
        var defer = $.Deferred()
        if ($('.buttons .button').hasClass('own')) {
            loadOwnProperty().then(function () {
                defer.resolve()
            }, function () {
                defer.reject()
            })
        } else {
            loadRentProperty().then(function () {
                defer.resolve()
            }, function () {
                defer.reject()
            })
        }
        return defer.promise()
    }

    function loadOwnProperty() {
        var defer = $.Deferred()
        if (xhr && xhr.readyState !== 4) {
            xhr.abort()
        }
        $placeholder.hide()
        $list.empty()
        $('#loadIndicator').show()

        var params = {
            'user_id': window.user.id,
            'status': 'bought',
            'per_page': -1
        }
        xhr = $.post('/api/1/intention_ticket/search', params)
            .success(function (data) {
                //Check if tab is still rent
                //TODO:Disable check for production sync
                //if ($('.buttons .own').hasClass('button')) {
                var val = data.val
                var array = val
                if (array && array.length > 0) {
                    _.each(array, function (ticket) {
                        var houseResult = _.template($('#houseCard_template').html())({ticket: ticket})
                        $list.append(houseResult)
                    })
                } else {
                    $ownPlaceholder.show()
                }
                //}
                defer.resolve()
            }).fail(function () {
                $ownPlaceholder.show()
                defer.reject()
            }).complete(function () {
                $('#loadIndicator').hide()
                isLoading = false
            })
        return defer.promise()
    }


    function loadRentProperty(rentStatus) {
        var defer = $.Deferred()
        if (xhr && xhr.readyState !== 4) {
            xhr.abort()
        }
        $placeholder.hide()
        $list.empty()
        $('#loadIndicator').show()
        isLoading = true

        var loadStatus = rentStatus || ['draft', 'to rent', 'rent']
        var params = {
            'user_id': window.user.id,
            'per_page': -1,
            'status': JSON.stringify(loadStatus)
        }
        xhr = $.post('/api/1/rent_ticket/search', params)
            .success(function (data) {
                var val = data.val
                //Check if tab is still rent
                if ($('.buttons .rent').hasClass('button')) {
                    if (val && val.length > 0) {
                        window.rentArray = val
                        _.each(val, function (rent) {
                            if (rent.property) {
                                var houseResult = _.template($('#my_rentCard_template').html())({rent: rent})
                                $list.append(houseResult)
                            }
                        })

                        if($list.length > 0){
                            bindRentItemWechatShareClick()
                            bindRentItemRefreshClick()
                            bindRentItemConfirmRentClick()
                            bindRentItemRemoveClick()
                            bindRentItemEditClick()
                        }else{
                            $rentPlaceholder.show()
                        }
                    } else {
                        $rentPlaceholder.show()
                    }
                }
                defer.resolve()

                // Trigger custom event when load successfully
                $(document).trigger({
                    type: 'rentListLoadedSuccessfully'
                })
            }).fail(function () {
                $rentPlaceholder.show()
                defer.reject()
            }).complete(function () {
                $('#loadIndicator').hide()
                isLoading = false
            })
        return defer.promise()
    }

    function switchTypeTab(state) {
        var originHash = location.hash.slice(1)
        var param = originHash.split('?')[1]
        $('.ui-tabs-nav li').removeClass('ui-tabs-selected')
        $('.ui-tabs-nav .' + state.replace('Only', '')).addClass('ui-tabs-selected')

        $('.buttons .button').removeClass('button').addClass('ghostButton')
        $('.buttons .' + state.replace('Only', '')).removeClass('ghostButton').addClass('button')
        location.hash = state + (param ? '?' + param : '')
    }

    $(window).on('hashchange', function () {
        var hash = location.hash.slice(1)
        var state = hash.split('?')[0]
        var extraParam = hash.split('?')[1]
        var rentStatus
        if(extraParam) {
            rentStatus = decodeURIComponent(extraParam.match(/status=(.+)/)[1]).split(',')
        }
        if (state === 'rent') {
            switchTypeTab(state)
            loadRentProperty(rentStatus)
        } else if (state === 'own') {
            switchTypeTab(state)
            loadOwnProperty()
        } else if (state === 'ownOnly') {
            $('.ui-tabs,.buttons').hide()
            switchTypeTab('ownOnly')
            loadOwnProperty()
        } else if (state === 'rentOnly') {
            $('.ui-tabs,.buttons').hide()
            switchTypeTab('rentOnly')
            loadRentProperty(rentStatus)
        }
    })
    $(window).trigger('hashchange')
    /*
     * User interaction on page
     * */
    $('button#showRentBtn').click(function () {
        switchTypeTab('rent')
        //loadRentProperty()
    })

    $('button#showOwnBtn').click(function () {
        switchTypeTab('own')
        //loadOwnProperty()
    })

    $('#showRentTab').click(function () {
        switchTypeTab('rent')
        //loadRentProperty()
    })

    $('#showOwnTab').click(function () {
        switchTypeTab('own')
        //loadOwnProperty()
    })


    /*
     * User interaction on rent list item
     * */

    function bindRentItemWechatShareClick() {
        $('.actions #wechatShare').click(function (e) {
            var ticketId = $(this).attr('data-id')

            if (window.bridge !== undefined) {
                window.bridge.callHandler('shareRentTicket', _.first(_.where(window.rentArray, {id: ticketId})));
            } else {
                $('#popupShareToWeChat')
                    .find('img').prop('src',
                        '/qrcode/generate?content=' + encodeURIComponent(location.origin + '/wechat-poster/' + ticketId)).end()
                    .modal()
            }

            //ga('send', 'event', 'property_detail', 'share', 'open-wechat-web')
        })
    }

    function bindRentItemRefreshClick() {
        $('.actions #refresh').click(function (e) {
            var ticketId = $(e.target).attr('data-id')
            if(!team.isToday(parseInt(_.first(_.where(window.rentArray, {id: ticketId})).last_modified_time))){
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
            }
        })
    }

    function bindRentItemConfirmRentClick() {
        $('.actions #editAction').click(function (e) {
            var ticketId = $(e.target).attr('data-id')

            if ($(e.target).attr('data-type') === 'to rent') {
                if (window.confirm(window.i18n('确定\"'+_.first(_.where(window.rentArray, {id: ticketId})).title + '\"已经成功出租了吗？确定将不再接收系统刷新提醒')) === true) {
                    var params = {
                        'status': 'rent'
                    }
                    $.betterPost('/api/1/rent_ticket/' + ticketId + '/edit', params)
                        .done(function (data) {
                            window.rentArray[_.indexOf(window.rentArray,_.first(_.where(window.rentArray, {id: ticketId})))] = data
                            $(e.target).text(window.i18n('重新发布'))
                            $(e.target).attr('data-type','rent')
                            $(e.target).parent().parent().parent().find('.imgAction_wrapper .date').text(window.i18n('今天更新过'))
                            $(e.target).parent().parent().parent().parent().parent().find('.status').text(window.i18n('已出租'))

                            //Remove refresh from rent status
                            $(e.target).parent().prev().remove()

                            if (window.bridge !== undefined) {
                                window.bridge.callHandler('notifyRentTicketDidBeRented', _.first(_.where(window.rentArray, {id: ticketId})))
                            }
                        })
                        .fail(function (ret) {
                            window.alert(window.i18n('无法更新，请检查后重试'))
                        })
                }
            } else {
                //Bind to it's edit button
                if (window.bridge !== undefined) {
                    window.bridge.callHandler('editRentTicket', _.first(_.where(window.rentArray, {id: ticketId})))
                } else {
                    location.href = '/property-to-rent/' + ticketId + '/edit'
                }
            }
        })
    }

    function bindRentItemEditClick() {
        $('.imgAction_wrapper #edit').on('click', function (e) {
            var ticketId = $(e.target).attr('data-id')

            if (window.bridge !== undefined) {
                window.bridge.callHandler('editRentTicket', _.first(_.where(window.rentArray, {id: ticketId})))
            } else {
                location.href = '/property-to-rent/' + ticketId + '/edit'
            }
        })
    }

    function bindRentItemRemoveClick() {
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
                        window.alert(window.i18n('无法删除，请检查后重试'))
                    })
            }
        })
    }

    /*
     * User interaction on property list item
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
