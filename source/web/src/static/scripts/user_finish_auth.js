(function () {



    $('input:file').change(function (){
        if ($(this)[0].files) {
            var formData = new FormData()
            formData.append('data', $(this)[0].files[0])

            $('#loading').show()
            $.ajax({
                url: '/api/1/upload_image',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false
            }).done(function (response) {
                var div = $('<div><span></span><br/><img src="" alt=""/><hr/></div>')
                $('.uploadArea').append(div)
                div.find('img').prop('src', response.val.url)
            }).always(function () {
                $('#loading').hide()

            })
        }
    });

    $('button.submit').click(function () {
        var params = {idcard:$('.uploadArea img').prop('src')}
        $.betterPost('/api/1/user/edit', params)
            .done(function (data) {
                window.user = data

            })
            .fail(function (data) {

            })
    })


})()
