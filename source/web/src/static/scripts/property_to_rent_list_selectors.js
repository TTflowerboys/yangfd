(function (module) {
    module.setupFiltersFromURL = function(url) {
        function selectCountry(code) {
            $('select[name=propertyCountry]').find('option[value=' + code + ']').prop('selected', true)
        }

        function selectCity(id) {
            $('select[name=propertyCity]').find('option[value=' + id + ']').prop('selected', true).trigger('chosen:updated')
        }

        function selectNeighborhood(id) {
            $('select[name=neighborhood]').find('option[value=' + id + ']').prop('selected', true).trigger('chosen:updated')
        }

        function selectSchool(id) {
            $('select[name=school]').find('option[value=' + id + ']').prop('selected', true).trigger('chosen:updated')
        }

        function selectPropertyType(id) {
            $('select[name=propertyType]').find('option[value=' + id + ']').prop('selected', true)
        }

        function selectRentType(id) {
            $('select[name=rentType]').find('option[value=' + id + ']').prop('selected', true)
        }

        var countryFromURL = window.team.getQuery('country', url)
        if (countryFromURL) {
            selectCountry(countryFromURL)
        }

        var cityFromURL = window.team.getQuery('city', url)
        if (cityFromURL) {
            selectCity(cityFromURL)
        }

        var neighborhoodFromURL = window.team.getQuery('neighborhood', url)
        if (neighborhoodFromURL) {
            selectNeighborhood(neighborhoodFromURL)
        }

        var schoolFromURL = window.team.getQuery('school', url)
        if (schoolFromURL) {
            selectSchool(schoolFromURL)
        }


        var propertyTypeFromURL = window.team.getQuery('property_type', url)
        if (propertyTypeFromURL) {
            selectPropertyType(propertyTypeFromURL)
        }

        var rentTypeFromURL = window.team.getQuery('rent_type', url)
        if (rentTypeFromURL) {
            selectRentType(rentTypeFromURL)
        }
    }

    module.bindFiltersToChosenControls = function () {
        /*
         TODO:
         var partnerFromURL = window.team.getQuery('partner',location.href)
         if (partnerFromURL) {
         }*/

        //在城市选择上使用chosen插件
        function initChosen (elem, config) {
            var defaultConfit = {
                width: '100%',
                disable_search_threshold: 8
            }
            config = _.extend(defaultConfit, config)
            if(!window.team.isPhone()) {
                elem.chosen(config)
            } else {
                elem.chosenPhone(config)
            }
        }
        initChosen($('[name=propertyCountry]'))
        initChosen($('[name=propertyCity]'))
        //initChosen($('[name=neighborhood]'))
        //initChosen($('[name=school]'))
        initChosen($('[name=propertyType]'))
        initChosen($('[name=rentType]'))
    }
    module.updateCityByCountry = function updateCityByCountry(countryCode, $citySelect){
        var params = {
            'country': countryCode,
            'feature_code': 'city'
        }
        if (window.betterAjaxXhr && window.betterAjaxXhr['/api/1/geonames/search'] && window.betterAjaxXhr['/api/1/geonames/search'].readyState !== 4) {
            window.betterAjaxXhr['/api/1/geonames/search'].abort()
        }
        //Empty city select
        $citySelect.html('<option value="">' + i18n('城市列表加载中...') + '</option>').trigger('chosen:updated')

        //Load city data
        $.betterPost('/api/1/geonames/search', params)
            .done(function (val) {
                $citySelect.html(
                    _.reduce(val, function(pre, val, key) {
                        return pre + '<option value="' + val.id + '">' + val.name + (countryCode === 'US' ? ' (' + val.admin1 + ')' : '') + '</option>' //美国的城市有很多重名，要在后面加上州名缩写
                    }, '<option value="">' + i18n('任意城市') + '</option>')
                ).trigger('chosen:updated')
            })
            .fail(function(){
            })
    }
    module.clearCity = function clearCity($citySelect) {
        $citySelect.html('<option value="">' + i18n('任意城市') + '</option>').trigger('chosen:updated')
    }
})(window.currantModule = window.currantModule || {})
