angular.module('app')
    .filter('rentIntentionTags', function (misc, rentIntentionTags) {
        return function (tags) {
            if(tags) {
                return _.map(tags, function (val) {
                    return misc.findBy(rentIntentionTags, 'value', val).name
                }).join(',')
            } else {
                return ''
            }
        }
    })