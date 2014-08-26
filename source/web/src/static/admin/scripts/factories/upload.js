/* Created by frank on 14-8-20. */

(function () {

    function fctUpload($http, $state, $q, $upload) {
        return {
            projectImage: function (file) {
                return $upload.upload({
                    url: '/api/1/upload',
                    file: file,
                    fileFormDataName: 'data',
                    data: {width_limit: 1920, ratio: 1, thumbnail_size: '[400,400]'}
                })
            }
        }

    }

    angular.module('app').factory('fctUpload', fctUpload)
})()

