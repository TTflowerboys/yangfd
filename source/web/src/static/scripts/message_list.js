$(function () {
    // on page load

    function loadListData($list, array) {
        var $placeholder = $list.parent().find('#emptyPlaceHolder')
        $placeholder.hide()
        $list.empty()
        _.each(array, function (message) {
            var messageResult = _.template($('#messageCell_template').html())({message: message})
            $list.append(messageResult)
        })

        if (array && array.length) {
            $placeholder.hide()
        }
        else {
            $placeholder.show()
        }
    }


    function loadAllData(array) {
        loadListData($('.allList'), array)
    }


    function loadNewData(array) {
        loadListData($('.newList'), array)
    }


    function loadReadData(array) {
        loadListData($('.readList'), array)

    }

    window.allData = JSON.parse($('.messageData').text())

    function reloadData(allData) {
        var newData = []

        _.each(allData, function (item) {
            if (item.status === 'new') {
                newData.push(item)
            }
        })

        var readData = []
        _.each(allData, function (item) {
            if (item.status === 'read') {
                readData.push(item)
            }
        })

        window.startPaging(allData, 10, $('.allList_wrapper #pager #pre'), $('.allList_wrapper #pager #next'),
            loadAllData)

        window.startPaging(newData, 10, $('.newList_wrapper #pager #pre'), $('.newList_wrapper #pager #next'),
            loadNewData)

        window.startPaging(readData, 10, $('.readList_wrapper #pager #pre'), $('.readList_wrapper #pager #next'),
            loadReadData)
    }

    reloadData(window.allData)

    function showMessageListWithState(state) {
        $('.ui-tabs-nav li').removeClass('ui-tabs-selected')
        $('.ui-tabs-nav .'+state).addClass('ui-tabs-selected')
        $('.buttons .button').removeClass('button').addClass('ghostButton')
        $('.buttons .' + state).removeClass('ghostButton').addClass('button')
        $('.list_wrapper').hide()
        if (window.isDataChanged) {
            reloadData(window.allData)
            window.isDataChanged = false
        }
        $('.' + state + 'List_wrapper').show()
    }

    function markMessageRead(messageId) {
        $.betterPost('/api/1/message/' + messageId + '/mark/' + 'read')
            .done(function (data) {
                markDataChanged(messageId)
            })
            .fail(function (ret) {
            })
            .always(function () {

            })
    }

    function markDataChanged(messageId) {
        _.each(window.allData, function (item) {
            if (item.id === messageId) {
                item.status = 'read'
                window.isDataChanged = true
            }
        })
    }


    $('button#showAll').click(function () {
        showMessageListWithState('all')
    })

    $('button#showNew').click(function () {
        showMessageListWithState('new')
    })

    $('button#showRead').click(function () {
        showMessageListWithState('read')
    })

    $('.list').on('click', '.cell', function (event) {
        if ($(event.target).attr('id') === 'showHide' || $(event.target).attr('id') === 'title') {
            var $currentTarget = $(event.currentTarget)
            var $showHide = $currentTarget.find('#showHide')
            var status = $showHide.attr('data-status')
            var state = $showHide.attr('data-state')

            if (state === 'close') {
                $currentTarget.find('.content').show()
                $showHide.attr('data-state', 'open')
                $showHide.text(window.i18n('收起'))

                if (status === 'new') {
                    markMessageRead($showHide.attr('data-id'))
                }
            }
            else {
                $currentTarget.find('.content').hide()
                $showHide.attr('data-state', 'close')
                $showHide.text(window.i18n('展开'))
            }
        }
    })

    $('#showAllMsg').click(function () {
        showMessageListWithState('all')
    })

    $('#showNewMsg').click(function () {
        showMessageListWithState('new')
    })

    $('#showReadMsg').click(function () {
        showMessageListWithState('read')
    })

})
