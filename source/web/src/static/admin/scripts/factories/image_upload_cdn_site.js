(function () {

    function image_upload_cdn_site($http) {
      this.value = []
      this.getdata = function () {
        return $http.get('api/1/upload-cdn-domains')
      }
    }

    angular.module('app')
      .service('image_upload_cdn_site_api', image_upload_cdn_site)
      .run(function (image_upload_cdn_site_api) {
        image_upload_cdn_site_api.getdata().success(function (data) {
          image_upload_cdn_site_api.value = data.val
        })
      })
})()
