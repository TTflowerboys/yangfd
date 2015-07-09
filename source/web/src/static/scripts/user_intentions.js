$(function () {

    var $headerButtons = $('.contentHeader .buttons')
    var $headerTabs = $('.tabs')
    var $list = $('#list')
    var $placeholder = $('.emptyPlaceHolder')
    var $investmentPlaceholder = $('#investmentPlaceHolder')
    var $rentPlaceholder = $('#rentPlaceHolder')
    var isLoading = false
    var investmentTicketArray;
    var xhr


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
            loadRentIntentionTicket()
        } else {
            $headerButtons.hide()
            $headerTabs.hide()
            switchTypeTab('investment')
            loadInvestmentTicket()
        }
    } else {
        if (team.isPhone()) {
            $headerTabs.show()
        } else {
            $headerButtons.show()
        }
        loadRentIntentionTicket()
    }

    function loadInvestmentTicket() {

        var defer = $.Deferred()
        if (xhr && xhr.readyState !== 4) {
            xhr.abort()
        }
        $placeholder.hide()
        $list.empty()
        $('#loadIndicator').show()

        var params = {
            'user_id': window.user.id,
            'per_page': -1
        }

        xhr = $.post('/api/1/intention_ticket/search', params)
            .success(function (data) {
                //Check if tab is still rent
                //TODO:Disable check for production sync
                //if ($('.buttons .own').hasClass('button')) {
                var val = data.val
                var array = val
                investmentTicketArray = array;
                if (array && array.length > 0) {
                    _.each(array, function (ticket) {
                        if (ticket.property) {
                            ticket.status_presentation = getStatusPresentation(ticket.status)
                            var houseResult = _.template($('#houseCard_template').html())({ticket: ticket})
                            $('#list').append(houseResult)
                        }
                        else {
                            var intentionResult = _.template($('#intentionCard_template').html())({ticket: ticket})
                            $('#list').append(intentionResult)
                        }
                    })
                } else {
                    $investmentPlaceholder.show()
                }
                defer.resolve()
            }).fail(function () {
                $investmentPlaceholder.show()
                defer.reject()
            }).complete(function () {
                $('#loadIndicator').hide()
                isLoading = false
            })
        return defer.promise()
    }

    function loadRentIntentionTicket() {
         var defer = $.Deferred()
        if (xhr && xhr.readyState !== 4) {
            xhr.abort()
        }
        $placeholder.hide()
        $list.empty()
        $('#loadIndicator').show()

        var params = {
            'user_id': window.user.id,
            'per_page': -1
        }
        xhr = $.post('/api/1/rent_intention_ticket/search', params)
            .success(function (data) {
                //Check if tab is still rent
                //TODO:Disable check for production sync
                //if ($('.buttons .own').hasClass('button')) {
                var val = data.val
                var array = val
                investmentTicketArray = array;
                if (array && array.length > 0) {
                    _.each(array, function (rent) {
                        rent.status_presentation = getRentIntentionStatusPresentation(rent.status)
                        var houseResult = _.template($('#rentIntentionCard_template').html())({ticket: rent})
                        $('#list').append(houseResult)
                    })
                } else {
                    $rentPlaceholder.show()

                }
                defer.resolve()
            }).fail(function () {
                $rentPlaceholder.show()
                defer.reject()
            }).complete(function () {
                $('#loadIndicator').hide()
                isLoading = false
            })
        return defer.promise()
    }

    function getStatusPresentation(status) {
        return {'new': window.i18n('已提交'),
                'assigned': window.i18n('已指派销售人员'),
                'in_progress': window.i18n('受理中'),
                'deposit': window.i18n('定金已支付'),
                'suspend': window.i18n('未达成定金'),
                'bought': window.i18n('购房已成功'),
                'canceled': window.i18n('未达成购房'),
               }[status];
    }

    function getRentIntentionStatusPresentation(status) {
        return {'new': window.i18n('求租中'),
                'rent': window.i18n('已租到'),
                'canceled': window.i18n('已取消'),
               }[status];
    }


     /*
     * User interaction on page
     * */
    $('button#showRentBtn').click(function () {
        switchTypeTab('rent')
        loadRentIntentionTicket()
    })

    $('button#showInvestmentBtn').click(function () {
        switchTypeTab('investment')
        loadInvestmentTicket()
    })

    $('#showRentTab').click(function () {
        switchTypeTab('rent')
        loadRentIntentionTicket()
    })

    $('#showInvestmentTab').click(function () {
        switchTypeTab('investment')
        loadInvestmentTicket()
    })

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

        if (state === 'rent') {
            switchTypeTab(state)
            loadRentIntentionTicket()
        } else if (state === 'investment') {
            switchTypeTab(state)
            loadInvestmentTicket()
        }
    })
    $(window).trigger('hashchange')


    bindItemWechatShareClick()
    bindRentIntentionTicketChangeStatusClick()

    function bindItemWechatShareClick() {
        $('body').delegate('#wechatShare', 'click', function() {
            var intentionId = $(this).attr('data-id')
            var ticketArray = investmentTicketArray
            var property = _.first(_.where(ticketArray, {id: intentionId})).property
            openWeChatShare(property.id)
        })
    }

    function bindRentIntentionTicketChangeStatusClick() {
        $('body').delegate('#rentIntentionTicketChangeStatus', 'click', function() {
            var ticketId = $(this).attr('data-id')
            var status = $(this).attr('data-status')
            if (status === 'new') {
                 if (window.confirm('已经租到？')) {
                     changeRentIntentionTicketStatus(ticketId, 'rent', function (data) {
                         loadRentIntentionTicket()
                     })
                }
            }
            else if (status === 'rent') {
                 if (window.confirm('重新发布？')) {
                     changeRentIntentionTicketStatus(ticketId, 'new', function (data) {
                         loadRentIntentionTicket()
                     })
                }
            }
        })
    }
    function openWeChatShare (propertyId) {
        if (window.team.isWeChat()) {
            if (window.team.isWeChatiOS()) {
                $('.wechatPage_popup .buttonHolder').attr('src', '/static/images/property_details/wechat_share/phone/wechat_button_ios.png')
            }
            $('.wechatPage_popup').modal()
            $('.wechatPage_popup').find('.close-modal').hide()
        }
        else {
            location.href = '/wechat_share?property=' + propertyId
        }
    }

    function changeRentIntentionTicketStatus(ticketId, status,  callback) {
        $.betterPost('/api/1/rent_intention_ticket/' + ticketId + '/edit', {'status': status}).done(function (data) {
            callback(data)
        })
        .fail(function (data) {
            callback(data)
        })
    }

})
