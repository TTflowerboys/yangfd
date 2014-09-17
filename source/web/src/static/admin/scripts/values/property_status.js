/* Created by frank on 14-9-15. */
angular.module('app')
    .constant('propertyStatus', [
        { name: '草稿', value: 'draft' },
        { name: '待翻译', value: 'not translated' },
        { name: '翻译中', value: 'translating' },
        { name: '待审核', value: 'not reviewed' },
        { name: '审核失败', value: 'rejected' },
        { name: '在售中', value: 'selling' },
        { name: '隐藏', value: 'hidden' },
        { name: '已售罄', value: 'sold out' }
        //{ name: '删除', value: 'deleted' }
    ])
