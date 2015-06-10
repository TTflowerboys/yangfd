/**
 * Created by levy on 15-6-10.
 */
function startIntroOnPhone() {

}

function startIntroOnWeb() {
    var intro = window.introJs();
    intro.setOptions({
        steps: [
            {
                element: $('#contactRequest')[0],
                intro: i18n('小提示：点击此处可以查看房东的完整联系方式'),
                position: 'bottom'
            },
            {
                element: $('.actions tr').eq(0)[0],
                intro: i18n('小提示：看到中意的房产，可以点击此处的收藏按钮来收藏，也可以点击分享按钮将房产分享给您的朋友'),
                position: 'bottom'
            },
        ],
        'skipLabel': window.i18n('跳过'),
        'doneLabel': window.i18n('关闭'),
        'nextLabel': window.i18n('下一条'),
        'prevLabel': window.i18n('上一条'),
    })
    intro.start()
}

function initIntro() {
    //if(!($.cookie('introjs') === 'hasShow')) {
    //    $.cookie('introjs', 'hasShow')
        if(window.team.isPhone()) {
            startIntroOnPhone()
        } else {
            startIntroOnWeb()
        }
    //}
}
initIntro()