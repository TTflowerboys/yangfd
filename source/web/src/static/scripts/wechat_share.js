(function () {

    var propertyId = team.getQuery('property', location.href)
    if (propertyId) {
        var link = location.origin + '/property/' + propertyId
        $('#linkInput').val(link)
        $('.mainPage').find('img').prop('src', '/qrcode/generate?content=' + encodeURIComponent(link))
    }
    
    // function selectLinkInput(length) {
    //     document.getElementById('linkInput').selectionStart = 0
    //     document.getElementById('linkInput').selectionEnd = 999
    // }
    
    $('button[name=shareLink]').click(function (event) {
       
        $('html, body').animate({scrollTop: $('.guidePage').offset().top -10 }, 'fast')

    })
})()
