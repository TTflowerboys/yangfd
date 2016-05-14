(function () {

    function image_upload_cdn_site($http) {
      this.getdata = function () {
        var result = null
        jQuery.ajax({
          url: 'api/1/upload-cdn-domains',
          success: function(data) {
            result = data.val
          },
          async: false
        })
        return result
      }
    }

    angular.module('app').service('imageUploadCDNSiteApi', image_upload_cdn_site)
})()
