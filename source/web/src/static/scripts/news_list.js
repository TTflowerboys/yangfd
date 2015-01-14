window.updateCategoryFixed = function () {
    if (!window.team.isPhone()) {
        var scrollOffset = $(window).scrollTop()
        var $list = $('.content')
        var listTop = $list.offset().top
        var $category = $('.category')
        var tagsLeft = $list.offset().left + $list.width() + 40
        if (scrollOffset > listTop - 20) {
            $category.css({'position':'fixed', 'top':'20px', left:tagsLeft})
        }
        else {
            $category.css({'position':'static', 'top':'0', left:'0'})
        }
    }
}

$(window).scroll(window.updateCategoryFixed);
$(window).resize(window.updateCategoryFixed);


$(function () {

    var lastItemTime
    var onePageItemCount = 6
    var onePageMinItemCount = Math.ceil($('#main').height() / $('#newsCard_template').attr('data-cell-height'))
    if (onePageItemCount < onePageMinItemCount) {
        onePageItemCount = onePageMinItemCount;
    }

    // on page load
    function loadData() {
        $('#loadIndicator').show()
        $('#loadMore').hide()

        var param = {per_page:onePageItemCount}
        if (lastItemTime) {
            param.time = lastItemTime

            ga('send', 'event', 'news_list', 'trigger', 'load-more')
        }
        //category_slugs
        param.category_slugs = $('#contentType').text()

        $.betterPost('/api/1/news/search', param)
            .done(function (data) {
                var array = data
                if (!_.isEmpty(array)) {
                    lastItemTime = _.last(array).time
                    _.each(array, function (news) {
                        //Only for baidu approve
                        if(news.title.indexOf('贷') >= 0){
                            return
                        }

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

     $(window).scroll(function () {
        var scrollPos = $(window).scrollTop();
        var windowHeight = $(window).height();
        var listHeight = $('#list').height();

        setTimeout(function () {
            if (windowHeight  + scrollPos > listHeight &&  $('#loadMore').is(':visible')) {
                loadData()
            }
        }, 500)
    })
})
