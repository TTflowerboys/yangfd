(function () {

    $('[data-fn=expendDescription]').on('click', function () {
        $(this).parent().hide()
            .parent().find('[data-ui=description]').height('auto')
        $(this).parent().hide()
            .parent().find('[data-ui=description]').toggleClass( 'no-after' )
        ga('send', 'event', 'property_detail', 'click', 'extend-description')
    });

    window.videojs.options.flash.swf = '/static/vendors/video-js/video-js.swf';

    $('form[name=addComment]').off('submit').submit(function (e) {
        e.preventDefault()
        var content = $(this).find('textarea[name=comment]').val().trim()
        if (!content && content.length) { return}
        var property = JSON.parse($('#pythonProperty').text())
        $.betterPost('/api/1/shop/54a3c92b6b809945b0d996bf/item/' + property.id + '/comment/add', {
            content: content})
            .done(function (val) {
                //load comment
                window.loadNewComment(function () {
                    $('form[name=addComment]').find('textarea[name=comment]').val('') // clear when success
                })
            })
            .fail(function (errorCode) {
            })
    })

    window.loadNewComment = function (successCallback) {
        var property = JSON.parse($('#pythonProperty').text())
        var params = {}
        if (window.lastNewCommentTime) {
            params.last_time = window.lastNewCommentTime
        }

        $('.comments .loadIndicator').show()
        $('.comments .loadMore').hide()
        $.betterGet('/api/1/shop/54a3c92b6b809945b0d996bf/item/' + property.id + '/comment/search', params)
            .done(function (val) {
                var array = val
                if (!_.isEmpty(array)) {
                    window.lastCommentTime = _.first(array).time
                    var bulkResult = ''
                    _.each(array, function (comment) {
                        var commentResult = _.template($('#commentCell_template').html())({comment: comment})
                        bulkResult += commentResult

                        if (window.lastNewCommentTime < comment.time) {
                            window.lastNewCommentTime = comment.time
                        }
                    })

                    $('#comment_list').prepend(bulkResult)
                    $('.comments .loadMore').show()
                }
                else {
                    $('.comments .loadMore').hide()
                }
                successCallback()
                $('.comments .loadIndicator').hide()
            })
            .fail(function (errorCode) {
                $('.comments .loadIndicator').hide()
            })
    }

    window.loadComment = function () {
        var property = JSON.parse($('#pythonProperty').text())
        var params = {per_page:5}
        if (window.lastCommentTime) {
            params.time = window.lastCommentTime
        }

        $('.comments .loadIndicator').show()
        $('.comments .loadMore').hide()
        $.betterGet('/api/1/shop/54a3c92b6b809945b0d996bf/item/' + property.id + '/comment/search', params)
            .done(function (val) {
                var array = val
                if (!_.isEmpty(array)) {
                    window.lastCommentTime = _.last(array).time
                    var bulkResult = ''
                    _.each(array, function (comment) {
                        var commentResult = _.template($('#commentCell_template').html())({comment: comment})
                        bulkResult += commentResult

                        if (window.lastCommentTime > comment.time) {
                            window.lastCommentTime = comment.time
                        }
                    })
                    $('#comment_list').append(bulkResult)
                    $('.comments .loadMore').show()
                }
                else {
                    $('.comments .loadMore').hide()
                }
                $('.comments .loadIndicator').hide()
            })
            .fail(function (errorCode) {
                $('.comments .loadIndicator').hide()
            })
    }

    window.loadComment()

})()
