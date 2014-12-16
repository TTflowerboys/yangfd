(function () {

    google.load('visualization', '1', {'packages':['corechart', 'table', 'geomap']});

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
        //http://blog.codebusters.pl/en/google-maps-in-hidden-div
        var mapId = $('.maps .map [data-tab-name=' + tabName + ']').attr('id')
        google.maps.event.trigger(getMap(mapId), 'resize');
        getMap(mapId).setOptions(getMapOptions())
    })

    window.mapCache = {}
    window.markersCache = {}

    function getMap(mapId) {
        if (!window.mapCache[mapId]) {
            window.mapCache[mapId] = new google.maps.Map(document.getElementById(mapId));
        }
        return window.mapCache[mapId]
    }

    function getMapOptions() {
        var mapOptions = {}
        if (window.team.isPhone()) {
            mapOptions = {
                zoom: 12,
                center: window.report.location
            }
            return mapOptions;

        }
        else {
            mapOptions = {
                zoom: 13,
                center: window.report.location
            }
            return mapOptions;

        }
    }

    function keepMarker(mapId, marker) {
        if (!window.markersCache[mapId]) {
            window.markersCache[mapId] = []
        }
        window.markersCache[mapId].push(marker)
    }

    function getMarkers(mapId) {
        return window.markersCache[mapId]
    }


    function rad(x) {
        return x * Math.PI / 180;
    }

    function getDistance(p1, p2) {

        //trim up to 5 decimal places because it is at that point where the difference
        p1.latitude = parseFloat(p1.lat().toFixed(5));
        p1.longitude = parseFloat(p1.lng().toFixed(5));

        p2.latitude = parseFloat(p2.lat().toFixed(5));
        p2.longitude = parseFloat(p2.lng().toFixed(5));

        var R = 6378137; // Earth’s mean radius in meter
        var dLat = rad(p2.latitude - p1.latitude);
        var dLong = rad(p2.longitude - p1.longitude);

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(p1.latitude)) * Math.cos(rad(p2.latitude)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);

        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;

        return d / 1000.0; // returns the distance in kilo meter
    }

    function showTransitMap(latlng) {
        var map = getMap('transitMapCanvas')
        var $list = $('.maps .list div[data-tab-name=transit] ul')

        showRegion(map, zipCodeIndexFromURL, function () {
            showLabel(map, window.report.location, zipCodeIndexFromURL)
            var transitLayer = new google.maps.TransitLayer();
            transitLayer.setMap(map);

            var infowindow = new google.maps.InfoWindow();
            var placesService = new google.maps.places.PlacesService(map)

            placesService.nearbySearch({location:latlng, radius:'1000', types:['subway_station', 'bus_station']}, function (results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    for (var i = 0; i < results.length; i++) {
                        results[i].distance = getDistance(latlng, results[i].geometry.location).toFixed(2) + 'km'
                        var marker = createMarker(map, infowindow, results[i]);
                        keepMarker('transitMapCanvas', marker)

                        createListItem($list, results[i])
                    }
                }
            })
            map.setOptions(getMapOptions())
        })
    }

    function showSchoolMap(latlng) {
        var map = getMap('schoolMapCanvas')
        var $list = $('.maps .list div[data-tab-name=school] ul')
        showRegion(map, zipCodeIndexFromURL, function () {
            showLabel(map, window.report.location, zipCodeIndexFromURL)

            var infowindow = new google.maps.InfoWindow();
            var placesService = new google.maps.places.PlacesService(map)

            placesService.nearbySearch({location:latlng, radius:'2000', types:['school', 'university']}, function (results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    for (var i = 0; i < results.length; i++) {
                        results[i].distance = getDistance(latlng, results[i].geometry.location).toFixed(2) + 'km'
                        var marker = createMarker(map, infowindow, results[i]);
                        keepMarker('shcoolMapCanvas', marker)
                        createListItem($list, results[i])
                    }
                }
            })
            map.setOptions(getMapOptions())
        })
    }

    function showFacilityMap(latlng) {
        var map = getMap('facilityMapCanvas')
        var $list = $('.maps .list div[data-tab-name=facility] ul')
        showRegion(map, zipCodeIndexFromURL, function () {
            showLabel(map, window.report.location, zipCodeIndexFromURL)

            var infowindow = new google.maps.InfoWindow();
            var placesService = new google.maps.places.PlacesService(map)
            //https://developers.google.com/places/documentation/supported_types
            placesService.nearbySearch({location:latlng, radius:'2000', types:['food', 'store','park','gym','hair_care','health','bank']}, function (results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    for (var i = 0; i < results.length; i++) {
                        results[i].distance = getDistance(latlng, results[i].geometry.location).toFixed(2) + 'km'
                        var marker = createMarker(map, infowindow, results[i]);
                        keepMarker('facilityMapCanvas', marker)

                        createListItem($list, results[i])
                    }
                }
            })
            map.setOptions(getMapOptions())
        })
    }

    function showSecurityMap(latlng) {
        //http://data.police.uk/api/crimes-street/all-crime?lat=52.629729&lng=-1.131592

        var map = getMap('securityMapCanvas')
        var $list = $('.maps .list div[data-tab-name=security] ul')
        showRegion(map, zipCodeIndexFromURL, function () {
            $.betterGet('/api/1/report/policeuk', {lat:latlng.lat(), lng:latlng.lng()})
                .done(function (data) {
                    var length = data.length
                    showLabel(map, window.report.location, window.i18n('犯罪数目') + length, '200px')

                    $.betterGet('/api/1/report/policeuk/categories')
                        .done(function (categoryData) {
                            var categoryDic = {}
                            _.each(categoryData, function (item) {
                                categoryDic[item.url] = item.name
                            })
                            var categories = {}
                            _.each(data, function (item) {
                                if (categories[item.category]) {
                                    categories[item.category] = categories[item.category] + 1
                                }
                                else {
                                    categories[item.category] = + 1
                                }
                            })

                            var categoryItem = {}
                            for (var key in categories) {
                                categoryItem.distance = categories[key] + window.i18n('起')
                                categoryItem.name = categoryDic[key]
                                createListItem($list, categoryItem)
                            }

                        })
                        .fail(function (ret) {
                        })
                    //var infowindow = new google.maps.InfoWindow();
                })
                .fail(function (ret) {
                    showLabel(map, window.report.location, zipCodeIndexFromURL)
                })

            map.setOptions(getMapOptions())
        })

    }

    function createMarker(map, infowindow, place) {
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location
        });

        google.maps.event.addListener(marker, 'click', function() {
            var contentString = '<div id="content">'+
                    '<img src=' + place.icon + ' style="height:32px; vertical-align:middle;">' +
                    '<label style="font-size:14px; line-height:32px; vertical-align:middle;">' + place.name + '</label>'+
                    '</div>';
            infowindow.setContent(contentString);
            infowindow.open(map, this);
        });

        return marker
    }

    function createListItem($list, item) {
        var result = _.template($('#placeItem_template').html())({item: item})
        $list.append(result)
    }

    function showPolygon(map, polygon) {
        if (map.getZoom() < 11)  {return;}
        //for more information on the response object, see the documentation
        //http://code.google.com/apis/visualization/documentation/reference.html#QueryResponse
        var numRows = polygon.getDataTable().getNumberOfRows();
        for(var i = 0; i < numRows; i = i + 1) {
            var kml = polygon.getDataTable().getValue(0,0);
            // create a geoXml3 parser for the click handlers
            var geoXml = new window.geoXML3.parser({
                map: map,
                zoom: false
            });

            geoXml.parseKmlString('<Placemark>'+kml+'</Placemark>');
            geoXml.docs[0].gpolygons[0].setMap(map);
            map.fitBounds(geoXml.docs[0].gpolygons[0].bounds);
        }
    }

    function showLabel(map, position, content, widthString) {
        if (!widthString) {
            widthString = '50px'
        }
        var label = new window.InfoBox({
            content: content,
            boxStyle: {
                border: '1px solid black',
                textAlign: 'center',
                fontSize: '12pt',
                widthString: widthString
            },
            disableAutoPan: true,
            pixelOffset: new google.maps.Size(-25, 0),
            position: position,
            closeBoxURL: '',
            isHidden: false,
            enableEventPropagation: true
        })
        label.open(map)
    }

    function showRegion(map, zipCodeIndex, callback) {
        //http://stackoverflow.com/questions/18601186/google-maps-api-get-region-polygon
        //http://geocodezip.com/v3_FusionTables_UKpostcode_map.html

        var tableid =  '1jgWYtlqGSPzlIa-is8wl1cZkVIWEm_89rWUwqFU';
        //set the query using the current bounds
        var queryStr = 'SELECT \'Area data\', \'Postcode district\' FROM '+ tableid + ' WHERE \'Postcode district\' = \''+zipCodeIndex+'\'';
        var queryText = encodeURIComponent(queryStr);
        var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq='  + queryText);

        //set the callback function
        query.send(function (response) {
            if (!response) {
                window.alert('no response');
                return;
            }
            if (response.isError()) {
                window.alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
                return;
            }
            showPolygon(map, response)
            callback()
        });
    }

    if (!window.team.isPhone()) {
         $('.maps .list div ul').slimScroll({
            height: '420px'
        });
    }


    $('.maps .list ul').click(function (event){
        var tabName = $(event.currentTarget).closest('div[data-tab-name]').attr('data-tab-name')
        var map = getMap(tabName + 'MapCanvas')

        var $li = $(event.target).closest('li')
        var location = new google.maps.LatLng($li.attr('data-lat'), $li.attr('data-lng'))

        _.each(getMarkers(tabName + 'MapCanvas'), function (marker) {
            if (google.maps.geometry.spherical.computeDistanceBetween(marker.position, location) === 0.0) {
                map.setCenter(marker.getPosition());
                google.maps.event.trigger(marker,'click')
                return
            }
        })

    })

    $(function () {
        //onload

        var geocoder = new google.maps.Geocoder()
        var country = 'GB'
        if (window.report.country) {
            country = window.report.country.slug
        }
        var geocoderRequest = {
            region:country,
            address:zipCodeIndexFromURL,
        }
        geocoder.geocode(geocoderRequest, function (results, status) {
            if (!_.isEmpty(results)) {
                var geometry = results[0].geometry
                var latlng = geometry.location
                window.report.location = latlng
                showTransitMap(latlng)
                showSchoolMap(latlng)
                showFacilityMap(latlng)
                showSecurityMap(latlng)
            }
        })


    })
})();
