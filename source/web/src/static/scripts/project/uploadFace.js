var uploadFace = function() {
    var uploadProgress = $('#uploadProgress')
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
                window.dhtmlx.message({ type:'error', text: window.i18n('上传错误：错误代码') + '(' + data.ret + '),' + data.debug_msg})
            }else{
                $.betterPost('/api/1/user/edit', {'face': data.val.url})
                .done(function (data) {
                    pd.progressDiv.hide()
                    $('#avator-img').attr('src',data.val.thumbnail)
                })
                .fail(function (ret) {
                    uploadProgress.hide()
                    window.dhtmlx.message({ type: 'error', text: window.getErrorMessageFromErrorCode(ret) })
                })
            }            
        },
        onSubmit:function () {
            uploadProgress.show()
        },
        onError: function (files,status,errMsg,pd) {
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
})
    