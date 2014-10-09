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

    var allData = JSON.parse($('.messageData').text())
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

    window.startPaging(allData, 2, $('.allList_wrapper #pager #pre'), $('.allList_wrapper #pager #next'), loadAllData)

    window.startPaging(newData, 2, $('.newList_wrapper #pager #pre'), $('.newList_wrapper #pager #next'), loadNewData)

    window.startPaging(readData, 2, $('.readList_wrapper #pager #pre'), $('.readList_wrapper #pager #next'), loadReadData)

    function showMessageListWithState (state) {
        $('.buttons .button').removeClass('button').addClass('ghostButton')
        $('.buttons .' + state).removeClass('ghostButton').addClass('button')
        $('.list_wrapper').hide()
        $('.' + state + 'List_wrapper').show()
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
})
