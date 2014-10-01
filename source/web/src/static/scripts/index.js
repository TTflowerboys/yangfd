(function () {
    $('#announcement').on('click', 'ul>li>.close', function (event) {
        var $item = $(event.target.parentNode)
        $item.remove()
        var $container =$(event.delegateTarget)
        if ($container.find('ul>li').length === 0) {
            $container.hide()
        }
    })

    function getSelectedBudgetType() {
        var $selectedChild = $('#tags #budgetTag').children('.selected')
        if ($selectedChild.length) {
            return $selectedChild.first().attr('data-id')
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


    function loadPropertyList() {
        var params = {'per_page': 2}
        var budgetType = getSelectedBudgetType()
        if (budgetType) {
            params.budget = budgetType
        }

        var intention = getSelectedIntention()
        if (intention) {
            params.intention = intention
        }

        var resultCount = 0
        $('#suggestionHouses #loadIndicator').show()
        $('#suggestionHouses #list').empty()
        $.post('/api/1/property/search', params)
            .done(function (val) {
                var array = val.content
                resultCount = val.count
                if (!_.isEmpty(array)) {
                    _.each(array, function (house) {
                        var houseResult = _.template($('#houseCard_template').html())({house: house})
                        $('#suggestionHouses #list').append(houseResult)
                    })
                }

            })
            .always(function () {
                $('#suggestionHouses #loadIndicator').hide()
            })
    }


    if (window.user) {

        loadPropertyList()

        var $budgetTag = $('#tags #budgetTag')
        var $intentionTag = $('#tags #intentionTag')


        // var userBudget = window.budget
        // var userIntention= window.intention

        $budgetTag.on('click', '.toggleTag', function (event) {

            var $item = $(event.target)
            var alreadySelected = $item.hasClass('selected')
            var $parent = $(event.target.parentNode)
            $parent.find('.toggleTag').removeClass('selected')

            if (!alreadySelected) {
                $item.addClass('selected')
            }

            loadPropertyList()
        })

        $intentionTag.on('click', '.toggleTag', function (event) {

            var $item = $(event.target)
            if ($item.hasClass('selected')) {
                $item.removeClass('selected')
            }
            else {
                $item.addClass('selected')
            }

            loadPropertyList()
        })
    }
})()
