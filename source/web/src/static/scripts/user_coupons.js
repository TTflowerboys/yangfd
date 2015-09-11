$(function () {
    // on page load

    function loadListData(array) {
        var $list = $('.list_wrapper .list')
        var $placeholder = $list.parent().find('#emptyPlaceHolder')
        $placeholder.hide()
        $list.empty()
        _.each(array, function (deal) {
            var couponsResult = _.template($('#couponsCell_template').html())({deal: deal})
            $list.append(couponsResult)
        })

        if (array && array.length) {
            $placeholder.hide()
        }
        else {
            $placeholder.show()
        }
    }


    var venuesData = $('.venuesData').text().trim() ? JSON.parse($('.venuesData').text()) : []
    window.allData = []
    _.each(venuesData, function (venue, index) {
        if(venue.deals && venue.deals.length) {
            _.each(venue.deals, function (deal) {
                deal.venue = venue
                window.allData.push(deal)
            })
        }
    })

    window.startPaging(window.allData, 10, $('.list_wrapper #pager #pre'), $('.list_wrapper #pager #next'), loadListData)

})
