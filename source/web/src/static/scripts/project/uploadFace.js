var uploadFace = function() {
    var uploadProgress = $('#uploadProgress')
    var image_panel = $('.image_panel')
    var uploadFileConfig = {
        url: '/api/1/upload_image',
        fileName: 'data',
        formData: {watermark: false},
        //showProgress: true,
        showPreview: true,
        showDelete: true,
        showDone: false,
        previewWidth: '100%',
        previewHeight: '100%',
        showQueueDiv: 'uploadProgress',
        maxFileCount: 1, //最多上传12张图片
        maxFileSize: 2 * 1024 * 1024, //允许单张图片文件的最大占用空间为2M
        uploadFolder: '',
        allowedTypes: 'jpg,jpeg,png,gif',
        acceptFiles: 'image/',
        allowDuplicates: false,
        statusBarWidth: '100%',
        dragdropWidth: '100%',
        multiDragErrorStr: window.i18n('不允许同时拖拽多个文件上传.'),
        extErrorStr: window.i18n('不允许上传. 允许的文件扩展名: '),
        duplicateErrorStr: window.i18n('不允许上传. 文件已存在.'),
        sizeErrorStr: window.i18n('不允许上传. 允许的最大尺寸为: '),
        uploadErrorStr: window.i18n('不允许上传'),
        maxFileCountErrorStr: window.i18n(' 不允许上传. 上传最大文件数为:'),
        abortStr: window.i18n('停止'),
        cancelStr: window.i18n('取消'),
        deletelStr: window.i18n('删除'),
        abortCallback: function () {
            uploadProgress.hide()
            image_panel.show()
        },
        deleteCallback: function(data, pd){
            uploadProgress.hide()
            image_panel.show()
        },
        onSuccess: function(files, data, xhr, pd){
            if(typeof data === 'string') { //This will happen in IE
                try {
                    data = JSON.parse(data.match(/<pre>((.|\n)+)<\/pre>/m)[1])
                } catch(e){
                    throw('Unexpected response data of uploading file!')
                }
            }
            if(data.ret) {
                uploadProgress.hide()
                image_panel.show()
                window.dhtmlx.message({ type:'error', text: window.i18n('上传错误：错误代码') + '(' + data.ret + '),' + data.debug_msg})
            }else{
                $.betterPost('/api/1/user/edit', {'face': data.val.url})
                .done(function (data) {
                    pd.progressDiv.hide()
                    window.location.reload()
                })
                .fail(function (ret) {
                    uploadProgress.hide()
                    window.dhtmlx.message({ type: 'error', text: window.getErrorMessageFromErrorCode(ret) })
                })
            }
        },
        onLoad: function(obj) {
            var face = JSON.parse($('#pythonUserData').text()).face
            if(face) {
                uploadProgress.show()
                image_panel.hide()
                obj.createProgress(face)
                var previewElem = $('#uploadProgress').find('.ajax-file-upload-statusbar').eq(0)
                previewElem.attr('data-url', face).find('.ajax-file-upload-progress').hide()
            }else{
                uploadProgress.hide()
                image_panel.show()
            }
        },
        onSubmit:function () {
            uploadProgress.show()
            image_panel.hide()
        },
        onError: function (files,status,errMsg,pd) {
            uploadProgress.hide()
            image_panel.show()
            return window.dhtmlx.message({ type:'error', text: window.i18n('图片') + files.toString() + i18n('上传失败(') + status + ':' + errMsg + i18n(')，请重新上传')})
        }
    }
    if(window.team.getClients().indexOf('ipad') >= 0) {
        uploadFileConfig.allowDuplicates = true
    }
    $('#fileuploader').uploadFile(uploadFileConfig)
}
$(function(){
    uploadFace()
    $('[data-fn=showUploadFace]').on('click', function () {
        $('#popupUploadFace').modal()
    })
    
})
    