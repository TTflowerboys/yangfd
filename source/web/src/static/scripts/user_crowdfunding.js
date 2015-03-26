/**
 * Created by zhou on 15-2-6.
 */
var per_page = 12
var earningParams = {type: 'earnings', per_page: per_page}
var investmentParams = {type: 'investment', per_page: per_page}
var transactionParams = {type: 'recharge,withdrawal,investment,earnings,recovery', per_page: per_page}
var accountOrderParams = {type: 'recharge,withdrawal', per_page: per_page}

window.getCrowdfundingType = function (type) {
    var inputCrowdfundingType = {
        'recharge': i18n('充值'),
        'earnings': i18n('收益'),
        'withdrawal': i18n('提现'),
        'investment': i18n('投资'),
        'recovery': i18n('回收本金')
    }
    return inputCrowdfundingType[type] || ''
}

window.getCrowdfundingItem = function (item) {
    var inputCrowdfundingItem = {
        'item_recharge': i18n('充值'),
        'item_earnings': i18n('收益'),
        'item_withdrawal': i18n('提现'),
        'item_recovery': i18n('回收本金')
    }
    return inputCrowdfundingItem[item] || item
}

window.getCrowdfundingHref = function (type, id) {
    if (type === 'investment') {
        return '/crowdfunding/' + id
    } else {
        return '#'
    }
}

$('.titleFrame tr .titleCell a').click(function () {
    $('.rechargeFrame').hide()
    $('.withdrawalFrame').hide()
    $('.mainFrame').show()
    var text = $(this).text()
    $.each($('.titleFrame tr .titleCell a'), function (i, val) {
        if ($(this).text() === text) {
            if ($(this).parent().hasClass('selected')) {
                return
            } else {
                $(this).parent().addClass('selected')
                changeMainPage(i)
            }
        } else {
            if ($(this).parent().hasClass('selected')) {
                $(this).parent().removeClass('selected')
            }
        }
    })
})


var investment
var investmentPage
var earning
var earningPage
var transaction
var transactionPage
var accountOrder
var accountOrderPage


function changeMainPage(page) {
    $.each($('.contentFrame'), function (i, val) {

        if (i === page) {
            $(this).show()
        } else {
            $(this).hide()
        }
    })
    switch (page) {
        case 1:
            if (investment === undefined) {
                investment = []
                investmentPage = 0
                initInvestment()
                updateInvestment()
            }
            break;
        case 2:
            if (earning === undefined) {
                earning = []
                earningPage = 0
                initEarning()
                updateEarning()
            }
            break;
        case 3:
            if (transaction === undefined) {
                transaction = []
                transactionPage = 0
                initTransaction()
                updateTransaction()
            }
            break;
        case 4:
            if (accountOrder === undefined) {
                accountOrder = []
                accountOrderPage = 0
                initAccountOrder()
                updateAccountOrder()
            }
            break;
    }
}

var colors = ['#F7464A', '#46BFBD', '#FDB45C']
var colorIndex = 0
$(function () {
    //reload data or setup empty place holder
    var orderArray = JSON.parse($('#investmentOrderList').text())
    if (orderArray.length > 0) {

        var data = []
        var cities = {}
        var values = {}
        var indexes = {}
        _.each(orderArray, function (order) {
            var city = order.items[0].city ? order.items[0].city.value : ''
            if (cities[city]) {
                values[city] += order.price
                data[indexes[city]].value = values[city]
            } else {
                cities[city] = colors[colorIndex]
                indexes[city] = colorIndex
                colorIndex += 1
                values[city] = order.price
                data.push({
                    value: values[city],
                    color: cities[city],
                    highlight: cities[city],
                    label: city
                })
            }
        })
        var chart = document.getElementById('investmentArea')
        var ctx;
        ctx = chart.getContext('2d');
        if (window.team.isPhone()) {
            chart.setAttribute('width', $(window).width())
            chart.setAttribute('height', $(window).width() / 2)
        }
        else {
            chart.setAttribute('width', '800')
            chart.setAttribute('height', '400')
        }
        var helpers = Chart.helpers;

        var moduleDoughnut = new Chart(ctx).Doughnut(data, {
            //Number - The percentage of the chart that we cut out of the middle
            percentageInnerCutout: 0, // This is 0 for Pie charts
            //Number - Amount of animation steps
            animation: false,
            //String - A legend template
            legendTemplate: '<ul class=\'<%=name.toLowerCase()%>-legend\'><% for (var i=0; i<segments.length; i++){%><li><span style=\'background-color:<%=segments[i].fillColor%>\'></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>'

        })
        var legendHolder = document.createElement('div');
        legendHolder.innerHTML = moduleDoughnut.generateLegend();
        // Include a html legend template after the module doughnut itself
        helpers.each(legendHolder.firstChild.childNodes, function (legendNode, index) {
            helpers.addEvent(legendNode, 'mouseover', function () {
                var activeSegment = moduleDoughnut.segments[index];
                activeSegment.save();
                activeSegment.fillColor = activeSegment.highlightColor;
                moduleDoughnut.showTooltip([activeSegment]);
                activeSegment.restore();
            });
        });
        helpers.addEvent(legendHolder.firstChild, 'mouseout', function () {
            moduleDoughnut.draw();
        });
        chart.parentNode.parentNode.appendChild(legendHolder.firstChild);
    }
})

