(function () {
    if (window.team.isWeChat()) {
        $('.wechatPage').show()
    } else {
        $('.siteHeader_wrapper').show()
        $('.mainPage').show()
        $('.guidePage').show()

        var propertyId = team.getQuery('property', location.href)
        if (propertyId) {
            var link = location.origin + '/property/' + propertyId
            $('#linkInput').val(link)
            $('.mainPage').find('img').prop('src', '/qrcode/generate?content=' + encodeURIComponent(link))
        }


        $('button[name=shareLink]').click(function (event) {

            $('html, body').animate({scrollTop: $('.guidePage').offset().top -10 }, 'fast')

        })
    }
})()
