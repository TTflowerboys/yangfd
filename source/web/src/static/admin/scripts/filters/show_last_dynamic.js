angular.module('app')
    .filter('showLastDynamic', function ($filter) {
        return function (customFields, status) {
            if(customFields && status) {
                var dynamic = _.find(customFields || [], {key: 'dynamic'}) || {key: 'dynamic', value: '[]'}
                var lastDynamic = (_.filter(JSON.parse(dynamic.value), function (obj) {
                    return obj.status === status
                }) || []).pop()
                if(lastDynamic) {
                    return lastDynamic.content + '(' + lastDynamic.user.nickname + i18n('发布于') + $filter('date')(lastDynamic.time, 'yyyy年MM月d日 H:mm') + ')'
                }
            }
            return i18n('暂无动态')
        }
    })