$('.transactionDate div').click(function () {

    var text = $(this).text()
    $.each($('.transactionDate div'), function (i, val) {
        if ($(this).text() === text) {
            if ($(this).hasClass('selected')) {
                return
            } else {
                $(this).addClass('selected')
                changeTransactionDate(i)
            }
        } else {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected')
            }
        }
    })
})
function changeTransactionDate(page) {
    var time = new Date()
    switch (page) {
        case 1:
            transactionParams.time = parseInt((time - 0) / 1000)
            time.setDate(time.getDate() - 7)
            transactionParams.starttime = parseInt((time - 0) / 1000)
            break;
        case 2:
            transactionParams.time = parseInt((time - 0) / 1000)
            time.setMonth(time.getMonth() - 1)
            transactionParams.starttime = parseInt((time - 0) / 1000)
            break;
        case 3:
            transactionParams.time = parseInt((time - 0) / 1000)
            time.setMonth(time.getMonth() - 3)
            transactionParams.starttime = parseInt((time - 0) / 1000)
            break;
        default:
            delete transactionParams.time
            delete transactionParams.starttime
            break;
    }
    transaction = []
    transactionPage = 0
    updateTransaction()
}

$('.transactionType div').click(function () {

    var text = $(this).text()
    $.each($('.transactionType div'), function (i, val) {
        if ($(this).text() === text) {
            if ($(this).hasClass('selected')) {
                return
            } else {
                $(this).addClass('selected')
                changeTransactionType(i)
            }
        } else {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected')
            }
        }
    })
})

$('.recharge').click(function () {
    $('.rechargeFrame').show()
    $('.mainFrame').hide()
})

$('.withdrawal').click(function () {
    $('.withdrawalFrame').show()
    $('.mainFrame').hide()
})

function changeTransactionType(page) {
    switch (page) {
        case 1:
            transactionParams.type = 'recharge'
            break;
        case 2:
            transactionParams.type = 'withdrawal'
            break;
        case 3:
            transactionParams.type = 'investment'
            break;
        case 4:
            transactionParams.type = 'earnings'
            break;
        case 5:
            transactionParams.type = 'recovery'
            break;
        default:
            transactionParams.type = 'recharge,withdrawal,investment,earnings,recovery'
            break;
    }
    transaction = []
    transactionPage = 0
    updateTransaction(transactionParams)
}

function changeAccountTransactionType(page) {
    switch (page) {
        case 1:
            accountOrderParams.type = 'recharge'
            break;
        case 2:
            accountOrderParams.type = 'withdrawal'
            break;
        default:
            accountOrderParams.type = 'recharge,withdrawal'
            break;
    }
    accountOrder = []
    accountOrderPage = 0
    updateAccountOrder()
}

$('.accountTransactionType div').click(function () {

    var text = $(this).text()
    $.each($('.accountTransactionType div'), function (i, val) {
        if ($(this).text() === text) {
            if ($(this).hasClass('selected')) {
                return
            } else {
                $(this).addClass('selected')
                changeAccountTransactionType(i)
            }
        } else {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected')
            }
        }
    })
})

$('.accountTransactionDate div').click(function () {

    var text = $(this).text()
    $.each($('.accountTransactionDate div'), function (i, val) {
        if ($(this).text() === text) {
            if ($(this).hasClass('selected')) {
                return
            } else {
                $(this).addClass('selected')
                changeAccountTransactionDate(i)
            }
        } else {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected')
            }
        }
    })
})

function changeAccountTransactionDate(page) {
    var time = new Date()
    switch (page) {
        case 1:
            accountOrderParams.time = parseInt((time - 0) / 1000)
            time.setDate(time.getDate() - 7)
            accountOrderParams.starttime = parseInt((time - 0) / 1000)
            break;
        case 2:
            accountOrderParams.time = parseInt((time - 0) / 1000)
            time.setMonth(time.getMonth() - 1)
            accountOrderParams.starttime = parseInt((time - 0) / 1000)
            break;
        case 3:
            accountOrderParams.time = parseInt((time - 0) / 1000)
            time.setMonth(time.getMonth() - 3)
            accountOrderParams.starttime = parseInt((time - 0) / 1000)
            break;
        default:
            delete accountOrderParams.time
            delete accountOrderParams.starttime
            break;
    }
    accountOrder = []
    accountOrderPage = 0
    updateAccountOrder()
}

