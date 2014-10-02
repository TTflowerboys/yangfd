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

         $('#result_list_container').show()
        showEmptyPlaceHolder(false)

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

    function getSelectedBudgetTypeValue() {
        var $selectedChild = $('#tags #budgetTag').children('.selected')
        if ($selectedChild.length) {
            return $selectedChild.first().text()
        }
        return ''
    }


    function getSelectedIntention() {
        var $selectedChildren = $('#tags #intentionTag').children('.selected')
        if ($selectedChildren.length) {
            var ids = ''
            _.each($selectedChildren, function (child) {
                ids += child.getAttribute('data-id')
                ids += ','
            })
            return ids
        }
        return ''
    }


    function getSelectedIntentionValue() {
        var $selectedChildren = $('#tags #intentionTag').children('.selected')
        if ($selectedChildren.length) {
            var textValue = ''
            _.each($selectedChildren, function (child) {
                textValue += child.innerText
                textValue += ','
            })
            return textValue
        }
        return ''
    }


    function updateResultCount(count) {
        var $numberContainer = $('#result #number_container')
        var $number = $numberContainer.find('#number')

        if (count) {
            $number.text(count)
            $numberContainer.show()
            $('#result_list_container').show()
            showEmptyPlaceHolder(false)
        }
        else {
            $number.text(count)
            $('#result_list_container').hide()
            showEmptyPlaceHolder(true)
        }
    }

    function showEmptyPlaceHolder(show) {
        var emptyPlaceHolder = $('.emptyPlaceHolder');
        if (show) {
            window.resetRequirementForm(emptyPlaceHolder)
            var selectedBudgetId = getSelectedBudgetType()
            emptyPlaceHolder.find('select[name=budget] option[value=' + selectedBudgetId + ']').attr('selected', true)
            var selectedCountry = $('select[name=propertyCountry]').children('option:selected').text()
            var selectedCity = $('select[name=propertyCity]').children('option:selected').text()
            var selectedType = $('select[name=propertyType]').children('option:selected').text()
            var selectedBudget = getSelectedBudgetTypeValue()
            var selectedIntention = getSelectedIntentionValue()

            if (_.last(selectedIntention) === ',') {
                selectedIntention = selectedIntention.substring(0, selectedIntention.length - 1)
            }

            var description =  window.i18n('我想在') + ' ' +
                    selectedCountry + ' ' +
                    window.i18n('的') + ' ' +
                    selectedCity + ' ' +
                    window.i18n('投资')  + ' ' +
                    selectedType

            if (selectedBudget) {
                description = description  +
                    window.i18n('comma价值为') + ' ' +
                    selectedBudget + ' '
            }

            if (selectedIntention) {
                description = description + window.i18n('的房产comma投资意向为') + ' ' +
                    selectedIntention
            }

            description = description + window.i18n('period')

            emptyPlaceHolder.find('textarea[name=description]').text(description)

            window.setupRequirementForm(emptyPlaceHolder, function () {
            })
            emptyPlaceHolder.show();
        }
        else {
            emptyPlaceHolder.hide()
        }
    }

    function selectBudget(id) {
        var $item = $('#tags #budgetTag').find('[data-id=' + id + ']')
        var $parent = $item.parent()
        $parent.find('.toggleTag').removeClass('selected')
        $item.addClass('selected')
    }

    function selectIntention(id) {
        $('#tags #intentionTag').find('[data-id=' + id + ']').toggleClass('selected', true)
    }

    function updateUserTags() {
        var budgetId = getSelectedBudgetType()
        var intentionIds = getSelectedIntention()

        $.post('/api/1/user/edit', {'budget':budgetId, 'intention':intentionIds})
            .done(function (data) {
                window.user= data.val
            })
            .fail(function (ret) {
            })
            .always(function () {

            })
    }

    $(function () {
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
        updateUserTags()
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
        updateUserTags()
    })

    //load first property list base on user's choose
    if (window.user) {
        if (window.user.budget) {
            selectBudget(window.user.budget.id)
        }
        if (window.user.intention) {
            _.each(window.user.intention, function (item) {
                selectIntention(item.id)
            })
        }
    }

    var intentionFromURL = window.team.getQuery('intention', location.href)
    if (intentionFromURL) {
        selectIntention(intentionFromURL)
    }

    loadPropertyList()
})()
