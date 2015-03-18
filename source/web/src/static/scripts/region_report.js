(function () {

    function getData(key) {
        return JSON.parse(document.getElementById(key).innerHTML)
    }

    window.report = getData('dataReport')

    var descriptionHeight = $('.info .description').height()
    if (descriptionHeight > 180) {
        $('.info >img').height($('.info >img').height() + descriptionHeight - 180)
    }

    $('#priceSlider').responsiveSlides({
        manualControls: '#priceSliderPager',
        auto: false,
        maxwidth: 800,
        nav: true,
        prevText: '<',
        nextText: '>',
        after: function () {
            var selectedType = $('#priceSliderPager').find('.rslides_here').attr('data-selector')
            $('.priceCharts .text .selected').toggleClass('selected', false)
            $('.priceCharts .text').find('[data-type=' + selectedType + ']').toggleClass('selected', 'true')
        }
    });

    $('#areaValueSlider').responsiveSlides({
        pager: true,
        auto: false,
        nav: true,
        prevText: '<',
        nextText: '>'
    })

    $('.rslides_wrapper .leftPressArea').click(function (event) {
        $(event.delegateTarget).parent().find('a.prev').click()
    })

    $('.rslides_wrapper .rightPressArea').click(function (event) {
        $(event.delegateTarget).parent().find('a.next').click()
    })


    $('#loadIndicator').show()
    var zipCodeIndexFromURL = _.last(location.pathname.split('/'))
    $.betterPost('/api/1/property/search', {zipcode_index:zipCodeIndexFromURL})
        .done(function (val) {
            var array = val.content

            if (!_.isEmpty(array)) {

                var index = 0
                _.each(array, function (house) {
                    index = index + 1
                    var houseResult = _.template($('#houseCard_template').html())({house: house})
                    $('.relatedProperties .rslides').append('<li class=item' + index + ' >' +houseResult + '</li>')
                })

                $('.relatedProperties .rslides_wrapper').show()
                $('#propertySlider').responsiveSlides({
                    pager: true,
                    auto: false,
                    nav: true,
                    prevText: '<',
                    nextText: '>'
                })

            }
        })
        .fail (function () {

        })
        .always(function () {
            $('#loadIndicator').hide()
        })

    //onload
    function findLocation(callback)
    {
        var region = 'GB'
        if (window.report.country) {
            region = window.report.country.slug
        }

        var bingMapKey = 'AhibVPHzPshn8-vEIdCx0so7vCuuLPSMK7qLP3gej-HyzvYv4GJWbc4_FmRvbh43'
        var schoolMapId = 'schoolMapCanvas'
        var query = zipCodeIndexFromURL + ',' +region
        var searchRequest = 'http://dev.virtualearth.net/REST/v1/Locations/' + query + '?output=json&jsonp=searchServiceCallback&key=' + bingMapKey
        var mapscript = document.createElement('script');
        mapscript.type = 'text/javascript';
        mapscript.src = searchRequest;
        document.getElementById(schoolMapId).appendChild(mapscript)

        window.searchServiceCallback = function (result)
        {
            if (result &&
                result.resourceSets &&
                result.resourceSets.length > 0 &&
                result.resourceSets[0].resources &&
                result.resourceSets[0].resources.length > 0)
            {
                var latitude = result.resourceSets[0].resources[0].point.coordinates[0]
                var longitude = result.resourceSets[0].resources[0].point.coordinates[1]
                callback(latitude, longitude)
            }
        }
    }

    findLocation(function (latitude, longitude) {
        window.setupMap(latitude, longitude, function () {
            $('[data-tabs]').tabs({trigger: 'click'}).on('openTab', function (event, target, tabName) {
                $('[data-tab-name=' + tabName + ']').show()
            })
            //TODO: find why need get region for different map, may because for the delay after bing map load, or load bing map module for different map
            window.getRegion(zipCodeIndexFromURL, function (polygon) {
                window.showTransitMap(location, polygon)
            })
            window.getRegion(zipCodeIndexFromURL, function (polygon) {
                window.showSchoolMap(location, polygon)
            })
            window.getRegion(zipCodeIndexFromURL, function (polygon) {
                window.showFacilityMap(location, polygon)
            })
        })
    })

})();
