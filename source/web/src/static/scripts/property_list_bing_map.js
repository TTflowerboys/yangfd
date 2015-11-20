(function (module) {
        /*
    * Map View
    * */
    var bingMapKey = 'AhibVPHzPshn8-vEIdCx0so7vCuuLPSMK7qLP3gej-HyzvYv4GJWbc4_FmRvbh43'

    window.mapCache = {}
    window.mapPinCache = {}
    window.mapInfoBoxLayerCache = {}
    window.loadItemDetail = null

    window.getMap = function (mapId) {
        if (!window.mapCache[mapId]) {
            var map = new Microsoft.Maps.Map(document.getElementById(mapId), {credentials: bingMapKey});
            window.mapCache[mapId] = map

        }
        return window.mapCache[mapId]
    }

    module.activatePinAndInfoBox = function (id) {
        $('.customPushPin[data-id=' + id + ']').addClass('active')
        $('.houseInfobox[data-id=' + id + ']').addClass('active')
    }

    module.clickPinAndInfoBox = function (id) {
        $('.customPushPin').removeClass('clicked')
        $('.houseInfobox').removeClass('clicked')
        $('.customPushPin[data-id=' + id + ']').addClass('clicked')
        $('.houseInfobox[data-id=' + id + ']').addClass('clicked')
    }

    module.deactivatePinAndInfoBox = function (id) {
        $('.customPushPin[data-id=' + id + ']').removeClass('active')
        $('.houseInfobox[data-id=' + id + ']').removeClass('active')
    }

    function createMapPin(map, layer, mapId, result) {
        if (result && result.latitude && result.longitude) {
            var location = new Microsoft.Maps.Location(result.latitude, result.longitude);
            var pin = new Microsoft.Maps.Pushpin(location, {htmlContent: '<div class="customPushPin"  data-id="' + result.id + '"></div>', width: 30, height: 45});

            layer.push(pin)
            Microsoft.Maps.Events.addHandler(pin, 'click', function () {
                showInfoBox(map, mapId, result)
                module.clickPinAndInfoBox(result.id)
            });
            Microsoft.Maps.Events.addHandler(pin, 'mouseover', function () {
                module.activatePinAndInfoBox(result.id)
            });
            Microsoft.Maps.Events.addHandler(pin, 'mouseout', function () {
                module.deactivatePinAndInfoBox(result.id)
            });
            window.mapPinCache[result.id] = pin
        }
    }


    function showInfoBox(map, mapId, result) {
        if (window.mapInfoBoxLayerCache[result.id]) {
            return window.mapInfoBoxLayerCache[result.id].setOptions({visible: true})
        }
        var location = new Microsoft.Maps.Location(result.latitude, result.longitude);
        var layer = new Microsoft.Maps.EntityCollection()
        window.mapInfoBoxLayerCache[result.id] = layer
        var infoboxOptions = null
        if (window.team.isPhone()) {
            infoboxOptions = {offset:new Microsoft.Maps.Point(-90,50) };
        }
        else {
            infoboxOptions = {offset:new Microsoft.Maps.Point(-160,50) };
        }
        var infobox = new Microsoft.Maps.Infobox(location, infoboxOptions);
        window.loadItemDetail(result, function (html) {
            infobox.setHtmlContent(html)
            layer.push(infobox)
            layer.setOptions({ visible: true });
            map.entities.push(layer);
            ajustMapPosition(map, layer.get(0), location)
        })
    }
    window.hideInfoBox = function hideInfoBox(id) {
        if (!_.isEmpty(window.mapInfoBoxLayerCache[id])) {
            window.mapInfoBoxLayerCache[id].setOptions({visible: false})
        }
    }

    //http://stackoverflow.com/questions/11148042/bing-maps-invoke-click-event-on-pushpin
    function ajustMapPosition(map, infobox, location) {

        var buffer = 70;
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

            dy = map.getHeight() - infoboxLocation.y + infoboxAnchor.y;
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
            dx = map.getWidth() - infoboxLocation.x + infoboxAnchor.x - infobox.getWidth() / 2;
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

    function updateMapResults(map, mapId, searchResults) {
        var layer = new Microsoft.Maps.EntityCollection()
        for (var i = 0; i < searchResults.length; i++) {
            createMapPin(map, layer, mapId, searchResults[i]);
        }
        map.entities.push(layer)
    }

    function getBestMapOptions(locations, mapWidth, mapHeight) {
        var center = new Microsoft.Maps.Location();
        var zoomLevel = 0;

        var maxLat = -85;
        var minLat = 85;
        var maxLon = -180;
        var minLon = 180;

        //calculate bounding rectangle
        for (var i = 0; i < locations.length; i++)
        {
            if (locations[i].latitude > maxLat)
            {
                maxLat = locations[i].latitude;
            }

            if (locations[i].latitude < minLat)
            {
                minLat = locations[i].latitude;
            }

            if (locations[i].longitude > maxLon)
            {
                maxLon = locations[i].longitude;
            }

            if (locations[i].longitude < minLon)
            {
                minLon = locations[i].longitude;
            }
        }

        center.latitude = (maxLat + minLat) / 2;
        center.longitude = (maxLon + minLon) / 2;

        var zoom1=0, zoom2=0;

        //Determine the best zoom level based on the map scale and bounding coordinate information
        if (maxLon !== minLon && maxLat !== minLat)
        {
            //best zoom level based on map width
            zoom1 = Math.log(360.0 / 256.0 * mapWidth / (maxLon - minLon)) / Math.log(2);
            //best zoom level based on map height
            zoom2 = Math.log(180.0 / 256.0 * mapHeight / (maxLat - minLat)) / Math.log(2);
        }

        //use the most zoomed out of the two zoom levels
        zoomLevel = Math.round((zoom1 < zoom2) ? zoom1 : zoom2);
        if (zoomLevel > 0) {
            zoomLevel = zoomLevel - 1; //left more around margin
        }else {
            zoomLevel = 13 //Default zoom level is 10
        }
        return {zoom:zoomLevel , center:center}

    }

    module.loadMapPins = function (array, itemFunc) {
        window.loadItemDetail = itemFunc
        var mapId = 'mapCanvas'
        var map = window.getMap(mapId)
        map.entities.clear();
        updateMapResults(map, mapId, array)

        var locations = []
        _.each(array, function (property) {
            if(property.latitude && property.longitude) {
                var location = new Microsoft.Maps.Location(property.latitude, property.longitude)
                locations.push(location)
            }
        })
        map.setView(getBestMapOptions(locations, $('#' + mapId).width(), $('#' + mapId).height()))
        $('html, body').animate({scrollTop: $('#' + mapId).offset().top - 60 }, 'fast')
    }

    module.clearMapPins = function () {
        var mapId = 'mapCanvas'
        var map = window.getMap(mapId)
        map.entities.clear();
    }
    $('#mapCanvas').on('contextmenu', function (e) {
        e.preventDefault()
    })
})(window.currantModule = window.currantModule || {})
