(function () {
    $('form[name=addComment]').off('submit').submit(function (e) {
        e.preventDefault()
        var content = $(this).find('textarea[name=comment]').val().trim()
        if (!content && content.length) { return}
        var property = JSON.parse($('#pythonProperty').text())
        $.betterPost('/api/1/shop/54a3c92b6b809945b0d996bf/item/' + property.id + '/comment/add', {
            content: content})
            .done(function (val) {
                //load comment
                loadComment()
            })
            .fail(function (errorCode) {
            })
    })

    function loadComment() {
        var property = JSON.parse($('#pythonProperty').text())
        var params = {per_page:5}
        if (window.lastCommentTime) {
            params.time = window.lastCommentTime
        }

        $.betterGet('/api/1/shop/54a3c92b6b809945b0d996bf/item/' + property.id + '/comment/search', params)
            .done(function (val) {
            })
            .fail(function (errorCode) {
            })
    }

    loadComment()

})()
