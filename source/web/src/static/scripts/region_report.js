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

    var bingMapKey = 'ApsJbXUENG-diuwrV1D4MkuamY_voaTpm8McrvYweG03awUvRGvL--mkkCKzW0DJ'

    window.mapCache = {}
    window.markersCache = {}
    window.mapInfoBoxCache = {}

    function getMap(mapId) {
        if (!window.mapCache[mapId]) {
            window.mapCache[mapId] = new Microsoft.Maps.Map(document.getElementById(mapId), {credentials: bingMapKey});
        }
        return window.mapCache[mapId]
    }

    function createMapPin(map, mapId, result) {
        if (result) {
            var location = new Microsoft.Maps.Location(result.Latitude, result.Longitude);
            var pin = new Microsoft.Maps.Pushpin(location);
            Microsoft.Maps.Events.addHandler(pin, 'click', function () { showInfoBox(map, mapId, result) });
            map.entities.push(pin);
        }
    }

    function showInfoBox(map, mapId, result) {
        if (window.mapInfoBoxCache[mapId]) {
            map.entities.remove(window.mapInfoBoxCache[mapId]);
        }
        var location = new Microsoft.Maps.Location(result.Latitude, result.Longitude);
        var decription = [];
        decription.push(window.i18n('地址') + ':' + result.AddressLine + '<br/>');
        decription.push(window.i18n('电话') + ':' + result.Phone + '<br/>');
        window.mapInfoBoxCache[mapId] = new Microsoft.Maps.Infobox(location, { title: result.DisplayName, description: decription.join(' '), showPointer: true});

        window.mapInfoBoxCache[mapId].setOptions({ visible: true });
        map.entities.push(window.mapInfoBoxCache[mapId]);
    }

    function showTransitMap(location) {
        var map = getMap('transitMapCanvas')
        var $list = $('.maps .list div[data-tab-name=transit] ul')

        Microsoft.Maps.loadModule('Microsoft.Maps.Traffic', { callback: trafficModuleLoaded });
        function trafficModuleLoaded()
        {
            map.setView({zoom: 13, center: location})
            var pushpin = new Microsoft.Maps.Pushpin(location);
            map.entities.push(pushpin);
            var trafficLayer = new Microsoft.Maps.Traffic.TrafficLayer(map);
            // show the traffic Layer
            trafficLayer.show();
        }

        function findNearByLocations(location) {
            //http://msdn.microsoft.com/en-us/library/hh478191.aspx
            var spatialFilter = 'spatialFilter=nearby(' + location.latitude + ',' + location.longitude + ',10)';
            var select = '$select=EntityID,Latitude,Longitude,__Distance,DisplayName,AddressLine,Phone';
            var top = '$top=100'
            var queryOptions = '$filter=EntityTypeID%20Eq%204170%20or%20EntityTypeID%20Eq%204013%20or%20EntityTypeID%20Eq%204581'
            var format = '$format=json';

            var sdsRequest = 'http://spatial.virtualearth.net/REST/v1/data/c2ae584bbccc4916a0acf75d1e6947b4/NavteqEU/NavteqPOIs?' +
                    spatialFilter + '&' +
                    select + '&' +
                    top + '&' +
                    queryOptions + '&' +
                    format + '&jsonp=nearbyTransitServiceCallback' + '&key=' + bingMapKey;

            var mapscript = document.createElement('script');
            mapscript.type = 'text/javascript';
            mapscript.src = sdsRequest;
            document.getElementById('transitMapCanvas').appendChild(mapscript);
        }

        window.nearbyTransitServiceCallback = function (result) {
            map.setView({ zoom: 13, center: location});

            result = result.d

            map.entities.clear();
            var searchResults = result && result.results;
            if (searchResults) {
                if (searchResults.length === 0) {
                    window.alert('No results for the query');
                }
                else {
                    for (var i = 0; i < searchResults.length; i++) {
                        createMapPin(map, 'transitMapCanvas', searchResults[i]);
                        createListItem($list, searchResults[i])
                    }
                }
            }
        }
        findNearByLocations(location)
    }

    function showSchoolMap(location) {
        var map = getMap('schoolMapCanvas')
        var $list = $('.maps .list div[data-tab-name=school] ul')

        function findNearByLocations(location) {

            var spatialFilter = 'spatialFilter=nearby(' + location.latitude + ',' + location.longitude + ',10)';
            var select = '$select=EntityID,Latitude,Longitude,__Distance,DisplayName,AddressLine,Phone';
            var top = '$top=100'
            var queryOptions = '$filter=EntityTypeID%20Eq%208211'
            var format = '$format=json';

            var sdsRequest = 'http://spatial.virtualearth.net/REST/v1/data/c2ae584bbccc4916a0acf75d1e6947b4/NavteqEU/NavteqPOIs?' +
                    spatialFilter + '&' +
                    select + '&' +
                    top + '&' +
                    queryOptions + '&' +
                    format + '&jsonp=nearbySchoolServiceCallback' + '&key=' + bingMapKey;

            var mapscript = document.createElement('script');
            mapscript.type = 'text/javascript';
            mapscript.src = sdsRequest;
            document.getElementById('schoolMapCanvas').appendChild(mapscript);
        }

        window.nearbySchoolServiceCallback = function (result) {
            map.setView({ zoom: 13, center: location});

            result = result.d

            map.entities.clear();
            var searchResults = result && result.results;
            if (searchResults) {
                if (searchResults.length === 0) {
                    window.alert('No results for the query');
                }
                else {
                    for (var i = 0; i < searchResults.length; i++) {
                        createMapPin(map, 'schoolMapCanvas', searchResults[i]);
                        createListItem($list, searchResults[i])
                    }
                }
            }
        }
        findNearByLocations(location)
    }

    function showFacilityMap(location) {
        var map = getMap('facilityMapCanvas')
        var $list = $('.maps .list div[data-tab-name=facility] ul')

        function findNearByLocations(location) {

            var spatialFilter = 'spatialFilter=nearby(' + location.latitude + ',' + location.longitude + ',50)';
            var select = '$select=EntityID,Latitude,Longitude,__Distance,DisplayName,AddressLine,Phone';
            var top = '$top=100'
            var queryOptions = '$filter=EntityTypeID%20Eq%204013%20or%20EntityTypeID%20Eq%204017%20or%20EntityTypeID%20Eq%205400%20or%20EntityTypeID%20Eq%205800%20or%20EntityTypeID%20Eq%206000%20or%20EntityTypeID%20Eq%206512%20or%20EntityTypeID%20Eq%207011'
            var format = '$format=json';

            var sdsRequest = 'http://spatial.virtualearth.net/REST/v1/data/c2ae584bbccc4916a0acf75d1e6947b4/NavteqEU/NavteqPOIs?' +
                    spatialFilter + '&' +
                    select + '&' +
                    top + '&' +
                    queryOptions + '&' +
                    format + '&jsonp=nearbyFacilityServiceCallback' + '&key=' + bingMapKey;

            var mapscript = document.createElement('script');
            mapscript.type = 'text/javascript';
            mapscript.src = sdsRequest;
            document.getElementById('facilityMapCanvas').appendChild(mapscript);
        }

        window.nearbyFacilityServiceCallback = function (result) {
            map.setView({ zoom: 13, center: location});

            result = result.d

            map.entities.clear();
            var searchResults = result && result.results;
            if (searchResults) {
                if (searchResults.length === 0) {
                    window.alert('No results for the query');
                }
                else {
                    for (var i = 0; i < searchResults.length; i++) {
                        createMapPin(map, 'facilityMapCanvas', searchResults[i]);
                        createListItem($list, searchResults[i])
                    }
                }
            }
        }
        findNearByLocations(location)
    }

    function showSecurityMap(latlng) {
        var map = getMap('securityMapCanvas')
        map.setView({ zoom: 13, center: location});
        var pushpin = new Microsoft.Maps.Pushpin(location);
        map.entities.push(pushpin);
    }

    function createListItem($list, item) {
        var result = _.template($('#placeItem_template').html())({item: item})
        $list.append(result)
    }

    if (!window.team.isPhone()) {
         $('.maps .list div ul').slimScroll({
            height: '420px'
        });
    }


    $('.maps .list ul').click(function (event){
        // var tabName = $(event.currentTarget).closest('div[data-tab-name]').attr('data-tab-name')
        // var map = getMap(tabName + 'MapCanvas')

        // var $li = $(event.target).closest('li')
        // var location = new google.maps.LatLng($li.attr('data-lat'), $li.attr('data-lng'))

        // _.each(getMarkers(tabName + 'MapCanvas'), function (marker) {
        //     if (google.maps.geometry.spherical.computeDistanceBetween(marker.position, location) === 0.0) {
        //         map.setCenter(marker.getPosition());
        //         google.maps.event.trigger(marker,'click')
        //         return
        //     }
        // })

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
            var map = getMap(schoolMapId)

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


        findLocation()

        function onLocationFind(location) {
            window.report.location = location
            showTransitMap(location)
            showSchoolMap(location)
            showFacilityMap(location)
            showSecurityMap(location)
        }
    })
})();
