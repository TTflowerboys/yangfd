(function () {
    $('#announcement').on('click', 'ul>li>.close', function (event) {
        var $item = $(event.target.parentNode)
        $item.remove()
        var $container =$(event.delegateTarget)
        if ($container.find('ul>li').length === 0) {
            $container.hide()
        }
    })

    function getSelectedBudgetTypeId() {
        var $selectedChild = $('#tags #budgetTag').children('.selected')
        if ($selectedChild.length) {
            return $selectedChild.first().attr('data-id')
        }
        return ''
    }

    function getLastBudgetTypeId() {
        var $selectedChild = $('#tags #budgetTag').children()
        if ($selectedChild.length) {
            return $selectedChild.last().attr('data-id')
        }
        return ''
    }



    function getSelectedIntentionIds() {
        var $selectedChildren = $('#tags #intentionTag ul').children('.selected')
        if ($selectedChildren.length) {
            var ids = ''
            _.each($selectedChildren, function (child) {
                ids += child.getAttribute('data-id')
                ids += ','
            })

            if (_.last(ids) === ',') {
                ids = ids.substring(0, ids.length-1)
            }
            return ids
        }
        return ''
    }

    function getAllIntentionIds() {
        var rawIntentionList = $('#dataIntentionList').text()
        var array = JSON.parse(rawIntentionList)
        if (array.length) {
            var ids = ''
            _.each(array, function (item) {
                ids += item.id
                ids += ','
            })

            if (_.last(ids) === ',') {
                ids = ids.substring(0, ids.length-1)
            }

            return ids
        }
        return ''
    }

    function getIntentionById(id) {
        var rawIntentionList = $('#dataIntentionList').text()
        var array = JSON.parse(rawIntentionList)
        var ret
        if (array.length) {
            _.each(array, function (item) {
                if (item.id === id) {
                    ret = item
                }
            })

        }
        return ret
    }

    function updatePropertyCards(array)  {
        _.each(array, function (house) {
            var houseResult = _.template($('#houseCard_template').html())({house: house})
            $('#suggestionHouses #list').append(houseResult)
        })
    }

    function removePropertyCard(id) {
        $('#suggestionHouses #list .houseCard_wrapper[data-category-intention-id=' + id + ']').remove()
    }

    function updateUserTags(budgetId, intentionIds) {
        $.post('/api/1/user/edit', {'budget':budgetId, 'intention':intentionIds})
            .done(function (data) {
                window.user= data.val
            })
            .fail(function (ret) {
            })
            .always(function () {

            })
    }

    function commaStringToArray(str) {
        var array = str.split(',')
        return _.without(array, '')
    }

    var currentBudgetId
    var currentIntentionIds

    function loadPropertyListWithBudgetAndIntention(budgetType, intention) {

        $('#suggestionHouses #loadIndicator').show()

        var requestArray = []
        var responseArray = []

        var usedIntention = []
        var needShowSuggetionTip = false
        if (_.isEmpty(intention)) {
            usedIntention = commaStringToArray(getAllIntentionIds())
            needShowSuggetionTip = true
        }
        else {
            usedIntention = intention
        }

        var usedBudget = ''
        if (!budgetType) {
            usedBudget = getLastBudgetTypeId()
            needShowSuggetionTip = true
        }
        else {
            usedBudget = budgetType
        }

        if (needShowSuggetionTip) {
            $('.tags_wrapper #intentionTag #suggestionTip').show()
        }
        else {
            $('.tags_wrapper #intentionTag #suggestionTip').hide()
        }

        _.each(usedIntention, function (oneIntention) {
            var apiCall = $.post('/api/1/property/search', {'per_page': 1, 'budget':usedBudget, 'intention': oneIntention})
                              .done(function (val) {
                                  var array = val.content
                                  if (!_.isEmpty(array)) {
                                      var item = _.first(array)
                                      item.category_intention = getIntentionById(oneIntention)
                                      item.category_intention.description = window.i18n(item.category_intention.slug.replace(' ', '_') + '_description')
                                      responseArray.push(item)
                                  }
                              })
                              .fail(function (ret) {

                              })

            requestArray.push(apiCall)
        })

        $.when.apply($, requestArray)
            .done(function () {
                updatePropertyCards(responseArray)
                $('#suggestionHouses #loadIndicator').hide()
            })
            .fail(function () {
                updatePropertyCards(responseArray)
                $('#suggestionHouses #loadIndicator').hide()
            })
    }

    function loadPropertyList(budgetType, intention) {
        if (currentBudgetId !== budgetType) {
            //load all
            $('#suggestionHouses #list').empty()
            loadPropertyListWithBudgetAndIntention(budgetType, commaStringToArray(intention))
        }
        else {
            //compare intention list
            var newIntentionArray = commaStringToArray(intention)
            var currentIntentionArray =  commaStringToArray(currentIntentionIds)

            var newAddIntentionArray = _.difference(newIntentionArray, currentIntentionArray)
            var deleteIntentionArray = _.difference(currentIntentionArray, newIntentionArray)

            if (_.isEmpty(newAddIntentionArray) && !_.isEmpty(deleteIntentionArray)) {
                // remove data
                _.each(deleteIntentionArray, function (item) {
                    removePropertyCard(item)
                })
            }
            else if (!_.isEmpty(newAddIntentionArray) && _.isEmpty(deleteIntentionArray)) {
                //append data
                loadPropertyListWithBudgetAndIntention(budgetType, newAddIntentionArray)
            }
            else {
                //load all
                $('#suggestionHouses #list').empty()
                loadPropertyListWithBudgetAndIntention(budgetType, commaStringToArray(intention))
            }
        }

        currentBudgetId = budgetType
        currentIntentionIds = intention

        updateUserTags(currentBudgetId, currentIntentionIds)
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

        var $budgetTag = $('#tags #budgetTag')
        var $intentionTag = $('#tags #intentionTag')

        var initBudgetId = ''
        var initIntentionList = ''
        if (window.user.budget) {
            $budgetTag.find('.toggleTag[data-id=' + window.user.budget.id + ']').addClass('selected')
            initBudgetId = window.user.budget.id
        }

        if (window.user.intention) {
            _.each(window.user.intention, function (item) {
                addIntetionTag(item.id, item.value)
                $intentionDetails.find('li[data-id=' + item.id+']').addClass('selected')
                $intentionDetails.find('input[value=' + item.id+']').prop('checked', true)
                initIntentionList = initIntentionList + item.id + ','
            })

            if (_.last(initIntentionList) === ',') {
                initIntentionList = initIntentionList.substring(0, initIntentionList.length-1)
            }
        }


        loadPropertyList(initBudgetId, initIntentionList)

        $budgetTag.on('click', '.toggleTag', function (event) {

            var $item = $(event.target)
            var alreadySelected = $item.hasClass('selected')
            var $parent = $(event.target.parentNode)
            $parent.find('.toggleTag').removeClass('selected')

            if (!alreadySelected) {
                $item.addClass('selected')
            }

            loadPropertyList(getSelectedBudgetTypeId(), getSelectedIntentionIds())
        })

        $intentionTag.on('click', '.toggleTag img', function (event) {

            var $li = $(event.target).parent()
            var id = $li.attr('data-id')
            $intentionDetails.find('li[data-id=' + id+']').removeClass('selected')
            $intentionDetails.find('input[value=' + id+']').prop('checked', false)
            $li.remove()
            loadPropertyList(getSelectedBudgetTypeId(), getSelectedIntentionIds())
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
            loadPropertyList(getSelectedBudgetTypeId(), getSelectedIntentionIds())
        })

        $intentionTag.find('#add').click(function () {
            $('.intentionTabs_wrapper').animate({height:'530px'}, 400, 'swing')
        })

        $('.intentionTabs_wrapper').find('#collapseButton').click(function () {
            $('.intentionTabs_wrapper').animate({height:'0'}, 400, 'swing')
        })

    }
})()
