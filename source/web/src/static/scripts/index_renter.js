(function () {

    window.currantModule.bindFiltersToChosenControls()
    var filterOfNeighborhoodSubwaySchool = new window.currantModule.InitFilterOfNeighborhoodSubwaySchool({
        citySelect: $('[name=propertyCity]'),
        countrySelect: $('[name=propertyCountry]')
    })
    filterOfNeighborhoodSubwaySchool.Event.bind('change', function () {

    })

    var $countrySelect = $('select[name=propertyCountry]')
    $countrySelect.change(function () {
        var countryCode = $('select[name=propertyCountry]').children('option:selected').val()

        ga('send', 'event', 'index', 'change', 'select-country',
            $('select[name=propertyCountry]').children('option:selected').text())
        if(countryCode) {
            window.currantModule.updateCityByCountry(countryCode, $('select[name=propertyCity]'))
        } else {
            window.currantModule.clearCity($('select[name=propertyCity]'))
        }
    })

    function openRentListWithViewMode(viewMode) {
        var country = $('select[name=propertyCountry]').children('option:selected').val()
        var city = $('select[name=propertyCity]').children('option:selected').val()
        var neighborhood = $('select[name=neighborhood]').children('option:selected').val()
        var school = $('select[name=school]').children('option:selected').val()
        var propertyType = $('select[name=propertyType]').children('option:selected').val()
        var rentType = $('select[name=rentType]').children('option:selected').val()

        function appendParam(url, key, param) {
            if (param && param !== '' && typeof param !== 'undefined') {
                return url + '&' + key + '=' + param
            }
            return url
        }

        var url = '/property-to-rent-list?' + 'mode=' + viewMode
        url = appendParam(url, 'country', country)
        url = appendParam(url, 'city', city)
        url = appendParam(url, 'neighborhood', neighborhood)
        url = appendParam(url, 'school', school)
        url = appendParam(url, 'property_type', propertyType)
        url = appendParam(url, 'rent_type', rentType)
        window.open(url, '_blank')
        window.focus()
    }

    $('#renterSearch').click(function () {
        openRentListWithViewMode('list')
    })

    $('#renterMapSearch').click(function () {
        openRentListWithViewMode('map')
    })
})()
