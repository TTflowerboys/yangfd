angular.module('app')
    .constant('rentIntentionTags', [
        { name: i18n('完全匹配'), value: 'perfect_match' },
        { name: i18n('部分匹配'), value: 'partial_match' },
    ]).run(function ($rootScope, rentIntentionTags) {
        $rootScope.rentIntentionTags = rentIntentionTags
    })
