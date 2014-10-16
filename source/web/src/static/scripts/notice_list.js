$(function () {
    // on page load

    function loadData(array) {
        $('#list').empty()
        _.each(array, function (news) {
            var newsResult = _.template($('#noticeCell_template').html())({news: news})
            $('#list').append(newsResult)
        })
    }

    window.allData = JSON.parse($('.newsData').text())
    window.startPaging(window.allData, 10, $('#pager #pre'), $('#pager #next'), loadData)
})
