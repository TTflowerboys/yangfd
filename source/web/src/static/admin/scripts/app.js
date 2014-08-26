/* Created by frank on 14-8-14. */

angular.module('app',
    ['ui.router', 'angular-loading-bar', 'angularFileUpload', 'ui.bootstrap', 'angular-growl', 'wysiwyg.module'])
    .run(function ($rootScope, $state, $stateParams, $sce) {

        // to make the go back buttons work
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.renderHtml = function (html) {
            return $sce.trustAsHtml(html);
        }
        $rootScope.alert = function (html) {
            return alert(html);
        }

    })
