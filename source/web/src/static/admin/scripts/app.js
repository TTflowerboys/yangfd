/* Created by frank on 14-8-14. */


angular.module('app',
    ['ui.router', 'angular-loading-bar', 'angularFileUpload', 'ui.bootstrap', 'angular-growl', 'wysiwyg.module'])
    .run(function ($rootScope, $state, $stateParams, $sce) {

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.renderHtml = function (html) {
            return $sce.trustAsHtml(html);
        }
    })

angular.element(document).ready(function () {
    $.get('/api/1/user').done(function (response) {
        window._user = response.val;
        angular.bootstrap(document, ['app']);
    }).fail(function (response) {
        window.alert(response.status)
    })
})
