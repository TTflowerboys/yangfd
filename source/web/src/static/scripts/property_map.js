(function () {
    if ($('.maps_wrapper')) {
        var property = JSON.parse($('#pythonProperty').text())
        window.setupMap(property.latitude, property.longitude, function () {
            //setUp Map Tabs
            $('.maps').tabs({trigger: 'click'}).on('openTab', function (event, target, tabName){
                $('[data-tab-name=' + tabName + ']').show()
            })
            //load data
            var geoLocation = new Microsoft.Maps.Location(property.latitude, property.longitude);
            window.showTransitMap(geoLocation, null, true, 14, property.country.slug)
            window.showSchoolMap(geoLocation, null, true, 14, property.country.slug)
            window.showFacilityMap(geoLocation, null, true, 14, property.country.slug)
        })
    }
})()
