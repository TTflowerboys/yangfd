$(function () {

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
        //reload data or setup empty place holder
        var ticketArray = JSON.parse($('#dataTicketList').text())
        if (_.isEmpty(ticketArray)) {
            $('#investmentPlaceHolder').show()
        }
        else {
            _.each(ticketArray, function (ticket) {
                if (ticket.property) {
                    var houseResult = _.template($('#houseCard_template').html())({ticket: ticket})
                    $('#list').append(houseResult)
                }
                else {
                    var intentionResult = _.template($('#intentionCard_template').html())({ticket: ticket})
                    $('#list').append(intentionResult)
                }
            })
        }
    }

    function loadRentIntentionTicket() {

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
})

bindItemWechatShareClick()

function bindItemWechatShareClick() {
    $('body').delegate('.wechatShare', 'click', function() {
        var intentionId = $(this).attr('data-id')
        var ticketArray = JSON.parse($('#dataTicketList').text())
        var property = _.first(_.where(ticketArray, {id: intentionId})).property
        openWeChatShare(property.id)
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
