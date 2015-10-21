(function (module) {
    module.setupTagsFromURL = function (url) {

        /*
         * Interactions with side tag filters
         * */

        function selectTagFilter(tag, dataid) {
            var $item = $('#tags ' + tag).find('[data-id=' + dataid + ']')
            var $parent = $item.parent()
            $parent.find('.toggleTag').removeClass('selected')
            $item.addClass('selected')
        }

        if (window.team.isPhone()) {
            var propertyTypeFromURL = window.team.getQuery('property_type', url)
            if (propertyTypeFromURL) {
                selectTagFilter('#propertyTypeTag', propertyTypeFromURL)
            }

            var rentTypeFromURL = window.team.getQuery('rent_type', url)
            if (rentTypeFromURL) {
                selectTagFilter('#rentTypeTag', rentTypeFromURL)
            }
        }

        // Init side tag filters value from URL
        /*var rentBudgetFromURL = window.team.getQuery('rent_budget', url)
        if (rentBudgetFromURL) {
            selectTagFilter('#rentBudgetTag', rentBudgetFromURL)
        }*/

        var rentPeriodFromURL = window.team.getQuery('rent_period', url)
        if (rentPeriodFromURL) {
            selectTagFilter('#rentPeriodTag', rentPeriodFromURL)
        }

        var bedroomFromURL = window.team.getQuery('bedroom_count', url)
        if (bedroomFromURL) {
            selectTagFilter('#bedroomCountTag', bedroomFromURL)
        }

        var spaceFromURL = window.team.getQuery('space', url)
        if (spaceFromURL) {
            selectTagFilter('#spaceTag', spaceFromURL)
        }
    }
})(window.currantModule = window.currantModule || {})
