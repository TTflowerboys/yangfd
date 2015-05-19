(function () {
    var bingMapKey = 'AhibVPHzPshn8-vEIdCx0so7vCuuLPSMK7qLP3gej-HyzvYv4GJWbc4_FmRvbh43'
    var googleApiKey = 'AIzaSyCXOb8EoLnYOCsxIFRV-7kTIFsX32cYpYU'

    window.setupMap = function (location, onMapScriptLoadCallback) {
        var lat = location.latitude
        var lng = location.longitude
        var width = window.team.isPhone()? $('.staticMap').width(): 800
        var height = window.team.isPhone()? 240: 480

        var staticImgUrl = 'http://dev.virtualearth.net/REST/V1/Imagery/Map/Road/'+ lat + '%2C' + lng +'/13?mapSize=' + width + ',' + height + '&format=png&pushpin='+ lat +','+ lng +';64;&key=' + bingMapKey
        $('#mapImg').attr('src', staticImgUrl)
        onMapScriptLoadCallback()
    }

    var indicatorCounter = 0
    window.showMapIndicator = function () {
        indicatorCounter++
        if (indicatorCounter) {
            $('#mapLoadIndicator').show()
        }
    }

    window.hideMapIndicator = function() {
        indicatorCounter--
        if (indicatorCounter <= 0) {
            $('#mapLoadIndicator').hide()
        }
    }


    window.mapCache = {}
    window.mapPinCache = {}
    window.mapInfoBoxLayerCache = {}

    window.getMap = function (mapId) {
        if (!window.mapCache[mapId]) {
            window.mapCache[mapId] = new Microsoft.Maps.Map(document.getElementById(mapId), {credentials: bingMapKey});
        }
        return window.mapCache[mapId]
    }

    function getMapPinIconHtml(typeID) {
        var $icon = $('#icon-location-' + typeID)
        if ($icon.length === 0) {
            $icon = $('#icon-location-item')
        }
        return $icon.prop('outerHTML')
    }

    function createMapPin(map, layer, mapId, result) {
        if (result) {
            var location = new Microsoft.Maps.Location(result.Latitude, result.Longitude);
            var typeID = result.EntityTypeID;
            var pin = new Microsoft.Maps.Pushpin(location, {htmlContent:getMapPinIconHtml(typeID)});
            Microsoft.Maps.Events.addHandler(pin, 'click', function () { showInfoBox(map, mapId, result) });
            layer.push(pin)
            if  (!window.mapPinCache[mapId]) {
                window.mapPinCache[mapId] = []
            }
            window.mapPinCache[mapId].push(pin)
        }
    }

    function createMapCenterPin(map, location) {
        //http://msdn.microsoft.com/en-us/library/ff701719.aspx
        var layer = new Microsoft.Maps.EntityCollection()
        var pin = new Microsoft.Maps.Pushpin(location, {icon: '/static/images/property_details/icon-location-building.png', width: 30, height: 45});
        layer.push(pin)
        map.entities.push(layer)
    }

    function showInfoBox(map, mapId, result) {
        if (window.mapInfoBoxLayerCache[mapId]) {
            map.entities.remove(window.mapInfoBoxLayerCache[mapId]);
        }
        var location = new Microsoft.Maps.Location(result.Latitude, result.Longitude);
        var decription = [];
        var layer = new Microsoft.Maps.EntityCollection()
        decription.push(window.i18n('地址') + ':' + result.AddressLine + '<br/>');
        decription.push(window.i18n('电话') + ':' + result.Phone + '<br/>');
        decription.push(window.i18n('类型') + ':' + result.Type + '<br/>');
        var infobox = new Microsoft.Maps.Infobox(location, { title: result.DisplayName, description: decription.join(' '), showPointer: true});
        layer.push(infobox)
        layer.setOptions({ visible: true });
        map.entities.push(layer);
        ajustMapPosition(map, layer.get(0), location)
        window.mapInfoBoxLayerCache[mapId] = layer
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

    function findNearByLocations(map, mapId, location, country, typeIds, callback) {

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
        var apiPrefix = country === 'US'? 'http://spatial.virtualearth.net/REST/v1/data/f22876ec257b474b82fe2ffcb8393150/NavteqNA/NavteqPOIs': 'http://spatial.virtualearth.net/REST/v1/data/c2ae584bbccc4916a0acf75d1e6947b4/NavteqEU/NavteqPOIs'
        var sdsRequest =  apiPrefix + '?' +
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
            result = result.d

            map.entities.clear();
            var searchResults = result && result.results;
            callback(searchResults)
        }
    }

    function updateMapResults(map, mapId, $list, searchResults) {
        var resultDic = {}
        var typeIds = []
        var typeId = ''
        var layer = new Microsoft.Maps.EntityCollection()
        for (var i = 0; i < searchResults.length; i++) {
            typeId = searchResults[i].EntityTypeID
            if (!resultDic[typeId]) {
                resultDic[typeId] = []
                typeIds.push(typeId)
            }
            resultDic[typeId].push(searchResults[i])
            createMapPin(map, layer, mapId, searchResults[i]);
        }
        map.entities.push(layer)

        typeIds.sort()
        for (var j = 0; j < typeIds.length; j++) {
            typeId = typeIds[j]
            var index = 0;

            var sectionHtml = ''
            for (var k = 0; k < resultDic[typeId].length; k++) {
                var oneResult = resultDic[typeId][k]
                if (index === 0) {
                    sectionHtml += '<div class="ioslist-group-container"><div class="ioslist-group-header">'+ window.getBingMapEntityType(typeId)  + '</div><ul>'
                }
                oneResult.Type = window.getBingMapEntityType(typeId)
                oneResult.Hint = oneResult.__Distance.toFixed(2) + 'km'
                sectionHtml += _.template($('#placeItem_template').html())({item: oneResult})

                if (index === resultDic[typeId].length - 1) {
                    sectionHtml += '</ul></div>'
                    $list.append(sectionHtml)
                }

                index = index + 1
            }
        }
    }

    window.showTransitMap = function (location, polygon, showCenter, zoom, country, callback) {
        var mapId = 'transitMapCanvas'
        var map = window.getMap('transitMapCanvas')
        var $list = $('.maps .list div[data-tab-name=transit]')
        Microsoft.Maps.Events.addHandler(map, 'mousewheel', function(e) {
            e.handled = true;
            return true;
        });

        // Microsoft.Maps.loadModule('Microsoft.Maps.Traffic', {callback: function () {
        //var trafficLayer = new Microsoft.Maps.Traffic.TrafficLayer(map);
        //trafficLayer.show();
        //var trafficManager = new Microsoft.Maps.Traffic.TrafficManager(map);
        //trafficManager.show()
        // }});

        /*
        * POI Entity Types
        * 4013 - Train Station
        * 4170 - Bus Station
        * 4100 - Commuter Rail Station
        * 4482 - Ferry Terminal
        * 4580 - Public Sports Airport
        * 4581 - Airport
        * 4493 - Marina
        * */
        findNearByLocations(map, mapId, location, country, ['4013', '4100', '4170', '4482', '4493', '4580', '4581', '9511', '9520', '9707', '9708', '9989'], function (searchResults) {
            if (searchResults&&searchResults.length > 0) {
                updateMapResults(map, mapId, $list, searchResults)
                $list.ioslist()
            }
            //TODO:Hide this tab

            map.setView({zoom: zoom? zoom:13, center: location})

            if (polygon) {
                map.entities.push(polygon)
            }

            if (showCenter) {
                createMapCenterPin(map, location)
            }
            callback()
        })
    }

    window.showSchoolMap = function(location, polygon, showCenter, zoom, country, callback) {
        var mapId = 'schoolMapCanvas'
        var map = window.getMap('schoolMapCanvas')
        var $list = $('.maps .list div[data-tab-name=school]')
        Microsoft.Maps.Events.addHandler(map, 'mousewheel', function(e) {
            e.handled = true;
            return true;
        });

        findNearByLocations(map, mapId, location, country, ['8211', '8200'], function (searchResults) {
            if (searchResults&&searchResults.length > 0) {
                updateMapResults(map, mapId, $list, searchResults)
                $list.ioslist()
            }
            //TODO:Hide this tab

            map.setView({zoom: zoom? zoom:13, center: location})
            if (polygon) {
                map.entities.push(polygon)
            }
            if (showCenter) {
                createMapCenterPin(map, location)
            }
            callback()
        })
    }

    window.showFacilityMap = function(location, polygon, showCenter, zoom, country, callback) {
        var mapId = 'facilityMapCanvas'
        var map = window.getMap('facilityMapCanvas')
        var $list = $('.maps .list div[data-tab-name=facility]')
        Microsoft.Maps.Events.addHandler(map, 'mousewheel', function(e) {
            e.handled = true;
            return true;
        });

        findNearByLocations(map, mapId, location, country, ['4017', '5400', '5540', '5800', '6000', '6512', '7011', '7832', '7997', '8060', '8231', '9221', '9504', '9505', '9510', '9523', '9530', '9539'], function (searchResults) {
            if (searchResults&&searchResults.length > 0) {
                updateMapResults(map, mapId, $list, searchResults)
                $list.ioslist()
            }
            //TODO:Hide this tab

            map.setView({zoom: zoom? zoom:13, center: location})
            if (polygon) {
                map.entities.push(polygon)
            }
            if (showCenter) {
                createMapCenterPin(map, location)
            }
            callback()
        })
    }

    /*function showSecurityMap(location, polygon) {
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
       }*/

    //Data source https://www.google.com/fusiontables/DataSource?docid=1jgWYtlqGSPzlIa-is8wl1cZkVIWEm_89rWUwqFU#card:id=2
    window.getRegion = function(zipCodeIndex, callback) {
        Microsoft.Maps.loadModule('Microsoft.Maps.AdvancedShapes', {
            callback:  function () {
                var originalURL = 'https://www.googleapis.com/fusiontables/v2/query?sql=SELECT \'Area data\', \'Postcode district\' FROM 1jgWYtlqGSPzlIa-is8wl1cZkVIWEm_89rWUwqFU WHERE \'Postcode district\' = \'' + zipCodeIndex +'\'&key=' + googleApiKey;
                var url = '/reverse_proxy?link=' + encodeURIComponent(originalURL)
                var polygon = null
                $.get(url)
                            .done(function (data) {
                                if (data) {
                                    var json = JSON.parse(data)
                                    var results = []
                                    if (json.rows && json.rows[0] && json.rows[0][0] &&json.rows[0][0].geometries && json.rows[0][0].geometries.length) {
                                        _.each(json.rows[0][0].geometries, function (item){
                                            var coordinates = item.coordinates[0]
                                            var coorResults = []

                                            _.each(coordinates, function (coor) {
                                                var lat = coor[1]
                                                var lng = coor[0]
                                                coorResults.push(new Microsoft.Maps.Location(lat, lng))
                                            })
                                            results.push(coorResults)
                                        })


                                        //var strokeColor = new Microsoft.Maps.Color(255, 68, 68, 68);
                                        polygon = new Microsoft.Maps.Polygon(results,{ fillColor: new Microsoft.Maps.Color(100, 68, 68, 68)});
                                    }
                                    else if (json.rows && json.rows[0] && json.rows[0][0] &&json.rows[0][0].geometry && json.rows[0][0].geometry  && json.rows[0][0].geometry.coordinates && json.rows[0][0].geometry.coordinates.length) {
                                        _.each(json.rows[0][0].geometry.coordinates, function (item){
                                            var coordinates = item
                                            var coorResults = []

                                            _.each(coordinates, function (coor) {
                                                var lat = coor[1]
                                                var lng = coor[0]
                                                coorResults.push(new Microsoft.Maps.Location(lat, lng))
                                            })
                                            results.push(coorResults)
                                        })

                                        //var strokeColor = new Microsoft.Maps.Color(255, 68, 68, 68);
                                        polygon = new Microsoft.Maps.Polygon(results,{ fillColor: new Microsoft.Maps.Color(100, 68, 68, 68)});
                                    }
                                }
                            })
                            .fail(function (ret) {
                            })
                            .always(function (data) {
                                callback(polygon)
                            })
            }
        });
    }

    $('.maps .list >div').click(function (event){
        var tabName = $(event.currentTarget).closest('div[data-tab-name]').attr('data-tab-name')
        //var map = getMap(tabName + 'MapCanvas')

        var $li = $(event.target).closest('li')
        if ($li.attr('data-type') === 'placeItem') {
            var lat = String($li.attr('data-lat'))
            var lng = String($li.attr('data-lng'))

            _.each(window.mapPinCache[tabName + 'MapCanvas'], function (pin) {
                var location = pin._location
                if (lat === String(location.latitude) && lng === String(location.longitude)) {
                    Microsoft.Maps.Events.invoke(pin, 'click');
                    return
                }

            })
        }
    })
})()
