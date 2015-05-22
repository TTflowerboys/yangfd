(function () {
    if ($('.maps_wrapper')) {
        var property = JSON.parse($('#pythonProperty').text())
        var location = {latitude:property.latitude, longitude:property.longitude}
        window.setupMap(location, function () {

            $('#mapImg, #showMap').click(function (e) {
                if (!$('#mapLoadIndicator').is(':visible')) {
                    ga('send', 'event', 'property_detail', 'click', 'view-map')

                    window.showMapIndicator()
                    var scriptString = '<script src="http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0&onscriptload=onBingMapScriptLoad"></script>'
                    window.onBingMapScriptLoad = function () {
                        //showMap
                        $('.staticMap').hide()
                        $('.maps').show()
                        //setUp Map Tabs
                        $('.maps').tabs({trigger: 'click'}).on('openTab', function (event, target, tabName){
                            $('[data-tab-name=' + tabName + ']').show()
                        })

                        //TODO: find why need get region for different map, may because for the delay after bing map load, or load bing map module for different map
                        window.showMapIndicator()
                        window.showTransitMap(location, null, true, 14, property.country.code, function () {
                                window.hideMapIndicator()
                        })
                        window.showMapIndicator()
                        window.showSchoolMap(location, null, true, 14, property.country.code, function () {
                            window.hideMapIndicator()
                        })
                        window.showMapIndicator()
                        window.showFacilityMap(location, null, true, 14, property.country.code, function () {
                                window.hideMapIndicator()
                        })
                        window.hideMapIndicator()
                    }
                    $('body').append(scriptString)
                }
            })
        })
    }
})()