$('.earningProject div').click(function () {

    var text = $(this).text()
    $.each($('.earningProject div'), function (i, val) {
        if ($(this).text() === text) {
            if ($(this).hasClass('selected')) {
                return
            } else {
                $(this).addClass('selected')
                changeEarningProject(i)
            }
        } else {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected')
            }
        }
    })
})

function changeEarningProject(page) {
    switch (page) {
        case 1:
            break;
        case 2:
            break;
        case 3:
            break;
        case 4:
            break;
        case 5:
            break;
        default:
            break;
    }
    earning = []
    earningPage = 0
    updateEarning()
}

$('.earningDate div').click(function () {

    var text = $(this).text()
    $.each($('.earningDate div'), function (i, val) {
        if ($(this).text() === text) {
            if ($(this).hasClass('selected')) {
                return
            } else {
                $(this).addClass('selected')
                changeEarningDate(i)
            }
        } else {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected')
            }
        }
    })
})
function changeEarningDate(page) {
    var time = new Date()
    switch (page) {
        case 1:
            earningParams.time = parseInt((time - 0) / 1000)
            time.setMonth(time.getMonth() - 6)
            earningParams.starttime = parseInt((time - 0) / 1000)
            break;
        case 2:
            time.setMonth(time.getMonth() - 6)
            earningParams.time = parseInt((time - 0) / 1000)
            delete earningParams.starttime
            break;
        default:
            delete earningParams.time
            delete earningParams.starttime
            break;
    }
    earning = []
    earningPage = 0
    updateEarning()
}

$('.recharge_payment_type').click(function () {
    var text = $(this).children('div.title')[0].innerText
    $.each($('.recharge_payment_type'), function (i, val) {
        if ($(this).children('div.title')[0].innerText === text) {
            if ($(this).hasClass('selected')) {
                return
            } else {
                $(this).addClass('selected')
                changeRechargePayment(i)
            }
        } else {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected')
            }
        }
    })
})
function changeRechargePayment(page) {
    switch (page) {
        case 1:
            $('.rechargeNoCard').show();
            $('.rechargeWithCard').hide();
            break;
        default:
            $('.rechargeWithCard').show();
            $('.rechargeNoCard').hide();
            break;
    }
}

$('#transactionDateRange').dateRangePicker(
    {
        separator: ' to ',
        setValue: function (s, s1, s2) {
            $('#transactionDateStart').val(s1);
            $('#transactionDateEnd').val(s2);
        }
    }).bind('datepicker-apply', function (event, obj) {
        if (obj.date1) {
            transactionParams.starttime = parseInt((new Date($.format.date(obj.date1, 'yyyy-MM-dd')) - 0) / 1000, 10)
        } else {
            delete transactionParams.starttime
        }
        if (obj.date2) {
            transactionParams.time = parseInt((new Date($.format.date(obj.date2, 'yyyy-MM-dd')) - 0) / 1000, 10) + 86399
        } else {
            delete transactionParams.time
        }
        transaction = []
        transactionPage = 0
        updateTransaction()
    });

$('#accountTransactionDateRange').dateRangePicker(
    {
        separator: ' to ',
        setValue: function (s, s1, s2) {
            $('#accountTransactionDateStart').val(s1);
            $('#accountTransactionDateEnd').val(s2);
        }
    }).bind('datepicker-apply', function (event, obj) {
        if (obj.date1) {
            accountOrderParams.starttime = parseInt((new Date($.format.date(obj.date1, 'yyyy-MM-dd')) - 0) / 1000, 10)
        } else {
            delete accountOrderParams.starttime
        }
        if (obj.date2) {
            accountOrderParams.time = parseInt((new Date($.format.date(obj.date2, 'yyyy-MM-dd')) - 0) / 1000,
                10) + 86399
        } else {
            delete accountOrderParams.time
        }
        accountOrder = []
        accountOrderPage = 0
        updateAccountOrder()
    });

function showPreButton(preButtonId, currentPage) {
    if (currentPage === 0) {
        $(preButtonId).css('visibility', 'hidden')
    } else {
        $(preButtonId).css('visibility', 'visible')
    }
}

function showNextButton(nextButtonId, data) {
    if (data.length < per_page) {
        $(nextButtonId).css('visibility', 'hidden')
    } else {
        $(nextButtonId).css('visibility', 'visible')
    }
}

function showPager(currentPage, data, preButtonId, nextButtonId) {
    showPreButton(preButtonId, currentPage)
    showNextButton(nextButtonId, data)
}

