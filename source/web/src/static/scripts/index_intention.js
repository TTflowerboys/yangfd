(function (module) {
    module.setupUserPropertyChooser = function(loadPropertyList) {
        $('.intentionChooser').tabs({trigger: 'hover'})
        var $intentionDetails = $('.intentionChooser')

        var $budgetTag = $('#tags #budgetTag')
        var $intentionTag = $('#tags #intentionTag')

        var initBudgetId = ''
        var initIntentionList = ''
        clearIntentionTags()
        if (window.user.budget && $budgetTag.find('.toggleTag[data-id=' + window.user.budget.id + ']').length) {
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
        updateSuggestionTip(getSelectedIntentionIds())


        if (commaStringToArray(initIntentionList).length === 0) {
            //if user don't choose one intention, show the tabs
             $('.intentionTabs_wrapper').animate({height: getIntentionTabsHeight() + 'px'}, 400, 'swing')
        }

        function commaStringToArray(str) {
            var array = str.split(',')
            return _.without(array, '')
        }

        function getSelectedBudgetTypeId() {
            var $selectedChild = $('#tags #budgetTag').children('.selected')
            if ($selectedChild.length) {
                return $selectedChild.first().attr('data-id')
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
                    ids = ids.substring(0, ids.length - 1)
                }
                return ids
            }
            return ''
        }

        function addIntetionTag(id, value) {
            var $intentionTag = $('#tags #intentionTag')
            $intentionTag.find('#list').append('<li class="toggleTag selected" data-id="' + id + '">' +
                                               value +
                                               '<img alt="" src="/static/images/intention/close.png"/></li>'
                                              )
        }
        function clearIntentionTags () {
            $('#tags #intentionTag').find('#list').empty()
        }
        function removeIntentionTag(id) {
            var $intentionTag = $('#tags #intentionTag')
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

        function updateSuggestionTip(intentions) {
            var needShowSuggetionTip = false
            if (_.isEmpty(intentions)) {
                needShowSuggetionTip = true
            }

            if (needShowSuggetionTip) {
                $('.tags_wrapper #intentionTag #suggestionTip').show()
            }
            else {
                $('.tags_wrapper #intentionTag #suggestionTip').hide()
            }
        }
        if(!module.setupUserPropertyChooserInit) {
            module.setupUserPropertyChooserInit = true
            bindEvent()
        }
        function bindEvent() {
            $budgetTag.on('click', '.toggleTag', function (event) {

                var $item = $(event.target)
                var alreadySelected = $item.hasClass('selected')
                var $parent = $(event.target.parentNode)
                $parent.find('.toggleTag').removeClass('selected')

                if (!alreadySelected) {
                    $item.addClass('selected')
                }

                loadPropertyList(getSelectedBudgetTypeId(), getSelectedIntentionIds())

                ga('send', 'event', 'index', 'change', 'change-budget',$item.text())
            })

            $intentionTag.on('click', '.toggleTag img', function (event) {

                var $li = $(event.target).parent()
                var id = $li.attr('data-id')
                $intentionDetails.find('li[data-id=' + id + ']').removeClass('selected')
                $intentionDetails.find('input[value=' + id + ']').prop('checked', false)
                $li.remove()
                updateSuggestionTip(getSelectedIntentionIds())
                loadPropertyList(getSelectedBudgetTypeId(), getSelectedIntentionIds())

                ga('send', 'event', 'index', 'change', 'remove-intention-on-tag',$li.text())
            })

            $intentionDetails.find('[name=intention]').on('change', function (event) {
                var $li = $(this).closest('li')

                $li.toggleClass('selected', this.checked)

                if (this.checked) {
                    addIntetionTag($li.attr('data-id'), $li.attr('data-value'))
                    ga('send', 'event', 'index', 'change', 'add-intention',$li.text())
                }
                else {
                    removeIntentionTag($li.attr('data-id'))
                    ga('send', 'event', 'index', 'change', 'remove-intention-on-icon',$li.text())
                }
                updateSuggestionTip(getSelectedIntentionIds())
                loadPropertyList(getSelectedBudgetTypeId(), getSelectedIntentionIds())
            })

            $intentionTag.find('#add').click(function () {
                $('html, body').animate({scrollTop: $('.intentionTabs_wrapper').offset().top - 60 }, 'fast')
                $('.intentionTabs_wrapper').animate({height: getIntentionTabsHeight() + 'px'}, 400, 'swing')
                updateSuggestionTip(getSelectedIntentionIds())

                ga('send', 'event', 'index', 'click', 'extend-intention-selection')
            })

            $('.intentionTabs_wrapper').find('#collapseButton').click(function () {
                $('.intentionTabs_wrapper').animate({height: '0'}, 400, 'swing')

                ga('send', 'event', 'index', 'click', 'collapse-intention-selection')
            })
        }
    }

})(window.currantModule = window.currantModule || {})
