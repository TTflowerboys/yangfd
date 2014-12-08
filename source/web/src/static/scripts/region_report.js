(function () {
    $('#priceSlider').responsiveSlides({
        manualControls: '#priceSliderPager',
        auto: false,
        maxwidth: 800
    });

    $('#areaValueSlider').responsiveSlides({
        pager: true,
        auto: false,
        nav: true,
        prevText: '<',
        nextText: '>'
    })



    $('#loadIndicator').show()
    var zipcodeIndexFormURL = _.last(location.pathname.split('/'))
    $.betterPost('/api/1/property/search', {zipcode_index:zipcodeIndexFormURL})
        .done(function (val) {
            var array = val.content

            if (!_.isEmpty(array)) {

                var index = 0
                _.each(array, function (house) {
                    index = index + 1
                    var houseResult = _.template($('#houseCard_template').html())({house: house})
                    $('.relatedProperties .jcarousel ul').append('<li class=item' + index + ' >' +houseResult + '</li>')

                    $('.relatedProperties .rslides').append('<li class=item' + index + ' >' +houseResult + '</li>')
                })

                if (window.team.isPhone())
                {
                    $('.relatedProperties .rslides_wrapper').show()
                    $('#propertySlider').responsiveSlides({
                        pager: true,
                        auto: false,
                        nav: true,
                        prevText: '<',
                        nextText: '>'
                    })

                }
                else {
                    $('.relatedProperties .jcarousel-wrapper').show()

                }
                if (array.length === 1)
                {
                    $('.relatedProperties .jcarousel-wrapper').width('600px')
                    $('.relatedProperties .jcarousel-control-prev').hide()
                    $('.relatedProperties .jcarousel-control-next').hide()
                }
                else if (array.length === 2)
                {
                    $('.relatedProperties .jcarousel-control-prev').hide()
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
