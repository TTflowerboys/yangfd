$(function () {
    var $list = $('#list')
    var $placeholder = $('.emptyPlaceHolder')
    var $ownPlaceholder = $('#ownPlaceHolder')
    var $rentPlaceholder = $('#rentPlaceHolder')
    var $contactPlaceholder = $('#rentPlaceHolder')
    var isLoading = false
    var xhr
    var ownPropertyArray

    var $headerButtons = $('.contentHeader .buttons')
    var $headerTabs = $('.tabs')

    //Init page with rent
    if (team.isPhone()) {
        $headerTabs.show()
    } else {
        $headerButtons.show()
    }
    loadRentProperty()

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
        domDown: {}

    });
    function loadProperty() {
        var defer = $.Deferred()
        if ($('.buttons .button').hasClass('own')) {
            loadOwnProperty().then(function () {
                defer.resolve()
            }, function () {
                defer.reject()
            })
        } else if($('.buttons .button').hasClass('rent')) {
            loadRentProperty().then(function () {
                defer.resolve()
            }, function () {
                defer.reject()
            })
        } else if($('.buttons .button').hasClass('contact')) {
            loadContactProperty().then(function () {
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
                ownPropertyArray = val
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

    function loadContactProperty() {
        var defer = $.Deferred()
        if (xhr && xhr.readyState !== 4) {
            xhr.abort()
        }
        $placeholder.hide()
        $list.empty()
        $('#loadIndicator').show()
        isLoading = true

        var params = {
            'per_page': -1,
        }
        xhr = $.post('/api/1/order/search_view_rent_ticket_contact_info', params)
            .success(function (data) {
                if (data.val && data.val.length > 0) {
                    _.each(data.val, function (obj) {
                        if (obj.ticket) {
                            var houseResult = _.template($('#my_contactCard_template').html())({rent: obj.ticket})
                            $list.append(houseResult)
                        }
                    })
                    if($list.length === 0){
                        $contactPlaceholder.show()
                    } else {
                        bindGetHostContactClick()
                    }
                } else {
                    $contactPlaceholder.show()
                }
                defer.resolve()
            }).fail(function () {
                $contactPlaceholder.show()
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
        switch(state) {
            case 'rent':
                switchTypeTab(state)
                loadRentProperty(rentStatus)
                break
            case 'rentOnly':
                $('.ui-tabs,.buttons').hide()
                switchTypeTab('rentOnly')
                loadRentProperty(rentStatus)
                break
            case 'own':
                switchTypeTab(state)
                loadOwnProperty()
                break
            case 'ownOnly':
                $('.ui-tabs,.buttons').hide()
                switchTypeTab('ownOnly')
                loadOwnProperty()
                break
            case 'contact':
                switchTypeTab(state)
                loadContactProperty()
                break
            case 'contactOnly':
                $('.ui-tabs,.buttons').hide()
                switchTypeTab(state)
                loadContactProperty()
                break
        }

    })
    $(window).trigger('hashchange')
    /*
     * User interaction on page
     * */
    _.each(['Rent', 'Own', 'Contact'], function (val) {
        $('button#show' + val + 'Btn').click(function () {
            switchTypeTab(val.toLowerCase())
        })
        $('#show' + val + 'Tab').click(function () {
            switchTypeTab(val.toLowerCase())
        })
    })



    /*
     * User interaction on rent list item
     * */

    function bindRentItemWechatShareClick() {
        $('.actions #wechatShare').click(function (e) {
            var ticketId = $(this).attr('data-id')

            if (window.bridge !== undefined) {
                window.bridge.callHandler('shareRentTicket', _.first(_.where(window.rentArray, {id: ticketId})))
                ga('send', 'event', 'user_properties', 'share', 'open-wechat-native')
            } else {
                $('#popupShareToWeChat')
                    .find('img').prop('src',
                        '/qrcode/generate?content=' + encodeURIComponent(location.origin + '/wechat-poster/' + ticketId)).end()
                    .modal({zIndex:15})
                ga('send', 'event', 'user_properties', 'share', 'open-wechat-web')
            }


        })
    }

    function bindRentItemRefreshClick() {
        $('.actions #refresh').click(function (e) {
            var ticketId = $(e.target).attr('data-id')
            if(!team.isToday(parseInt(_.first(_.where(window.rentArray, {id: ticketId})).last_modified_time))){
                var params = {
                    'status': 'to rent'
                }
                ga('send', 'pageview', '/property-to-rent/' + ticketId + '/rent-refresh')
                $.betterPost('/api/1/rent_ticket/' + ticketId + '/edit', params)
                    .done(function (data) {
                        $(e.target).unbind('click')
                        $(e.target).text(window.i18n('刚刚刷新过'))
                        $(e.target).parent().parent().parent().find('.imgAction_wrapper .date').text(window.i18n('刚刚刷新过'))
                        $(e.target).addClass('disabled')

                        ga('send', 'event', 'user_properties', 'action', 'rent-refresh-success')
                        ga('send', 'pageview', '/property-to-rent/' + ticketId + '/rent-refresh-success')
                    })
                    .fail(function (ret) {
                        window.alert(window.i18n('刷新失败'))
                        ga('send', 'event', 'user_properties', 'action', 'rent-refresh-failed')
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
                    ga('send', 'pageview', '/property-to-rent/' + ticketId + '/rent-out-confirm')
                    $.betterPost('/api/1/rent_ticket/' + ticketId + '/edit', params)
                        .done(function (data) {
                            window.rentArray[_.indexOf(window.rentArray,_.first(_.where(window.rentArray, {id: ticketId})))] = data
                            $(e.target).text(window.i18n('重新发布'))
                            $(e.target).attr('data-type','rent')
                            $(e.target).parent().parent().parent().find('.imgAction_wrapper .date').text(window.i18n('今天更新过'))
                            $(e.target).parent().parent().parent().parent().parent().find('.status').text(window.i18n('已租出'))

                            //Remove refresh from rent status
                            $(e.target).parent().prev().remove()

                            if (window.bridge !== undefined) {
                                window.bridge.callHandler('notifyRentTicketIsRented', _.first(_.where(window.rentArray, {id: ticketId})))
                            }

                            ga('send', 'event', 'user_properties', 'action', 'rent-out-confirm-success')
                            ga('send', 'pageview', '/property-to-rent/' + ticketId + '/rent-out-confirm-success')
                        })
                        .fail(function (ret) {
                            window.alert(window.i18n('无法更新，请检查后重试'))
                            ga('send', 'event', 'user_properties', 'action', 'rent-out-confirm-failed')
                        })
                }
            } else {
                //Bind to it's edit button
                if (team.isCurrantClient()){
                    if (team.isCurrantClient('>=1.1.1')) {
                        location.href = 'yangfd://property-to-rent/edit?ticketId=' + ticketId
                    }
                    else {
                        //deprecated: Remove in the future
                        if (window.bridge !== undefined) {
                            window.bridge.callHandler('editRentTicket', _.first(_.where(window.rentArray, {id: ticketId})))
                        }
                    }
                } else {
                    location.href = '/property-to-rent/' + ticketId + '/edit'
                }
            }
        })
    }

    function bindRentItemEditClick() {
        $('.imgAction_wrapper #edit').on('click', function (e) {
            var ticketId = $(e.target).attr('data-id')
            if (team.isCurrantClient()){
                if (team.isCurrantClient('>=1.1.1')) {
                    location.href = 'yangfd://property-to-rent/edit?ticketId=' + ticketId
                }
                else {
                    //deprecated: Remove in the future
                    if (window.bridge !== undefined) {
                        window.bridge.callHandler('editRentTicket', _.first(_.where(window.rentArray, {id: ticketId})))
                    }
                }
            } else {
                location.href = '/property-to-rent/' + ticketId + '/edit'
            }
        })
    }

    function bindRentItemRemoveClick() {
        $('.imgAction_wrapper #remove').on('click', function (e) {

            ga('send', 'event', 'user_properties', 'action', 'rent-delete')
            if (window.confirm(window.i18n('确定删除该出租房吗？注意：此操作不可逆')) === true) {
                var ticketId = $(e.target).attr('data-id')
                var params = {
                    'status': 'deleted'
                }
                $.betterPost('/api/1/rent_ticket/' + ticketId + '/edit', params)
                    .done(function (data) {
                        if (window.bridge !== undefined) {
                            window.bridge.callHandler('notifyRentTicketIsDeleted', _.first(_.where(window.rentArray, {id: ticketId})))
                        }
                        location.reload()
                        ga('send', 'event', 'user_properties', 'action', 'rent-delete-success')
                    })
                    .fail(function (ret) {
                        window.alert(window.i18n('无法删除，请检查后重试'))
                        ga('send', 'event', 'user_properties', 'action', 'rent-delete-failed')
                    })
            }
        })
    }

    /*
     * User interaction on property list item
     * */
    $('#list').on('click', '.houseCard [data-action="removeProperty"]', function (event) {
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
    $('#list').on('click', '.houseCard_phone_new [data-action="removeProperty"]', function (event) {
        event.stopPropagation()
        event.preventDefault()
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

    bindItemWechatShareClick()

    function bindItemWechatShareClick() {
        $('body').delegate('.wechatShare', 'click', function() {
            var intentionId = $(this).attr('data-id')
            var property = _.first(_.where(ownPropertyArray, {id: intentionId})).property
            openWeChatShare(property.id)
        })
    }
    function openWeChatShare (propertyId) {
        if (window.team.isWeChat()) {
            if (window.team.isWeChatiOS()) {
                $('.wechatPage_popup .buttonHolder').attr('src', '/static/images/property_details/wechat_share/phone/wechat_button_ios.png')
            }
            $('.wechatPage_popup').modal({zIndex:15})
            $('.wechatPage_popup').find('.close-modal').hide()
        }
        else if (window.team.isPhone()) {
            location.href = '/wechat_share?property=' + propertyId
        } else {
            $('#popupShareToWeChat')
                .find('img').prop('src',
                '/qrcode/generate?content=' + encodeURIComponent(location.origin + '/property-wechat-poster/' + propertyId)).end()
                .modal({zIndex:15})
        }
    }

    function bindGetHostContactClick () {

        $('.getHostContact').buttonLoading().click(function () {
            window.team.setUserType('tenant')
            var container = $(this).parents('.contactCard')
            if(!$(this).hasClass('buttonLoading')) {
                $.betterPost('/api/1/rent_ticket/' + $(this).attr('data-id') + '/contact_info')
                    .done(function (val) {
                        var host = val
                        host.private_contact_methods = host.private_contact_methods || []
                        if(host.private_contact_methods.indexOf('phone') < 0 && host.phone) {
                            container.find('.hostPhone').addClass('show').find('span').eq(0).text('+' + host.country_code)
                            container.find('.hostPhone').addClass('show').find('span').eq(1).text(host.phone)
                            container.find('.hostPhone a').attr('href', 'tel:+' + host.country_code + host.phone)
                        } else {
                            container.find('.hostPhone').removeClass('show')
                        }
                        if(host.private_contact_methods.indexOf('email') < 0 && host.email) {
                            container.find('.hostEmail').addClass('show').find('span').text(host.email)
                            container.find('.hostEmail a').attr('href', 'mailto:' + host.email)
                        } else {
                            container.find('.hostEmail').removeClass('show')
                        }
                        if(host.private_contact_methods.indexOf('wechat') < 0 && host.wechat) {
                            container.find('.hostWechat').addClass('show').find('span').text(host.wechat)
                        } else {
                            container.find('.hostWechat').removeClass('show')
                        }

                        container.find('.hostName').text(host.nickname)
                        container.find('.actions').hide()
                    })
                    .fail(function (ret) {
                        window.alert(window.getErrorMessageFromErrorCode(ret))
                    })
            }
        })
    }

})
