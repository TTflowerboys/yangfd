angular.module('app')
    .filter('showLastDynamic', function ($filter) {
        return function (dynamics) {
            if(dynamics) {
                var dynamic = (dynamics || []).pop()
                if(dynamic) {
                    return dynamic.content + '(' + dynamic.user.nickname + i18n('发布于') + $filter('date')(dynamic.time, 'yyyy年MM月d日 H:mm') + ')'
                }
            }
            return i18n('暂无动态')
        }
    })