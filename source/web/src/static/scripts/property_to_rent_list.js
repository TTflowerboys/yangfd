(function () {
    var itemsPerPage = 5
    var lastItemTime
    var isLoading = false
    var isAllItemsLoaded = false
    var viewMode = 'list'

    // Init all filter options
    window.countryData = getData('countryData')
    window.cityData = getData('cityData')
    window.propertyCountryData = getData('propertyCountryData')
    window.propertyCityData = getData('propertyCityData')
    window.rentTypeData = getData('rentTypeData')
    window.rentBudgetData = getData('rentBudgetData')
    window.propertyTypeData = getData('propertyTypeData')
    window.rentPeriodData = getData('rentPeriodData')
    window.bedroomCountData = getData('bedroomCountData')
    window.spaceData = getData('spaceData')

    // Init top filters value from URL
    var countryFromURL = window.team.getQuery('country', location.href)
    if (countryFromURL) {
        selectCountry(countryFromURL)
    }

    var cityFromURL = window.team.getQuery('city', location.href)
    if (cityFromURL) {
        selectCity(cityFromURL)
    }

    var propertyTypeFromURL = window.team.getQuery('property_type', location.href)
    if (propertyTypeFromURL) {
        selectPropertyType(propertyTypeFromURL)

        selectTagFilter('#propertyTypeTag', propertyTypeFromURL)

        if (window.team.isPhone()) {
            showTagsOnMobile()
        }
    }

    var rentTypeFromURL = window.team.getQuery('rent_type', location.href)
    if (rentTypeFromURL) {
        selectRentType(rentTypeFromURL)
    }

    // Init side tag filters value from URL
    var rentBudgetFromURL = window.team.getQuery('rent_budget', location.href)
    if (rentBudgetFromURL) {
        selectTagFilter('#rentBudgetTag', rentBudgetFromURL)

        if (window.team.isPhone()) {
            showTagsOnMobile()
        }
    }

    var rentPeriodFromURL = window.team.getQuery('rent_period', location.href)
    if (rentPeriodFromURL) {
        selectTagFilter('#rentPeriodTag', rentPeriodFromURL)

        if (window.team.isPhone()) {
            showTagsOnMobile()
        }
    }

    var bedroomFromURL = window.team.getQuery('bedroom_count', location.href)
    if (bedroomFromURL) {
        selectTagFilter('#bedroomCountTag', bedroomFromURL)

        if (window.team.isPhone()) {
            showTagsOnMobile()
        }
    }

    var spaceFromURL = window.team.getQuery('space', location.href)
    if (spaceFromURL) {
        selectTagFilter('#spaceTag', spaceFromURL)

        if (window.team.isPhone()) {
            showTagsOnMobile()
        }
    }

    // Init load rent property list
    loadRentList()

    function getData(key) {
        return JSON.parse(document.getElementById(key).innerHTML)
    }

    // Update List/Map tab visibility
    window.updateTabSelectorVisibility = function (visible) {
        var tabSelectorKey = '.tabSelector'
        if (window.team.isPhone()) {
            tabSelectorKey += '_phone'
        }

        if (visible) {
            $(tabSelectorKey).show()
        }
        else {
            $(tabSelectorKey).hide()
        }
    }

    function getCurrentTotalCount() {
        return $('#result_list').children('.rentCard').length
    }

    function loadRentList(reload) {
        var params = {'per_page': itemsPerPage}
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

        var rentAvailableTime
        if($('[name=rentPeriodStartDate]').val()) {
            rentAvailableTime = new Date($('#rentPeriodStartDate').val()).getTime() / 1000
            if(rentAvailableTime) {
                params.rent_available_time = rentAvailableTime
            }
        }

        if (lastItemTime) {
            params.last_modified_time = lastItemTime
            //Load more triggered
            ga('send', 'event', 'rent_list', 'trigger', 'load-more')
        }

        if(reload){
            $('#result_list').empty()
            lastItemTime = null
            params.last_modified_time = null
        }
        $('#result_list_container').show()
        $('.emptyPlaceHolder').hide();

        if(!team.isPhone()){
            $('#number_container').text(window.i18n('加载中'))
            $('#number_container').show()
        }

        $('#loadIndicator').show()
        isLoading = true

        var totalResultCount = getCurrentTotalCount()
        $.betterPost('/api/1/rent_ticket/search', params)
            .done(function (val) {
                var array = val
                if (!_.isEmpty(array)) {
                    lastItemTime = _.last(array).last_modified_time

                    if (!window.rentList) {
                        window.rentList = []
                    }
                    window.rentList = window.rentList.concat(array)

                    _.each(array, function (rent) {
                        var houseResult = _.template($('#rentCard_template').html())({rent: rent})
                        $('#result_list').append(houseResult)

                        if (lastItemTime > rent.last_modified_time) {
                            lastItemTime = rent.last_modified_time
                        }
                    })
                    totalResultCount = getCurrentTotalCount()

                    isAllItemsLoaded = false
                } else {
                    isAllItemsLoaded = true
                }

            }).fail(function () {
        }).always(function () {
                updateResultCount(totalResultCount)
                $('#loadIndicator').hide()
                isLoading = false
                if (!window.team.isCurrantClient()) {
                    window.updateTabSelectorVisibility(true)
                }
            })
    }

    function updateResultCount(count) {
        var $numberContainer = $('#number_container')
        if (count) {
            //$number.text(count)

            if(!team.isPhone()){
                $numberContainer.text(window.i18n('共找到下列出租房'))
                $numberContainer.show()
            }
            $('#result_list_container').show()
            $('.emptyPlaceHolder').hide();
        } else {
            //$number.text(count)
            $('#result_list_container').hide()
            $('.emptyPlaceHolder').show();
            ga('send', 'event', 'rent_list', 'result', 'empty-result',
               $('.emptyPlaceHolder').find('textarea[name=description]').text())
        }
    }

    function loadRentListByView() {
        if(viewMode === 'list'){
            lastItemTime = null
            loadRentList(true)
        }else if(viewMode === 'map'){
            loadRentMapList()
        }
    }


    /*
     * All Interactions with top filters
     *
     * */
    var $countrySelect = $('select[name=propertyCountry]')
    $countrySelect.change(function () {
        ga('send', 'event', 'rent_list', 'change', 'select-country',
            $('select[name=propertyCountry]').children('option:selected').text())
        loadRentListByView()
    })

    var $citySelect = $('select[name=propertyCity]')
    $citySelect.change(function () {
        ga('send', 'event', 'rent_list', 'change', 'select-city',
            $('select[name=propertyCity]').children('option:selected').text())
        loadRentListByView()
    })

    var $propertyTypeSelect = $('select[name=propertyType]')
    $propertyTypeSelect.change(function () {
        ga('send', 'event', 'rent_list', 'change', 'select-proprty-type',
            $('select[name=propertyType]').children('option:selected').text())
        loadRentListByView()
    })

    var $rentTypeSelect = $('select[name=rentType]')
    $rentTypeSelect.change(function () {
        ga('send', 'event', 'rent_list', 'change', 'select-rent-type',
            $('select[name=rentType]').children('option:selected').text())
        loadRentListByView()
    })


    function selectCountry(id) {
        $('select[name=propertyCountry]').find('option[value=' + id + ']').prop('selected', true)
    }

    function selectCity(id) {
        $('select[name=propertyCity]').find('option[value=' + id + ']').prop('selected', true)
    }

    function selectPropertyType(id) {
        $('select[name=propertyType]').find('option[value=' + id + ']').prop('selected', true)
    }

    function selectRentType(id) {
        $('select[name=rentType]').find('option[value=' + id + ']').prop('selected', true)
    }


    /*
     * Interactions with side tag filters
     * */

    function selectTagFilter(tag, dataid) {
        var $item = $('#tags ' + tag).find('[data-id=' + dataid + ']')
        var $parent = $item.parent()
        $parent.find('.toggleTag').removeClass('selected')
        $item.addClass('selected')
    }

    function getSelectedTagFilterDataId(tag) {
        var $selectedChild = $('#tags ' + tag).children('.selected')
        if ($selectedChild.length) {
            return $selectedChild.first().attr('data-id')
        }
        return ''
    }

    $('#tags #propertyTypeTag').on('click', '.toggleTag', function (event) {
        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'rent_list', 'change', 'change-property-type', $item.text())
        loadRentListByView()
    })

    $('#tags #rentBudgetTag').on('click', '.toggleTag', function (event) {
        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'rent_list', 'change', 'change-rent-budget', $item.text())
        loadRentListByView()
    })

    $('#tags #rentPeriodTag').on('click', '.toggleTag', function (event) {
        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'rent_list', 'change', 'change-rent-period', $item.text())
        loadRentListByView()
    })

    $('#tags #bedroomCountTag').on('click', '.toggleTag', function (event) {
        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'rent_list', 'change', 'change-bedroomCount', $item.text())
        loadRentListByView()
    })

    $('#tags #spaceTag').on('click', '.toggleTag', function (event) {
        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        ga('send', 'event', 'rent_list', 'change', 'change-space', $item.text())
        loadRentListByView()
    })

    var $rentPeriodStartDate = $('[name=rentPeriodStartDate]')
    if(window.team.isPhone()) {
        $rentPeriodStartDate.get(0).type = 'date'
    }
    //$rentPeriodStartDate.attr('placeholder',$.format.date(new Date(), 'yyyy-MM-dd'))
    $rentPeriodStartDate.dateRangePicker({
            autoClose: true,
            singleDate: true,
            showShortcuts: false,
            lookBehind: true,
            getValue: function() {
                //return this.value || $.format.date(new Date(), 'yyyy-MM-dd');
            }
        })
        .bind('datepicker-change', function (event, obj) {
            $rentPeriodStartDate.val($.format.date(new Date(obj.date1), 'yyyy-MM-dd')).trigger('change')
        })
        .bind('change', function () {
            var val = $(this).val()
            if(val !== '') {
                $(this).siblings('.clear').show()
            } else{
                $(this).siblings('.clear').hide()
            }
            ga('send', 'event', 'rent_list', 'change', 'change-space', val)
            loadRentListByView()
        })
    $('.calendar .clear').bind('click', function(event){
        $(this).siblings('input').val('').trigger('change').attr('placeholder', i18n('请选择起租日期'))
    })

    // Show or Hide tag filters on mobile
    function showTagsOnMobile() {
        var $button = $('#showTags')
        var $tags = $('#tags .tags_inner')
        if ($button.attr('data-state') === 'closed') {
            $tags.show()
            //http://css-tricks.com/snippets/jquery/animate-heightwidth-to-auto/
            $tags.animate({'max-height': 1000 + 'px'}, 400, 'swing') //make auto height
            $button.find('label').text(window.i18n('收起'))
            $button.find('img').addClass('rotated')
            $button.attr('data-state', 'open')
        }
    }

    function hideTagsOnMobile() {
        var $button = $('#showTags')
        var $tags = $('#tags .tags_inner')
        if ($button.attr('data-state') === 'open') {
            $tags.animate({'max-height': '0'}, 400, 'swing')
            $tags.slideUp(400)
            $button.find('label').text(window.i18n('更多选择'))
            $button.find('img').removeClass('rotated')
            $button.attr('data-state', 'closed')
        }
    }

    $('#tags #showTags').click(function (event) {
        var $button = $(event.delegateTarget)
        if ($button.attr('data-state') === 'closed') {
            showTagsOnMobile()
        }
        else {
            hideTagsOnMobile()
        }
    })

    $(window).scroll(function () {

        if ($('[data-tab-name=list]').is(':visible')) {
            var scrollPos = $(window).scrollTop()
            var windowHeight = $(window).height()
            var listHeight = $('#result_list').height()
            var requireToScrollHeight = listHeight

            setTimeout(function () {
                if (windowHeight + scrollPos > requireToScrollHeight) {
                    if (!isLoading && !isAllItemsLoaded) {
                        loadRentList()
                    }
                }
            }, 200)
        }
    })

    /*
    * Map View
    * */
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
        }else {
            zoomLevel = 13 //Default zoom level is 10
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

    function emptyMapPins() {
        window.rentMapList = []

        var mapId = 'mapCanvas'
        var map = window.getMap(mapId)
        map.entities.clear();
    }

    $('[data-tabs]').tabs({trigger: 'click'}).on('openTab', function (event, target, tabName) {
        if (tabName === 'map') {
            viewMode = 'map'
            if (typeof Microsoft === 'undefined'){
                var scriptString = '<script src="http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&onscriptload=onBingMapScriptLoad"></script>'
                window.onBingMapScriptLoad = function () {
                    if (typeof Microsoft === 'undefined') {
                        window.alert(window.i18n('地图加载失败'))
                    }else{
                        loadRentMapList()
                    }
                }
                $('body').append(scriptString)
            }else{
                loadRentMapList()
            }
        }else if (tabName === 'list') {
            viewMode = 'list'
            loadRentList(true)
        }
    })

    $('.tabSelector_phone').click(function (e) {
        var currentTab = $(this).attr('data-tab')
        var $tabContainer = $('[data-tabs]')
        var tabName = ''
        var $tabContents = null

        if (currentTab === 'list'){
            viewMode = 'map'
            //to show map
            tabName = 'map'
            $tabContents = $tabContainer.find('[data-tab-name=' + tabName + ']')
            $tabContents.addClass('selectedTab').show()
            $tabContents.siblings().removeClass('selectedTab').hide()
            $tabContainer.trigger('openTab', [$('.tabSelector [tab-name=' + tabName + ']'), tabName])
            $(this).attr('data-tab', 'map')
        }
        else {
            viewMode = 'list'
            //to show list
            tabName = 'list'
            $tabContents = $tabContainer.find('[data-tab-name=' + tabName + ']')
            $tabContents.addClass('selectedTab').show()
            $tabContents.siblings().removeClass('selectedTab').hide()
            $tabContainer.trigger('openTab', [$('.tabSelector [tab-name=' + tabName + ']'), tabName])
            $(this).attr('data-tab', 'list')
        }
    })


    function loadRentMapList() {
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

        var rentAvailableTime
        if($('[name=rentPeriodStartDate]').val()){
            rentAvailableTime = new Date($('#rentPeriodStartDate').val()).getTime() / 1000
            params.rent_available_time = rentAvailableTime
        }

        //Empty map list
        emptyMapPins()

        $.betterPost('/api/1/rent_ticket/search', params)
            .done(function (val) {
                var array = val
                //TODO: All rents must have location, filter those have no location
                if (!_.isEmpty(array)) {
                    window.rentMapList = array
                    updateMap()
                }else{
                    window.alert(window.i18n('暂无结果'))
                }
            }).fail(function () {

            }).always(function () {

            })
    }
 })()