function loadDataItems(data, tdId, listId, emptyId, templateId) {
    $.each($(tdId), function (i, val) {
        $(this).parent().remove()
    })
    if (data.length > 0) {
        $(listId).show()
        $(emptyId).hide()
        _.each(data, function (order) {
            var orderResult = _.template($(templateId).html())({order: order})
            $(listId).append(orderResult)
        })
    } else {
        $(listId).hide()
        $(emptyId).show()
    }
}

function loadData(params, data, currentPage, tdId, listId, emptyId, templateId, preButtonId, nextButtonId, progressId) {
    $(progressId).show()
    $.betterPost('/api/1/order/search', params)
        .done(function (val) {
            loadDataItems(val, tdId, listId, emptyId, templateId)
            data.push(val)
            showPager(currentPage, val, preButtonId, nextButtonId)
        })
        .fail(function (errorCode) {

        })
        .always(function () {
            $(progressId).hide()
        })
}

function updateData(params, data, currentPage, tdId, listId, emptyId, templateId, preButtonId, nextButtonId,
                    progressId) {

    if (currentPage < data.length) {
        loadDataItems(data[currentPage], tdId, listId, emptyId, templateId)
        showPager(currentPage, data[currentPage], preButtonId, nextButtonId)
    } else {
        if (currentPage === 0) {
            delete params.time
        } else {
            var lastData = data[data.length - 1]
            params.time = lastData[lastData.length - 1].time
        }
        loadData(params, data, currentPage, tdId, listId, emptyId, templateId, preButtonId, nextButtonId, progressId)
    }
}

function initData(params, data, currentPage, tdId, listId, emptyId, templateId, preButtonId, nextButtonId, progressId) {
    $(preButtonId).click(function () {
        currentPage -= 1
        updateData(params, data, currentPage, tdId, listId, emptyId, templateId, preButtonId, nextButtonId)
    })
    $(nextButtonId).click(function () {
        currentPage += 1
        updateData(params, data, currentPage, tdId, listId, emptyId, templateId, preButtonId, nextButtonId)
    })
}

function initInvestment() {
    initData(investmentParams, investment, investmentPage, '#investmentList tr td', '#investmentList',
        '#emptyInvestmentList #emptyPlaceHolder', '#investment_list_item_template', '#investmentPager #pager #pre',
        '#investmentPager #pager #next', '#emptyInvestmentList #loadIndicator')
}

function updateInvestment() {
    updateData(investmentParams, investment, investmentPage, '#investmentList tr td', '#investmentList',
        '#emptyInvestmentList #emptyPlaceHolder', '#investment_list_item_template', '#investmentPager #pager #pre',
        '#investmentPager #pager #next', '#emptyInvestmentList #loadIndicator')
}

function initEarning() {
    initData(earningParams, earning, earningPage, '#earningList tr td', '#earningList',
        '#emptyEarningList #emptyPlaceHolder', '#earning_list_item_template', '#earningPager #pager #pre',
        '#earningPager #pager #next', '#emptyEarningList #loadIndicator')
}

function updateEarning() {
    updateData(earningParams, earning, earningPage, '#earningList tr td', '#earningList',
        '#emptyEarningList #emptyPlaceHolder', '#earning_list_item_template', '#earningPager #pager #pre',
        '#earningPager #pager #next', '#emptyEarningList #loadIndicator')
}

function initTransaction() {
    initData(transactionParams, transaction, transactionPage, '#transaction_list tr td', '#transaction_list',
        '#emptyTransactionList #emptyPlaceHolder', '#transaction_list_item_template', '#transactionPager #pager #pre',
        '#transactionPager #pager #next', '#emptyTransactionList #loadIndicator')
}

function updateTransaction() {
    updateData(transactionParams, transaction, transactionPage, '#transaction_list tr td', '#transaction_list',
        '#emptyTransactionList #emptyPlaceHolder', '#transaction_list_item_template', '#transactionPager #pager #pre',
        '#transactionPager #pager #next', '#emptyTransactionList #loadIndicator')
}

function initAccountOrder() {
    initData(accountOrderParams, accountOrder, accountOrderPage, '#account_transaction_list tr td',
        '#account_transaction_list', '#emptyAccountOrderList #emptyPlaceHolder', '#transaction_list_item_template',
        '#accountOrderPager #pager #pre', '#accountOrderPager #pager #next', '#emptyAccountOrderList #loadIndicator')
}

function updateAccountOrder() {
    updateData(accountOrderParams, accountOrder, accountOrderPage, '#account_transaction_list tr td',
        '#account_transaction_list', '#emptyAccountOrderList #emptyPlaceHolder', '#transaction_list_item_template',
        '#accountOrderPager #pager #pre', '#accountOrderPager #pager #next', '#emptyAccountOrderList #loadIndicator')
}