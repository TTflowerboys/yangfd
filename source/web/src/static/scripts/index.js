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
        var params = {'per_page': 12}
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

    function addIntetionTag(id, value) {
         $intentionTag.find('#list').append('<li class="toggleTag selected" data-id="' + id + '">' +
                                                   value +
                                                   '<img alt="" src="/static/images/intention/close.png"/></li>'
                                                  )
    }

    function removeIntentionTag(id) {
        $intentionTag.find('#list li[data-id=' + id + ']').remove()
    }

    if (window.user) {

        var $intentionDetails = $('[data-tabs]')

        $('[data-tabs]').tabs().on('mouseover', 'li', function (e) {
            var tabName = $(e.currentTarget).find('[data-tab]').data('tab')
            $(e.currentTarget).addClass('indicator').siblings().removeClass('indicator')
            $(e.delegateTarget).find('[data-tab-name=' + tabName + ']').show().siblings().hide()
        })

        $intentionDetails.find('[name=intention]').on('change', function () {
            var $li = $(this).closest('li')

            $li.toggleClass('selected', this.checked)

            if (this.checked) {

                addIntetionTag($li.attr('data-id'), $li.attr('data-value'))
            }
            else {
                removeIntentionTag($li.attr('data-id'))
            }

            loadPropertyList()
        })



        var $budgetTag = $('#tags #budgetTag')
        var $intentionTag = $('#tags #intentionTag')

        if (window.user.budget) {
            $budgetTag.find('.toggleTag[data-id=' + window.user.budget.id + ']').addClass('selected')
        }

        if (window.user.intention) {
            _.each(window.user.intention, function (item) {
                addIntetionTag(item.id, item.value)
                $intentionDetails.find('li[data-id=' + item.id+']').addClass('selected')
                $intentionDetails.find('input[value=' + item.id+']').prop('checked', true)

            })
        }

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

        $intentionTag.on('click', '.toggleTag img', function (event) {

            var $li = $(event.target).parent()
            var id = $li.attr('data-id')
            $intentionDetails.find('li[data-id=' + id+']').removeClass('selected')
            $intentionDetails.find('input[value=' + id+']').prop('checked', false)
            $li.remove()

            loadPropertyList()
        })

        $intentionTag.find('#add').click(function () {
            //$('.intentionTabs_wrapper').trigger('open')
        })

        $('.intentionTabs_wrapper').find('#collapseButton').click(function () {
            //$('.intentionTabs_wrapper').trigger('close')
        })
        loadPropertyList()
    }
})()
