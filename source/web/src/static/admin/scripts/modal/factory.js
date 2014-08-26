/* Created by frank on 14-8-19. */
(function () {

    function fctModal($http, $state, $q, $modal) {
        return {
            show: function (content, title, ok, cancel) {
                $modal.open({
                    templateUrl: '/static/admin/templates/modal.tpl.html',
                    controller: 'ctrlModal',
                    resolve: {
                        title: function () {
                            return title || 'Are you sure?'
                        },
                        content: function () {
                            return content || ''
                        }
                    }
                }).result.then(function (data) {
                        if (ok) { ok(data)}
                    }, function (data) {
                        if (cancel) {cancel(data)}
                    })
            }
        }

    }

    angular.module('app').factory('fctModal', fctModal)
})()

