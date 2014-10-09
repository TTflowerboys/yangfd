$(function () {
    // on page load

    function loadListData($list, array) {
        $list.empty()
        _.each(array, function (message) {
            var messageResult = _.template($('#messageCell_template').html())({message: message})
            $list.append(messageResult)
        })
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

        _.each(allData, function(item) {
            if (item.status ==='new') {
                newData.push(item)
            }
        })

        var readData = []
        _.each(allData, function(item) {
            if (item.status ==='read') {
                readData.push(item)
            }
        })

        window.startPaging(allData, 4, $('.allList_wrapper #pager #pre'), $('.allList_wrapper #pager #next'), loadAllData)

        window.startPaging(newData, 4, $('.newList_wrapper #pager #pre'), $('.newList_wrapper #pager #next'), loadNewData)

        window.startPaging(readData, 4, $('.readList_wrapper #pager #pre'), $('.readList_wrapper #pager #next'), loadReadData)
    }

    reloadData(window.allData)

    function showMessageListWithState (state) {

        $('.buttons .button').removeClass('button').addClass('ghostButton')
        $('.buttons .' + state).removeClass('ghostButton').addClass('button')
        $('.list_wrapper').hide()
        if (window.isDataChanged) {
            reloadData(window.allData)
            window.isDataChanged = false
        }
        $('.' + state + 'List_wrapper').show()
    }

    function markMessageRead (messageId) {
        $.betterPost('/api/1/message/'+ messageId + '/mark/' + 'read')
            .done(function (data) {
                markDataChanged(messageId)
            })
            .fail(function (ret) {
            })
            .always(function () {

            })
    }

    function markDataChanged (messageId) {
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

    $('.list').on('click', '.cell #showHide', function (event){
        var $currentTarget = $(event.currentTarget)
        var status = $currentTarget.attr('data-status')
        var state =  $currentTarget.attr('data-state')

        if (state === 'close') {
            $currentTarget.parent().parent().find('.content').show()
            $currentTarget.attr('data-state', 'open')
            $currentTarget.text(window.i18n('收起'))

            if (status === 'new') {
                markMessageRead($currentTarget.attr('data-id'))
            }
        }
        else {
            $currentTarget.parent().parent().find('.content').hide()
            $currentTarget.attr('data-state', 'close')
            $currentTarget.text(window.i18n('展开'))
        }
    })
})
