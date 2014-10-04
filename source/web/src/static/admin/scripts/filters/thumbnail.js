/* Created by frank on 14-8-18. */
angular.module('app')
    .filter('thumbnail', function () {
        return function (url) {
            if (!url) {
                return
            }
            return url.indexOf('_thumbnail') === url.length - '_thumbnail'.length ? url : url + '_thumbnail'
        };
    });
