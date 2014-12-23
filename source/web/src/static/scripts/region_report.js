(function () {

    function getData(key) {
        return JSON.parse(document.getElementById(key).innerHTML)
    }

    window.report = getData('dataReport')

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

    var bingMapKey = 'AhibVPHzPshn8-vEIdCx0so7vCuuLPSMK7qLP3gej-HyzvYv4GJWbc4_FmRvbh43'
    var googleApiKey = 'AIzaSyCXOb8EoLnYOCsxIFRV-7kTIFsX32cYpYU'

    window.mapCache = {}
    window.mapPinCache = {}
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

            if  (!window.mapPinCache[mapId]) {
                window.mapPinCache[mapId] = []

            }
            window.mapPinCache[mapId].push(pin)
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
        decription.push(window.i18n('类型') + ':' + result.Hint + '<br/>');
        window.mapInfoBoxCache[mapId] = new Microsoft.Maps.Infobox(location, { title: result.DisplayName, description: decription.join(' '), showPointer: true});

        window.mapInfoBoxCache[mapId].setOptions({ visible: true });
        map.entities.push(window.mapInfoBoxCache[mapId]);

        ajustMapPosition(map, window.mapInfoBoxCache[mapId], location)
    }

    //http://stackoverflow.com/questions/11148042/bing-maps-invoke-click-event-on-pushpin
    function ajustMapPosition(map, infobox, location) {

        var buffer = 50;
        var infoboxOffset = infobox.getOffset();
        var infoboxAnchor = infobox.getAnchor();
        var infoboxLocation = map.tryLocationToPixel(location, Microsoft.Maps.PixelReference.control);
        var dx = infoboxLocation.x + infoboxOffset.x - infoboxAnchor.x;
        var dy = infoboxLocation.y - 25 - infoboxAnchor.y;

        if (dy < buffer) { //Infobox overlaps with top of map.
            //#### Offset in opposite direction.
            dy *= -1;
            //#### add buffer from the top edge of the map.
            dy += buffer;
        } else {
            //#### If dy is greater than zero than it does not overlap.

            dy = map.getHeight() - infoboxLocation.y + infoboxAnchor.y - infobox.getHeight();
            if (dy > buffer) {
                dy = 0;
            } else {
                dy -= buffer;
            }
        }

        if (dx < buffer) { //Check to see if overlapping with left side of map.
            //#### Offset in opposite direction.
            dx *= -1;
            //#### add a buffer from the left edge of the map.
            dx += buffer;
        } else { //Check to see if overlapping with right side of map.
            dx = map.getWidth() - infoboxLocation.x + infoboxAnchor.x - infobox.getWidth();
            //#### If dx is greater than zero then it does not overlap.
            if (dx > buffer) {
                dx = 0;
            } else {
                //#### add a buffer from the right edge of the map.
                dx -= buffer;
            }
        }

        //#### Adjust the map so infobox is in view
        if (dx !== 0 || dy !== 0) {
            map.setView({
                centerOffset: new Microsoft.Maps.Point(dx, dy),
                center: map.getCenter()
            });
        }
    }

    function findNearByLocations(map, mapId, location, typeIds, callback) {

        //http://msdn.microsoft.com/en-us/library/hh478191.aspx
        var spatialFilter = 'spatialFilter=nearby(' + location.latitude + ',' + location.longitude + ',10)';
        var select = '$select=EntityID,Latitude,Longitude,__Distance,DisplayName,AddressLine,Phone,EntityTypeID';
        var top = '$top=200'
        var queryOptions = '$filter='
        var index = 0;
        _.each(typeIds, function (typeId) {
            if (index === 0) {
                queryOptions = queryOptions + 'EntityTypeID%20Eq%20' + typeId
            }
            else {
                queryOptions = queryOptions + '%20or%20EntityTypeID%20Eq%20' + typeId
            }
            index = index + 1
        })

        var format = '$format=json';

        var sdsRequest = 'http://spatial.virtualearth.net/REST/v1/data/c2ae584bbccc4916a0acf75d1e6947b4/NavteqEU/NavteqPOIs?' +
                spatialFilter + '&' +
                select + '&' +
                top + '&' +
                queryOptions + '&' +
                format + '&jsonp=' + mapId + 'ServiceCallBack' + '&key=' + bingMapKey;

        var mapscript = document.createElement('script');
        mapscript.type = 'text/javascript';
        mapscript.src = sdsRequest;
        document.getElementById(mapId).appendChild(mapscript);

        window[mapId + 'ServiceCallBack'] = function (result) {
            map.setView({ zoom: 13, center: location});

            result = result.d

            map.entities.clear();
            var searchResults = result && result.results;
            callback(searchResults)
        }
    }

    function showTransitMap(location, polygon) {
        var mapId = 'transitMapCanvas'
        var map = getMap('transitMapCanvas')
        var $list = $('.maps .list div[data-tab-name=transit] ul')

        Microsoft.Maps.loadModule('Microsoft.Maps.Traffic', { callback: trafficModuleLoaded });
        function trafficModuleLoaded()
        {
            map.entities.clear()
            map.setView({zoom: 13, center: location})
            var trafficLayer = new Microsoft.Maps.Traffic.TrafficLayer(map);
            trafficLayer.show();
        }

        findNearByLocations(map, mapId, location, ['4013', '4170','4482', '4493', '4580', '4581', '9511', '9520', '9707', '9708', '9989'], function (searchResults) {
             if (searchResults) {
                if (searchResults.length === 0) {
                    window.alert('No results for the query');
                }
                else {
                    for (var i = 0; i < searchResults.length; i++) {
                        createMapPin(map, mapId, searchResults[i]);
                        searchResults[i].Hint = window.getBingMapEntityType(searchResults[i].EntityTypeID)
                        //searchResults[i].Number = searchResults[i].__Distance.toFixed(2) + 'km'
                        createListItem($list, searchResults[i])
                    }
                }
             }

            if (polygon) {
                map.entities.push(polygon)
            }
        })
    }

    function showSchoolMap(location, polygon) {
        var mapId = 'schoolMapCanvas'
        var map = getMap('schoolMapCanvas')
        var $list = $('.maps .list div[data-tab-name=school] ul')

        findNearByLocations(map, mapId, location, ['8211', '8200'], function (searchResults) {
             if (searchResults) {
                if (searchResults.length === 0) {
                    window.alert('No results for the query');
                }
                else {
                    for (var i = 0; i < searchResults.length; i++) {
                        createMapPin(map, mapId, searchResults[i]);
                        searchResults[i].Hint = window.getBingMapEntityType(searchResults[i].EntityTypeID)
                        //searchResults[i].Number = searchResults[i].__Distance.toFixed(2) + 'km'
                        createListItem($list, searchResults[i])
                    }
                }
             }
            map.setView({zoom: 13, center: location})
            if (polygon) {
                map.entities.push(polygon)
            }
        })
    }

    function showFacilityMap(location, polygon) {
        var mapId = 'facilityMapCanvas'
        var map = getMap('facilityMapCanvas')
        var $list = $('.maps .list div[data-tab-name=facility] ul')

        findNearByLocations(map, mapId, location, ['4017', '5400', '5540', '5800', '6000', '6512', '7011', '7832', '7997', '8060', '8231', '9221', '9504', '9505', '9510', '9523', '9530', '9539'], function (searchResults) {
            if (searchResults) {
                if (searchResults.length === 0) {
                    window.alert('No results for the query');
                }
                else {
                    for (var i = 0; i < searchResults.length; i++) {
                        createMapPin(map, mapId, searchResults[i]);
                        searchResults[i].Hint = window.getBingMapEntityType(searchResults[i].EntityTypeID)
                        //searchResults[i].Number = searchResults[i].__Distance.toFixed(2) + 'km'
                        createListItem($list, searchResults[i])
                    }
                }
            }
            map.setView({zoom: 13, center: location})
            if (polygon) {
                map.entities.push(polygon)
            }
        })
    }

    function showSecurityMap(location, polygon) {
        var map = getMap('securityMapCanvas')
        var $list = $('.maps .list div[data-tab-name=security] ul')
        var pushpin = new Microsoft.Maps.Pushpin(location);
        map.entities.push(pushpin);

        map.setView({zoom: 13, center: location})
        if (polygon) {
            map.entities.push(polygon)
        }

        var results = {}

        var itemsPromise = $.betterGet('/api/1/report/policeuk', {lat:location.latitude, lng:location.longitude})
                .done(function (data) {
                    results.items = data
                })
        var categoryPromise = $.betterGet('/api/1/report/policeuk/categories')
                .done(function (data) {
                    results.categories = data
                })
        $.when(itemsPromise, categoryPromise)
            .done(function () {
                var categoryDic = {}
                _.each(results.categories, function (item) {
                    categoryDic[item.url] = item.name
                })
                var categories = {}
                _.each(results.items, function (item) {
                    if (categories[item.category]) {
                        categories[item.category] = categories[item.category] + 1
                    }
                    else {
                        categories[item.category] = + 1
                    }
                })

                var categoryItem = {}
                for (var key in categories) {
                    categoryItem.Hint = categories[key] + window.i18n('起')
                    categoryItem.DisplayName = categoryDic[key]
                    createListItem($list, categoryItem)
                }

            })
    }

    function createListItem($list, item) {
        var result = _.template($('#placeItem_template').html())({item: item})
        $list.append(result)
    }

    function getRegion(zipCodeIndex, callback) {
        Microsoft.Maps.loadModule('Microsoft.Maps.AdvancedShapes', {
            callback:  function () {
                var originalURL = 'https://www.googleapis.com/fusiontables/v2/query?sql=SELECT \'Area data\', \'Postcode district\' FROM 1jgWYtlqGSPzlIa-is8wl1cZkVIWEm_89rWUwqFU WHERE \'Postcode district\' = \'' + zipCodeIndex +'\'&key=' + googleApiKey;
                var url = '/reverse_proxy?link=' + encodeURIComponent(originalURL)
                $.get(url)
                    .done(function (data) {
                        if (data) {
                            var json = JSON.parse(data)
                            if (json.rows && json.rows[0] && json.rows[0][0] &&json.rows[0][0].geometries && json.rows[0][0].geometries.length) {
                                var polygonArray = json.rows[0][0].geometries
                                var results = []
                                _.each(polygonArray, function (item){
                                    var coordinates = item.coordinates[0]
                                    var coorResults = []

                                    _.each(coordinates, function (coor) {
                                        var lat = coor[1]
                                        var lng = coor[0]
                                        coorResults.push(new Microsoft.Maps.Location(lat, lng))
                                    })
                                    results.push(coorResults)
                                })

                                var fillColor = new Microsoft.Maps.Color(100, 68, 68, 68)
                                //var strokeColor = new Microsoft.Maps.Color(255, 68, 68, 68);
                                var polygon = new Microsoft.Maps.Polygon(results,{ fillColor: fillColor});
                                callback(polygon)
                            }
                        }
                    })
                    .fail(function (ret) {
                        callback(null)
                    })
            }
        });
    }

    if (!window.team.isPhone()) {
        $('.maps .list div ul').slimScroll({
            height: '420px'
        });
    }

    $('.maps .list ul').click(function (event){
        var tabName = $(event.currentTarget).closest('div[data-tab-name]').attr('data-tab-name')
        //var map = getMap(tabName + 'MapCanvas')

        var $li = $(event.target).closest('li')
        var lat = String($li.attr('data-lat'))
        var lng = String($li.attr('data-lng'))

        _.each(window.mapPinCache[tabName + 'MapCanvas'], function (pin) {
            var location = pin._location
            if (lat === String(location.latitude) && lng === String(location.longitude)) {
                Microsoft.Maps.Events.invoke(pin, 'click');
                return
            }

        })
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

            //TODO: find why need get region for different map, may because for the delay after bing map load, or load bing map module for different map
            getRegion(zipCodeIndexFromURL, function (polygon) {
                showTransitMap(location, polygon)
            })
            getRegion(zipCodeIndexFromURL, function (polygon) {
                showSchoolMap(location, polygon)
            })
            getRegion(zipCodeIndexFromURL, function (polygon) {
                showFacilityMap(location, polygon)
            })
            getRegion(zipCodeIndexFromURL, function (polygon) {
                showSecurityMap(location, polygon)
            })
        }
    })
})();
