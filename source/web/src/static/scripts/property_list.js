var time = {}

function loadPropertyList() {
    var params = {'per_page':5}
    var country = $('select[name=propertyCountry]').children('option:selected').val()
    if (country) {
        params.country = country
    }
    var city = $('select[name=propertyCity]').children('option:selected').val()
    if (city) {
        params.city = city
    }
    var equityType =  $('select[name=propertyType]').children('option:selected').val()
    if (equityType) {
        params.equity_type = equityType
    }
    $.post('/api/1/property/search', params)
        .done(function (data) {
            if (data.ret !== 0) {
                console.log(data)
            }
            else {

                if (!_.isEmpty(data.val)) {
                    time = _.last(data.val).time
                    _.each(data.val, function (house) {
                        var houseResult =  _.template($('#houseCard_template').html())({house:house})
                        $('#result_list').append(houseResult)

                        if (time > house.time) {
                            time = house.time
                        }
                    })
                }
            }
        })
        .always(function () {

        })
}

function getData(key) {
    return JSON.parse(document.getElementById(key).innerHTML)
}

function resetData() {
    $('#result_list').empty()
    time = {}
}

function resetCityDataWhenCountryChange() {
    var selectedCountryId = $('select[name=propertyCountry]').children('option:selected').val()
    var selectedCountry = ''
    _.each(window.countryData, function (country) {
        if (country.id === selectedCountryId){
            selectedCountry = country.slug
        }
    })
    var $citySelect = $('select[name=propertyCity]')
    $citySelect.empty()
    $citySelect.append('<option value=>' + window.i18n('所有城市') + '</option>')
    _.each(window.cityData, function (city) {
        if (!selectedCountry || city.slug.indexOf(selectedCountry) === 0){
            var item = '<option value=' + city.id + '>' + city.value[window.lang] + '</option>'
            $citySelect.append(item)
        }
    })
}

$(function () {
    loadPropertyList()

    window.countryData = getData('countryData')
    window.cityData = getData('cityData')
    window.propertyTypeData = getData('propertyTypeData')
    window.intentionData = getData('intentionData')
    window.budgetData = getData('budgetData')

    var $countrySelect = $('select[name=propertyCountry]')
    $countrySelect.empty()
    $countrySelect.append('<option value=>' + window.i18n('所有国家') + '</option>')
    _.each(window.countryData, function (country) {
        var item = '<option value=' + country.id +'>' + country.value[window.lang] + '</option))>'
        $countrySelect.append(item)
    })

    $countrySelect.change(function () {
        resetCityDataWhenCountryChange()
        resetData()
        loadPropertyList()
    })

    var $citySelect = $('select[name=propertyCity]')
    $citySelect.empty()
    $citySelect.append('<option>' + window.i18n('所有城市') + '</option>')
    _.each(window.cityData, function (city) {
        var item = '<option value=' + city.id + '>' + city.value[window.lang] + '</option>'
        $citySelect.append(item)
    })

    $citySelect.change(function () {
        resetData()
        loadPropertyList()
    })

    var $propetyTypeSelect = $('select[name=propertyType]')
    $propetyTypeSelect.empty()
    $propetyTypeSelect.append('<option value=>' + window.i18n('所有房屋类型') + '</option>')
    _.each(window.propertyTypeData, function (type) {
        var item = '<option value=' + type.id + '>' + type.value[window.lang] + '</option>'
        $propetyTypeSelect.append(item)
    })

    $propetyTypeSelect.change(function () {
        resetData()
        loadPropertyList();
    })
})


$('#loadMore').click(function () {
    loadPropertyList()
})
