window.onload = function () {

  'use strict';

    var Cropper = window.Cropper;
    var URL = window.URL || window.webkitURL;
    var container = document.querySelector('.profile-crop-image-container');
    var image = container.getElementsByTagName('img').item(0);
    var download = document.getElementById('download');
    var actions = document.getElementById('faceActions');
    var inputImage = document.getElementById('inputImage');
    var options = {
        aspectRatio: true,
        viewMode: true,
        center: false,
        modal: true,
        scalable: false,
        rotatable: false,
        zoomable: true,
        dragMode: 'move',
        guides: false,
        zoomOnTouch: false,
        zoomOnWheel: false,
        cropBoxMovable: false,
        cropBoxResizable: false,
        toggleDragModeOnDblclick: false,
        minCropBoxWidth: 200
    };
    var uploadedImageURL;
    var cropper = new Cropper(image, options);
    var result

  // Methods
  actions.querySelector('.btn-group').onclick = function (event) {
    var e = event || window.event;
    var target = e.target || e.srcElement;
    
    var input;
    var data;

    if (!cropper) { return; }

    while (target !== this) {
        if (target.getAttribute('data-method')) { break; }
        target = target.parentNode;
    }

    if (target === this || target.disabled || target.className.indexOf('disabled') > -1) {
        return;
    }

    data = {
        method: target.getAttribute('data-method'),
        target: target.getAttribute('data-target'),
        option: target.getAttribute('data-option')
    };

    if (data.method) {
        if (typeof data.target !== 'undefined') {
           input = document.querySelector(data.target);
        }

        result = cropper[data.method](data.option);

    }
  };


download.onclick = function(){
    result = cropper.getCroppedCanvas({width:200,height:200});
    if (result) {
        result.toBlob(function (blob) {
            var formData = new FormData();

            formData.append('data', blob);
            formData.append('watermark', false);

            $.ajax('/api/1/upload_image', {
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                beforeSend: function(){
                    download.className = 'btn btn-primary buttonLoading'
                },
                complete: function(){
                    download.className = 'btn btn-primary'
                },
                success: function (res) {
                    var ret = res.ret;
                    if (ret === 0) {
                        if (res.val && res.val.url) {
                            updateUserFace(res.val.url)
                        }
                        else{
                            window.dhtmlx.message({ type: 'error', text: 'error' })
                        }
                    }
                    else{
                        window.dhtmlx.message({ type: 'error', text: window.getErrorMessageFromErrorCode(ret) })
                    }
                },
                error: function () {
                    download.className = 'btn btn-primary'
                    window.dhtmlx.message({ type: 'error', text: 'error' })
                }
            });               
        })
    }
}




function updateUserFace(url) {
    $('#avator-img').attr('src','')
    $.betterPost('/api/1/user/edit', {'face': url})
        .done(function (data) {            
            $('#avator-img').attr('src',url)
            $('.close-modal').trigger('click')
        })
        .fail(function (ret) {
            $('.avator-mode').removeClass('loading')
            window.dhtmlx.message({ type: 'error', text: window.getErrorMessageFromErrorCode(ret) })
        })

}
  


    // Import image
    inputImage.onchange = function () {
        var files = this.files;
        var file;
        if (files && files.length) {
            file = files[0];
            if (/^image\/\w+/.test(file.type)) {
                if (uploadedImageURL) {
                    URL.revokeObjectURL(uploadedImageURL);
                }  
                image.src = uploadedImageURL = URL.createObjectURL(file);
                $('#popupUploadFace').modal()
                cropper.destroy();
                cropper = new Cropper(image, options);
                inputImage.value = null;
            }
            else {
                window.alert('Please choose an image file.');
            }
        }
    };

};



