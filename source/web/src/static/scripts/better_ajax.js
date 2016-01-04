/* Created by frank on 14/10/21. */
$.each(['Post', 'Get'], function (index, key) {
    //var newName = 'better' + key
    var oldName = key.toLowerCase()
    var hiddenName = '_' + oldName
    $[hiddenName] = $[oldName]
    $[oldName] = function () {
        // if (window.console) {
        //     window.console.log(['Please use', '$.' + newName + '()', 'instead of', '$.' + oldName + '()'].join(' '))
        // }
        return $[hiddenName].apply($, arguments)
    }
    $['better' + key] = function () {
        window.betterAjaxXhr = window.betterAjaxXhr || {}
        var deferred = $.Deferred()
        window.betterAjaxXhr[arguments[0]] = $[hiddenName].apply($, arguments).done(function (data, textStatus, jqXHR) {
            if (data.ret !== undefined) {
                if (data.ret === 0) {
                    deferred.resolve(data.val)
                } else {
                    deferred.reject(data.ret, data)
                }
            } else {
                deferred.resolve(data, textStatus, jqXHR)
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            deferred.reject(jqXHR.status)
        }).always(function() {
            if($('.buttonLoading').length > 0 && !$('.buttonLoading').hasClass('manualTriggerLoadingEnd')) {
                $('.buttonLoading').trigger('end')
            }
        })
        return deferred.promise()
    }
})
