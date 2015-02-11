(function () {
    var property = JSON.parse($('#pythonProperty').text())
    if (property.videos && property.videos[0] && property.videos[0].sources) {
        $.betterPost('/api/1/misc/get_video_source', {property_id:property.id})
            .done(function (data) {
                if (data && data.length) {
                    var videoResult = _.template($('#propertyVideo_template').html())({sources: data})
                    $('[data-tab-name=video]').append(videoResult)
                }
            })
            .fail(function (ret) {
            })
    }
})()
