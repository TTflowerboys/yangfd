$(function () {
    $.betterGet('/api/1/coupon/search', {})
        .done(function (data) {
            var coupons = data

            if (coupons.length > 0) {
                $('.list_wrapper').show()
                _.each(coupons, function (coupon) {
                    var couponResult = _.template($('#couponCell_template').html())({coupon: coupon})
                    $('.list').append(couponResult)
                })
            }
            else {
                $('.emptyPlaceholder').show()
            }

        })
        .fail(function (ret) {
        })
        .always(function () {

        })
})