/*
 * Resize height of top category filter for different screen size
 *
 * */
window.resizeCategory = function () {
    var $categoryWrapper = $('.category_wrapper')
    var $category = $categoryWrapper.find('.category')

    if (window.team.isPhone()) {
        $categoryWrapper.css({'height': 'auto'});
        $category.css('margin-top', '0')
        $categoryWrapper.show()
    }
    else {
        var availHeight = window.screen.availHeight
        var wrapperHeight = availHeight / 8.0 > 100 ? availHeight / 8.0 : 100
        var categoryHeight = 40
        $categoryWrapper.css({'height': wrapperHeight + 'px'});
        $category.css('margin-top', (wrapperHeight - categoryHeight) / 2 + 'px')
        $categoryWrapper.show()
    }
};

$(window.resizeCategory);
$(window).on('resize', window.resizeCategory);

/*
 * Make List/Map tab fixed to screen
 *
 * */
window.updateTabSelectorFixed = function () {
    if (!window.team.isPhone()) {
        var scrollOffset = $(window).scrollTop()
        var $list = $('.tabContent').width() > 0 ? $('#result_list') : $('#emptyPlaceHolder')
        var listTop = $list.offset().top
        var listHeight = $list.height()
        var $tabSelector = $('.tabSelector')
        var tabLeft = $list.offset().left - 60
        if (scrollOffset > listTop + listHeight - 20) {
            $tabSelector.css({'position': 'static', 'top': '0', left: '0', 'margin-top': '0x'})
        }
        else if (scrollOffset > listTop - 20) {
            $tabSelector.css({'position': 'fixed', 'top': '20px', left: tabLeft, 'margin-top': '0'})
        }
        else {
            $tabSelector.css({'position': 'static', 'top': '0', left: '0', 'margin-top': '0x'})
        }
    }
}
$(window).scroll(window.updateTabSelectorFixed);
$(window).resize(window.updateTabSelectorFixed);
