(function () {
    var bingMapKey = 'AhibVPHzPshn8-vEIdCx0so7vCuuLPSMK7qLP3gej-HyzvYv4GJWbc4_FmRvbh43'

    window.mapCache = {}
    window.mapPinCache = {}
    window.mapInfoBoxLayerCache = {}

    window.getMap = function (mapId) {
        if (!window.mapCache[mapId]) {
            window.mapCache[mapId] = new Microsoft.Maps.Map(document.getElementById(mapId), {credentials: bingMapKey});
        }
        return window.mapCache[mapId]
    }

    function createMapPin(map, layer, mapId, result) {
        if (result && result.latitude && result.longitude) {
            var location = new Microsoft.Maps.Location(result.latitude, result.longitude);
            var pin = new Microsoft.Maps.Pushpin(location, {icon: '/static/images/property_details/icon-location-building.png', width: 30, height: 45});

            layer.push(pin)
             Microsoft.Maps.Events.addHandler(pin, 'click', function () { showInfoBox(map, mapId, result) });
            if  (!window.mapPinCache[mapId]) {
                window.mapPinCache[mapId] = []
            }
            window.mapPinCache[mapId].push(pin)
        }
    }


    function showInfoBox(map, mapId, result) {
        if (window.mapInfoBoxLayerCache[mapId]) {
            map.entities.remove(window.mapInfoBoxLayerCache[mapId]);
        }
        var location = new Microsoft.Maps.Location(result.latitude, result.longitude);
        var layer = new Microsoft.Maps.EntityCollection()
        var infoboxOptions = null
        if (window.team.isPhone()) {
            infoboxOptions = {offset:new Microsoft.Maps.Point(-90,50) };
        }
        else {
            infoboxOptions = {offset:new Microsoft.Maps.Point(-160,50) };
        }
        var infobox = new Microsoft.Maps.Infobox(location, infoboxOptions);
        $.betterPost('/api/1/rent_ticket/'+result.id)
            .done(function (val) {
                if (!_.isEmpty(val)) {

                    var houseResult = _.template($('#houseInfobox_template').html())({rent: val})
                    infobox.setHtmlContent(houseResult)

                    layer.push(infobox)
                    layer.setOptions({ visible: true });
                    map.entities.push(layer);
                    ajustMapPosition(map, layer.get(0), location)
                    window.mapInfoBoxLayerCache[mapId] = layer
                }
            }).fail(function () {

            }).always(function () {

            })
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
        }
        return {zoom:zoomLevel , center:center}

    }

    function updateMap() {
        var mapId = 'mapCanvas'
        var map = window.getMap(mapId)
        map.entities.clear();
        updateMapResults(map, mapId, window.rentMapList)

        var locations = []
        _.each(window.rentMapList, function (rent) {
            if(rent.latitude && rent.longitude){
                var location = new Microsoft.Maps.Location(rent.latitude, rent.longitude)
                locations.push(location)
            }
        })
        map.setView(getBestMapOptions(locations, $('#' + mapId).width(), $('#' + mapId).height()))
        $('html, body').animate({scrollTop: $('#' + mapId).offset().top - 60 }, 'fast')
    }

    $('[data-tabs]').tabs({trigger: 'click'}).on('openTab', function (event, target, tabName) {
        if (tabName === 'map') {

            if (typeof Microsoft === 'undefined'){
                var scriptString = '<script src="http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&onscriptload=onBingMapScriptLoad"></script>'
                window.onBingMapScriptLoad = function () {
                    if (typeof Microsoft === 'undefined') {
                        window.alert(window.i18n('地图加载失败'))
                    }else{
                        loadRentList()
                    }
                }
                $('body').append(scriptString)
            }else{
                loadRentList()
            }


        }
    })

    $('.tabSelector_phone').click(function (e) {
        var currentTab = $(this).attr('data-tab')
        var $tabContainer = $('[data-tabs]')
        var tabName = ''
        var $tabContents = null

        if (currentTab === 'list'){
            //to show map
            tabName = 'map'
            $tabContents = $tabContainer.find('[data-tab-name=' + tabName + ']')
            $tabContents.addClass('selectedTab').show()
            $tabContents.siblings().removeClass('selectedTab').hide()
            $tabContainer.trigger('openTab', [$('.tabSelector [tab-name=' + tabName + ']'), tabName])
            $(this).attr('data-tab', 'map')
        }
        else {
            //to show list
            tabName = 'list'
            $tabContents = $tabContainer.find('[data-tab-name=' + tabName + ']')
            $tabContents.addClass('selectedTab').show()
            $tabContents.siblings().removeClass('selectedTab').hide()
            $tabContainer.trigger('openTab', [$('.tabSelector [tab-name=' + tabName + ']'), tabName])
            $(this).attr('data-tab', 'list')
        }
    })


    function loadRentList() {
        var params = {'location_only': 1}
        var country = $('select[name=propertyCountry]').children('option:selected').val()
        if (country) {
            params.country = country
        }
        var city = $('select[name=propertyCity]').children('option:selected').val()
        if (city) {
            params.city = city
        }
        var propertyType = $('select[name=propertyType]').children('option:selected').val()
        if (propertyType) {
            params.property_type = propertyType
        }
        var rentType = $('select[name=rentType]').children('option:selected').val()
        if (rentType) {
            params.rent_type = rentType
        }

        var rentBudgetType = getSelectedTagFilterDataId('#rentBudgetTag')
        if (rentBudgetType) {
            params.rent_budget = rentBudgetType
        }

        var rentPeriod = getSelectedTagFilterDataId('#rentPeriodTag')
        if (rentPeriod) {
            params.rent_period = rentPeriod
        }
        var bedroomCount = getSelectedTagFilterDataId('#bedroomCountTag')
        if (bedroomCount) {
            params.bedroom_count = bedroomCount
        }
        var space = getSelectedTagFilterDataId('#spaceTag')
        if (space) {
            params.space = space
        }

        $.betterPost('/api/1/rent_ticket/search', params)
            .done(function (val) {
                var array = val
                if (!_.isEmpty(array)) {
                    
                    window.rentMapList = array

                    updateMap()
                }
            }).fail(function () {

            }).always(function () {

            })
    }

    function getSelectedTagFilterDataId(tag) {
        var $selectedChild = $('#tags ' + tag).children('.selected')
        if ($selectedChild.length) {
            return $selectedChild.first().attr('data-id')
        }
        return ''
    }
})()
