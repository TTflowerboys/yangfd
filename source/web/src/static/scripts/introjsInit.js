/**
 * Created by levy on 15-6-10.
 */
//if(!($.cookie('introjs') === 'hasShow')) {
    $.cookie('introjs', 'hasShow')
    introJs().setOptions({
        'skipLabel': window.i18n('跳过'),
        'nextLabel': window.i18n('下一条'),
        'prevLabel': window.i18n('上一条'),
    }).start()
//}

function startIntro() {
    var intro = introJs();
    var webSteps = [
        {
            element: $('#contactRequest')[0],
            intro: '看到中意的房产，可以点击此处的收藏按钮来收藏，也可以点击分享按钮将房产分享给您的朋友',
            position: 'bottom'
        }
    ]
    intro.setOptions({
        steps: [
            {
                element: $('.floatBar_phone')[0],
                intro: '点击左边的电话可以查看房东的完整联系方式',
                tooltipPosition: '',
                position: 'top'
            },
            {
                element: $('.floatBar_phone')[0],
                intro: '点击右边的红心可以收藏中意的房产',
                position: 'top'
            },
        ],
        'showStepNumbers': false,
        'scrollToElement': false,
        'skipLabel': window.i18n('跳过'),
        'nextLabel': window.i18n('下一条'),
        'prevLabel': window.i18n('上一条'),
    })
    intro.start()
}
startIntro()