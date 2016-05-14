(function () {

    function image_upload_cdn_site($http) {
      var self = this
      this.result = null
      this.getdata = function () {
        if (this.result) {
          window.console.log('access cache.')
          return self.result
        }
        else {
          window.console.log('using ajax get data.')
        }
        jQuery.ajax({
          url: 'api/1/upload-cdn-domains',
          success: function(data) {
            self.result = data.val
          },
          async: false
        })
        return self.result
      }
    }

    angular.module('app').service('imageUploadCDNSiteApi', image_upload_cdn_site)
})()
