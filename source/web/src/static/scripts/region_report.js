(function () {
    $('#loadIndicator').show()
    $.betterPost('/api/1/property/search', {zipcode_index:'E14'})
        .done(function (val) {
            var array = val.content

            if (!_.isEmpty(array)) {

                _.each(array, function (house) {
                    var houseResult = _.template($('#houseCard_template').html())({house: house})
                    $('.relatedProperties .jcarousel ul').append('<li>' +houseResult + '</li>')
                })
                $('.relatedProperties .jcarousel-wrapper').show()
                if (array.length === 1)
                {
                    $('.relatedProperties .jcarousel-wrapper').width('600px')
                    $('.relatedProperties .jcarousel-control-next').hide()
                }
            }
        })
        .fail (function () {

        })
        .always(function () {
            $('#loadIndicator').hide()
        })

})();
