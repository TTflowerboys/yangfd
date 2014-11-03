$(function () {

    var lastItemTime
    var onePageItemCount = 6

    // on page load
    function loadData() {
        $('#loadIndicator').show()
        $('#loadMore').hide()

        var param = {per_page:onePageItemCount}
        if (lastItemTime) {
            param.time = lastItemTime
        }

        $.betterPost('/api/1/news/search', param)
            .done(function (data) {
                var array = data
                if (!_.isEmpty(array)) {
                    lastItemTime = _.last(array).time
                    _.each(array, function (news) {
                         var newsResult = _.template($('#newsCard_template').html())({news: news})
                        $('#list').append(newsResult)
                        if (lastItemTime > news.time) {
                            lastItemTime = news.time
                        }
                    })
                    $('#loadMore').show()
                }
                else {
                    $('#loadMore').hide()
                }

            })
            .fail(function (ret) {
            })
            .always(function () {
                $('#loadIndicator').hide()
            })
    }

    $('#loadMore').click(function () {
        loadData()
    })

    loadData()
})
