$(function () {
    // on page load

    function loadListData(array) {
        var $list = $('.list_wrapper .list')
        var $placeholder = $list.parent().find('#emptyPlaceHolder')
        $placeholder.hide()
        $list.empty()
        _.each(array, function (coupons) {
            var couponsResult = _.template($('#couponsCell_template').html())({coupons: coupons})
            $list.append(couponsResult)
        })

        if (array && array.length) {
            $placeholder.hide()
        }
        else {
            $placeholder.show()
        }
    }


    window.allData = $('.couponsData').text().trim() ? JSON.parse($('.couponsData').text()) : []

    window.startPaging(window.allData, 10, $('.list_wrapper #pager #pre'), $('.list_wrapper #pager #next'), loadListData)

})
