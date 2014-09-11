/* Created by frank on 14-8-14. */


angular.module('app',
    ['ui.router', 'angular-loading-bar', 'angularFileUpload', 'ui.bootstrap', 'angular-growl', 'wysiwyg.module'])
    .run(function ($rootScope, $state, $stateParams, $sce) {

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.renderHtml = function (html) {
            if (typeof  html !== 'string') {
                return ''
            }
            return $sce.trustAsHtml(html || '');
        }
        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams) {
                if (toState.name === 'signIn') {
                    toParams.from = fromState.name
                }

            })
    })

angular.element(document).ready(function () {
    $.get('/api/1/user').done(function (response) {
        window._user = response.val;
        angular.bootstrap(document, ['app']);
    }).fail(function (response) {
    })
})
