(function () {
    $('#announcement').on('click', 'ul>li>.close', function (event) {
        var $item = $(event.target.parentNode)
        $item.remove()
        var $container = $(event.delegateTarget)
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

    // function getSelectedBudgetTypeValue() {
    //     var $selectedChild = $('#tags #budgetTag').children('.selected')
    //     if ($selectedChild.length) {
    //         return $selectedChild.first().text()
    //     }
    //     return ''
    // }

    function getSelectedIntentionIds() {
        var $selectedChildren = $('#tags #intentionTag ul').children('.selected')
        if ($selectedChildren.length) {
            var ids = ''
            _.each($selectedChildren, function (child) {
                ids += child.getAttribute('data-id')
                ids += ','
            })

            if (_.last(ids) === ',') {
                ids = ids.substring(0, ids.length - 1)
            }
            return ids
        }
        return ''
    }

    // function getSelectedIntentionValues() {
    //     var $selectedChildren = $('#tags #intentionTag ul').children('.selected')
    //     if ($selectedChildren.length) {
    //         var ids = ''
    //         _.each($selectedChildren, function (child) {
    //             ids += $(child).clone().children().remove().end().text()
    //             ids += ','
    //         })

    //         if (_.last(ids) === ',') {
    //             ids = ids.substring(0, ids.length - 1)
    //         }
    //         return ids
    //     }
    //     return ''
    // }

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
                ids = ids.substring(0, ids.length - 1)
            }

            return ids
        }
        return ''
    }

    function getIntentionById(id) {
        if (id) {
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
        return undefined
    }

    function getBudgetById(id) {
        if (id) {
            var rawBudgetList = $('#dataBudgetList').text()
            var array = JSON.parse(rawBudgetList)
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
        return undefined
    }

    function updatePropertyCards(array) {
        _.each(array, function (house) {

            var houseResult = {}
            if (house.isEmpty) {
                houseResult = _.template($('#empty_houseCard_template').html())({house: house})
                $('#suggestionHouses #list').append(houseResult)

            }
            else {
                houseResult = _.template($('#suggestion_houseCard_template').html())({house: house})
                $('#suggestionHouses #list').append(houseResult)
            }
        })
        updatePropertyCardMouseEnter()
    }

    function removePropertyCard(id) {
        $('#suggestionHouses #list .houseCard_wrapper[data-category-intention-id=' + id + ']').remove()
    }

    function updatePropertyCardMouseEnter() {
        $('.houseCard').mouseenter(function(event){
            $(event.delegateTarget).find('button.openRequirement').show()
        });

        $('.houseCard').mouseleave(function(event){
            $(event.delegateTarget).find('button.openRequirement').hide()
        });
    }


    function updateUserTags(budgetId, intentionIds) {

        var changed = false
        var oldBudgetId = ''
        if (window.budget) {
            oldBudgetId = window.budget.id
        }
        if (oldBudgetId !== budgetId) {
            changed = true
        }

        if (window.intention) {
            var oldIntentionArray = []
            _.each(window.intention, function (item) {
                oldIntentionArray.push(item.id)
            })
            var newIntentionArray = intentionIds.split(',')

            if (!_.isEmpty(_.difference(oldIntentionArray, newIntentionArray)) ||
                !_.isEmpty(_.difference(newIntentionArray, oldIntentionArray))) {
                changed = true
            }
        }

        if (!changed) {
            return;
        }

        var params = {}
        if (budgetId) {
            params.budget = budgetId
        }
        else {
            params.unset_fields = 'budget'
        }

        if (intentionIds) {
            params.intention = intentionIds
        }
        else {
            params.intention = ''
        }

        if (!_.isEmpty(params)) {
            $.betterPost('/api/1/user/edit', params)
                .done(function (data) {
                    window.user = data
                })
                .fail(function (ret) {
                })
                .always(function () {

                })
        }
    }

    function commaStringToArray(str) {
        var array = str.split(',')
        return _.without(array, '')
    }


    function loadIntentionDescription(callback) {
        $.betterPost('/api/1/enum?type=intention', {})
            .done(function (data) {
                window.intentionDescription = data
                callback()
            })
            .fail(function (ret) {
            })
            .always(function () {

            })
    }

    function updateIntentionDescription() {
        var callback = function () {
            var allTagDiv = $('.houseCard_wrapper .tagDetail')
            _.each(allTagDiv, function (tagDiv) {
                var intentionId = $(tagDiv).attr('data-intention-id')
                var description = ''
                _.each(window.intentionDescription, function (oneDes) {
                    if (oneDes.id === intentionId) {
                        description = oneDes.description
                    }
                })
                $(tagDiv).find('.description').text(description)
            })
        }

        if (window.intentionDescription) {
            callback()
        }
        else {
            loadIntentionDescription(callback)
        }
    }


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
            usedBudget = '' //getLastBudgetTypeId()
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
            var params = {'random': true, 'intention': oneIntention}
            if (usedBudget) {
                params.budget = usedBudget
            }
            var apiCall = $.betterPost('/api/1/property/search', params)
                    .done(function (val) {
                        var array = val.content
                        var item = {}
                        if (!_.isEmpty(array)) {
                            item = _.first(array)
                            item.category_budget = getBudgetById(usedBudget)
                            item.category_intention = getIntentionById(oneIntention)
                            responseArray.push(item)
                        }
                        else {
                            item.isEmpty = true
                            if (usedBudget) {
                                item.category_budget = getBudgetById(usedBudget)
                            }
                            if (oneIntention) {
                                item.category_intention = getIntentionById(oneIntention)
                            }
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
                updateIntentionDescription()
                $('#suggestionHouses #loadIndicator').hide()
            })
            .fail(function () {
                updatePropertyCards(responseArray)
                updateIntentionDescription()
                $('#suggestionHouses #loadIndicator').hide()
            })
            .always(function () {

            })
    }

    function loadPropertyList(budgetType, intention) {
        if (window.project.currentBudgetId !== budgetType) {
            //load all
            $('#suggestionHouses #list').empty()
            loadPropertyListWithBudgetAndIntention(budgetType, commaStringToArray(intention))
        }
        else {
            //compare intention list
            var newIntentionArray = commaStringToArray(intention)
            var currentIntentionArray = commaStringToArray(window.project.currentIntentionIds)

            var newAddIntentionArray = _.difference(newIntentionArray, currentIntentionArray)
            var deleteIntentionArray = _.difference(currentIntentionArray, newIntentionArray)

            if (_.isEmpty(newAddIntentionArray) && !_.isEmpty(deleteIntentionArray)) {
                // remove data
                _.each(deleteIntentionArray, function (item) {
                    removePropertyCard(item)
                })

                //if remove all intention restore back to all intention
                if ($('#suggestionHouses').find('#list').children().length === 0)  {
                    loadPropertyListWithBudgetAndIntention(budgetType, '')
                }
            }
            else if (!_.isEmpty(newAddIntentionArray) && _.isEmpty(deleteIntentionArray)) {

                //if the result is from suggestion, when user have new newAddIntentionArray, remove them
                if (currentIntentionArray.length === 0) {
                    $('#suggestionHouses #list').empty()
                }
                //append data
                loadPropertyListWithBudgetAndIntention(budgetType, newAddIntentionArray)
            }
            else {
                //load all
                $('#suggestionHouses #list').empty()
                loadPropertyListWithBudgetAndIntention(budgetType, commaStringToArray(intention))
            }
        }

        window.project.currentBudgetId = budgetType
        window.project.currentIntentionIds = intention

        updateUserTags(window.project.currentBudgetId, window.project.currentIntentionIds)
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

    function getIntentionTabsHeight() {
        if (window.team.isPhone()) {
            return 80 + Math.ceil($('.intention .controls').children().length / 3.0) * 140  + 18 + 15
        }
        else {
            return 530
        }
    }

    if (window.user) {
        $('[data-tabs]').tabs({trigger: 'hover'})
        var $intentionDetails = $('[data-tabs]')

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
                if (item.value && item.slug) {
                    addIntetionTag(item.id, item.value)
                    $intentionDetails.find('li[data-id=' + item.id + ']').addClass('selected')
                    $intentionDetails.find('input[value=' + item.id + ']').prop('checked', true)
                    initIntentionList = initIntentionList + item.id + ','
                }
            })

            if (_.last(initIntentionList) === ',') {
                initIntentionList = initIntentionList.substring(0, initIntentionList.length - 1)
            }
        }


        loadPropertyList(initBudgetId, initIntentionList)

        //if user don't choose one intention, show the tabs
        if (!commaStringToArray(initIntentionList).length) {
            $('.intentionTabs_wrapper').animate({height: getIntentionTabsHeight() + 'px'}, 400, 'swing')
        }

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
            $intentionDetails.find('li[data-id=' + id + ']').removeClass('selected')
            $intentionDetails.find('input[value=' + id + ']').prop('checked', false)
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
            $('html, body').animate({scrollTop: $('.intentionTabs_wrapper').offset().top - 60 }, 'fast')
            $('.intentionTabs_wrapper').animate({height: getIntentionTabsHeight() + 'px'}, 400, 'swing')
        })

        $('.intentionTabs_wrapper').find('#collapseButton').click(function () {
            $('.intentionTabs_wrapper').animate({height: '0'}, 400, 'swing')
        })

    }
    else {
        $('[data-tabs]').tabs({trigger: 'hover'})

        //load featured data
        var houseArray = JSON.parse($('#dataPropertyList').text())
         _.each(houseArray, function (house) {
            var houseResult = {}
             houseResult = _.template($('#featured_houseCard_template').html())({house: house})
             $('.houseFeatured').append(houseResult)
         })

        updatePropertyCardMouseEnter()
    }

})()
