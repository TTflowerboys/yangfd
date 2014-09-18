var time = {}

function loadHouseList(param) {
    $.post('/api/1/property/search', param)
        .done(function (data) {
            if (data.ret !== 0) {
                console.log(data)
            }
            else {

                if (!_.isEmpty(data.val)) {
                    time = _.last(data.val).time
                    _.each(data.val, function (house) {
                        var houseResult =  _.template($('#houseCard_template').html())({house:house})
                        $('#result_list').append(houseResult)

                        if (time > house.time) {
                            time = house.time
                        }
                    })
                }
            }
        })
        .always(function () {

        })
}



$(function () {
    loadHouseList({'per_page':5})
})


$('#loadMore').click(function () {
    loadHouseList({'per_page': 5, 'time': time})
})
