(function () {
    var time

    function loadPropertyList() {
        var params = {'per_page': 5}
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
        var budgetType = getSelectedBudgetType()
        if (budgetType) {
            params.budget = budgetType
        }

        var intention = getSelectedIntention()
        if (intention) {
            params.intention = intention
        }
        if (time) {
            params.time = time
        }

        $('#result #loadIndicator').show()
        var resultCount = 0
        $.post('/api/1/property/search', params)
            .done(function (val) {
                var array = val.content
                resultCount = val.count
                if (!_.isEmpty(array)) {
                    time = _.last(array).time
                    _.each(array, function (house) {
                        var houseResult = _.template($('#houseCard_template').html())({house: house})
                        $('#result_list').append(houseResult)

                        if (time > house.time) {
                            time = house.time
                        }
                    })
                }

            })
            .always(function () {
                updateResultCount(resultCount)
                $('#result #loadIndicator').hide()
            })
    }

    function getData(key) {
        return JSON.parse(document.getElementById(key).innerHTML)
    }

    function resetData() {
        $('#result_list').empty()
        time = undefined
    }

    function resetCityDataWhenCountryChange() {
        var selectedCountryId = $('select[name=propertyCountry]').children('option:selected').val()
        var $citySelect = $('select[name=propertyCity]')
        $citySelect.empty()
        $citySelect.append('<option value=>' + window.i18n('所有城市') + '</option>')
        _.each(window.cityData, function (city) {
            if (!selectedCountryId || city.country.id === selectedCountryId) {
                var item = '<option value=' + city.id + '>' + city.value[window.lang] + '</option>'
                $citySelect.append(item)
            }
        })
    }

    function getSelectedBudgetType() {
        var $selectedChild = $('#tags #budgetTag').children('.selected')
        if ($selectedChild.length) {
            return $selectedChild.first().attr('data-id')
        }
        return ''
    }

    function getSelectedIntention() {
        var $selectedChild = $('#tags #intentionTag').children('.selected')
        if ($selectedChild.length) {
            var ids = ''
            _.each($selectedChild, function (child) {
                ids += child.getAttribute('data-id')
                ids += ','
            })
            return ids
        }
        return ''
    }

    function updateResultCount(count) {
        var $numberContainer = $('#result #number_container')
        var $number = $numberContainer.find('#number')

        if (count) {
            $number.text(count)
            $numberContainer.show()
        }
        else {
            $number.text(count)
            $numberContainer.show()
        }
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
        $countrySelect.append('<option value=>' + window.i18n('所有国家slash地区') + '</option>')
        _.each(window.countryData, function (country) {
            var item = '<option value=' + country.id + '>' + country.value[window.lang] + '</option))>'
            $countrySelect.append(item)
        })

        $countrySelect.change(function () {
            resetCityDataWhenCountryChange()
            resetData()
            loadPropertyList()
        })

        var $citySelect = $('select[name=propertyCity]')
        $citySelect.empty()
        $citySelect.append('<option value=>' + window.i18n('所有城市') + '</option>')
        _.each(window.cityData, function (city) {
            var item = '<option value=' + city.id + '>' + city.value[window.lang] + '</option>'
            $citySelect.append(item)
        })

        $citySelect.change(function () {
            resetData()
            loadPropertyList()
        })

        var $propertyTypeSelect = $('select[name=propertyType]')
        $propertyTypeSelect.empty()
        $propertyTypeSelect.append('<option value=>' + window.i18n('所有房屋类型') + '</option>')
        _.each(window.propertyTypeData, function (type) {
            var item = '<option value=' + type.id + '>' + type.value[window.lang] + '</option>'
            $propertyTypeSelect.append(item)
        })

        $propertyTypeSelect.change(function () {
            resetData()
            loadPropertyList();
        })
    })


    $('#loadMore').click(function () {
        loadPropertyList()
    })


    $('#tags #budgetTag').on('click', '.toggleTag', function (event) {

        var $item = $(event.target)
        var alreadySelected = $item.hasClass('selected')
        var $parent = $(event.target.parentNode)
        $parent.find('.toggleTag').removeClass('selected')

        if (!alreadySelected) {
            $item.addClass('selected')
        }

        resetData()
        loadPropertyList()
    })

    $('#tags #intentionTag').on('click', '.toggleTag', function (event) {

        var $item = $(event.target)
        if ($item.hasClass('selected')) {
            $item.removeClass('selected')
        }
        else {
            $item.addClass('selected')
        }

        resetData()
        loadPropertyList()
    })
})()
