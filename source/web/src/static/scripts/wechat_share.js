(function () {
    // if (window.team.isWeChat()) {
    //     $('.wechatPage').show()
    // } else {
        $('.siteHeader_wrapper').show()
        $('.mainPage').show()
        $('.guidePage').show()

        var propertyId = team.getQuery('property', location.href)
        var newsId = team.getQuery('news',location.href)
        var propertyToRentId = team.getQuery('property_to_rent',location.href)

        var link
        if (propertyId) {
            link = location.origin + '/property/' + propertyId
            $('#linkInput').val(link)
            $('.mainPage').find('img').prop('src', '/qrcode/generate?content=' + encodeURIComponent(link))
        }else if(newsId){
            link = location.origin + '/news/' + newsId
            $('#linkInput').val(link)
            $('.mainPage').find('img').prop('src', '/qrcode/generate?content=' + encodeURIComponent(link))
        }else if(propertyToRentId){
            link = location.origin + '/wechat-poster/' + propertyToRentId
            $('#linkInput').val(link)
            $('.mainPage').find('img').prop('src', '/qrcode/generate?content=' + encodeURIComponent(link))
        }else {
            link = location.origin + '/app-download'
            $('#linkInput').val(link)
            $('.mainPage').find('img').prop('src', '/qrcode/generate?content=' + encodeURIComponent(link))
        }

        $('button[name=shareLink]').click(function (event) {

            $('html, body').animate({scrollTop: $('.guidePage').offset().top -10 }, 'fast')

        })
    //}
})()
