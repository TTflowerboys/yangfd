(function () {

    function getData(key) {
        return JSON.parse(document.getElementById(key).innerHTML)
    }

    window.report = getData('dataReport')

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

    function showTransitMap(myLatlng) {
        var mapOptions = {
            zoom: 13,
            center: myLatlng
        }

        var map = new google.maps.Map($('.transitMapCanvas')[0], mapOptions);
        var transitLayer = new google.maps.TransitLayer();
        transitLayer.setMap(map);
    }

    function showSchoolMap(latlng) {
        var mapOptions = {
            zoom: 15,
            center: latlng
        }

        var map = new google.maps.Map($('.schoolMapCanvas')[0], mapOptions);
        var infowindow = new google.maps.InfoWindow();
        var placesService = new google.maps.places.PlacesService(map)

        placesService.nearbySearch({location:latlng, radius:'2000', types:['school', 'university']}, function (results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    createMarker(map, infowindow, results[i]);
                }
            }
        })
    }

    function showFacilityMap(latlng) {
        var mapOptions = {
            zoom: 15,
            center: latlng
        }

        var map = new google.maps.Map($('.facilityMapCanvas')[0], mapOptions);
        var infowindow = new google.maps.InfoWindow();
        var placesService = new google.maps.places.PlacesService(map)
        //https://developers.google.com/places/documentation/supported_types
        placesService.nearbySearch({location:latlng, radius:'2000', types:['food', 'store','park','gym','hair_care','health','bank']}, function (results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    createMarker(map, infowindow, results[i]);
                }
            }
        })
    }

    function createMarker(map, infowindow, place) {
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location
        });

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(place.name);
            infowindow.open(map, this);
        });
    }



    $(function () {
        //onload
        var geocoder = new google.maps.Geocoder()
        var region = 'GB'
        if (window.report.country) {
            region = window.report.country.slug
        }
        var geocoderRequest = {
            region:region,
            address:zipcodeIndexFormURL
        }

        geocoder.geocode(geocoderRequest, function (results, status) {
            if (!_.isEmpty(results)) {
                window.report.geometry = results[0].geometry
                //window.report.geometry.location.lat() window.report.geometry.location.lng()

                var latlng = new google.maps.LatLng(window.report.geometry.location.lat(), window.report.geometry.location.lng())
                showTransitMap(latlng)
                showSchoolMap(latlng)
                showFacilityMap(latlng)
            }
        })
    })

})();
