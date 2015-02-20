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
        $(event.target).parent().find('a.prev').click()
    })

    $('.rslides_wrapper .rightPressArea').click(function (event) {
        $(event.target).parent().find('a.next').click()
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


    $('[data-tabs]').tabs({trigger: 'click'}).on('openTab', function (event, target, tabName) {
        $('[data-tab-name=' + tabName + ']').show()
    })

    $(function () {
        //onload
        function findLocation()
        {
            var region = 'GB'
            if (window.report.country) {
                region = window.report.country.slug
            }

            var schoolMapId = 'schoolMapCanvas'
            var query = zipCodeIndexFromURL + ',' +region
            var map = window.getMap(schoolMapId)

            map.getCredentials(callSearchService);
            function callSearchService(credentials)
            {
                var searchRequest = 'http://dev.virtualearth.net/REST/v1/Locations/' + query + '?output=json&jsonp=searchServiceCallback&key=' + credentials;
                var mapscript = document.createElement('script');
                mapscript.type = 'text/javascript';
                mapscript.src = searchRequest;
                document.getElementById(schoolMapId).appendChild(mapscript)
            }

            window.searchServiceCallback = function (result)
            {
                if (result &&
                    result.resourceSets &&
                    result.resourceSets.length > 0 &&
                    result.resourceSets[0].resources &&
                    result.resourceSets[0].resources.length > 0)
                {
                    var bbox = result.resourceSets[0].resources[0].bbox;
                    var viewBoundaries = Microsoft.Maps.LocationRect.fromLocations(new Microsoft.Maps.Location(bbox[0], bbox[1]), new Microsoft.Maps.Location(bbox[2], bbox[3]));
                    map.setView({ bounds: viewBoundaries});
                    var location = new Microsoft.Maps.Location(result.resourceSets[0].resources[0].point.coordinates[0], result.resourceSets[0].resources[0].point.coordinates[1]);
                    onLocationFind(location)

                }
            }
        }


        if (typeof Microsoft !== 'undefined') {
            // map load failed, return
            return
        }
        else {
            findLocation()
        }

        function onLocationFind(location) {
            window.report.location = location

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

            // getRegion(zipCodeIndexFromURL, function (polygon) {
            //     showSecurityMap(location, polygon)
            //})
        }
    })
})();
