/**
 * Created by zhou on 15-2-6.
 */
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

function changeMainPage(page) {
    $.each($('.contentFrame'), function (i, val) {

        if (i === page) {
            $(this).show()
        } else {
            $(this).hide()
        }
    })
}

$(function () {
    //reload data or setup empty place holder
    var orderArray = JSON.parse($('#accountOrderList').text())
    updateAccountOrderListItems(orderArray)
})
$(function () {
    //reload data or setup empty place holder
    var orderArray = JSON.parse($('#transactionOrderList').text())
    updateTransactionListItems(orderArray)
})
$(function () {
    //reload data or setup empty place holder
    var orderArray = JSON.parse($('#earningOrderList').text())
    updateEarningListItems(orderArray)
})

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
            var orderResult = _.template($('#investment_list_item_template').html())({order: order})
            $('#investmentList').append(orderResult)

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
    var data = {}
    switch (page) {
        case 1:
            break;
        case 2:
            break;
        case 3:
            break;
        default:
            break;
    }
    updateTransactionList(data)
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

function updateInvestmentListItems(data) {
    $.each($('#investmentList tr td'), function (i, val) {
        $(this).parent().remove()
    })
    if (data.length > 0) {
        _.each(data, function (order) {
            var orderResult = _.template($('#investment_list_item_template').html())({order: order})
            $('#investmentList').append(orderResult)
        })
    }
}

function updateInvestmentList(params) {
    $.betterPost('/api/1/order/search', params)
        .done(function (val) {
            updateInvestmentListItems(val)
        })
        .fail(function (errorCode) {

        })
        .always(function () {

        })
}

function updateEarningListItems(data) {
    $.each($('#earningList tr td'), function (i, val) {
        $(this).parent().remove()
    })
    if (data.length > 0) {
        _.each(data, function (order) {
            var orderResult = _.template($('#earning_list_item_template').html())({order: order})
            $('#earningList').append(orderResult)
        })
    }
}

function updateEarningList(params) {
    $.betterPost('/api/1/order/search', params)
        .done(function (val) {
            updateEarningListItems(val)
        })
        .fail(function (errorCode) {

        })
        .always(function () {

        })
}

function updateTransactionListItems(data) {
    $.each($('#transaction_list tr td'), function (i, val) {
        $(this).parent().remove()
    })
    if (data.length > 0) {
        _.each(data, function (order) {
            var orderResult = _.template($('#transaction_list_item_template').html())({order: order})
            $('#transaction_list').append(orderResult)
        })
    }
}

function updateTransactionList(params) {
    $.betterPost('/api/1/order/search', params)
        .done(function (val) {
            updateTransactionListItems(val)
        })
        .fail(function (errorCode) {

        })
        .always(function () {

        })
}

function updateAccountOrderListItems(data) {
    $.each($('#account_transaction_list tr td'), function (i, val) {
        $(this).parent().remove()
    })
    if (data.length > 0) {
        _.each(data, function (order) {
            var orderResult = _.template($('#transaction_list_item_template').html())({order: order})
            $('#account_transaction_list').append(orderResult)
        })

    }
}

function updateAccountOrderList(params) {
    $.betterPost('/api/1/order/search', params)
        .done(function (val) {
            updateAccountOrderListItems(val)
        })
        .fail(function (errorCode) {

        })
        .always(function () {

        })
}

function changeTransactionType(page) {
    var data = {}
    switch (page) {
        case 1:
            data.type = 'recharge'
            break;
        case 2:
            data.type = 'withdrawal'
            break;
        case 3:
            data.type = 'investment'
            break;
        case 4:
            data.type = 'earnings'
            break;
        case 5:
            data.type = 'recovery'
            break;
        default:
            data.type = 'recharge,withdrawal,investment,earnings,recovery'
            break;
    }
    updateTransactionList(data)
}

function changeAccountTransactionType(page) {
    var data = {}
    switch (page) {
        case 1:
            data.type = 'recharge'
            break;
        case 2:
            data.type = 'withdrawal'
            break;
        default:
            data.type = 'recharge,withdrawal'
            break;
    }
    updateAccountOrderList(data)
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
    var data = {}
    switch (page) {
        case 1:
            break;
        case 2:
            break;
        case 3:
            break;
        default:
            break;
    }
    updateAccountOrderList(data)
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
    var data = {}
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
    updateEarningList(data)
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
    var data = {}
    switch (page) {
        case 1:
            break;
        case 2:
            break;
        default:
            break;
    }
    updateEarningList(data)
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
        var data = {}
        if (obj.date1) {
            data.starttime = parseInt((new Date($.format.date(obj.date1, 'yyyy-MM-dd')) - 0) / 1000, 10)
        } else {
            delete data.starttime
        }
        if (obj.date2) {
            data.time = parseInt((new Date($.format.date(obj.date2, 'yyyy-MM-dd')) - 0) / 1000, 10) + 86399
        } else {
            delete data.time
        }
        updateTransactionList(data)
    });

$('#accountTransactionDateRange').dateRangePicker(
    {
        separator: ' to ',
        setValue: function (s, s1, s2) {
            $('#accountTransactionDateStart').val(s1);
            $('#accountTransactionDateEnd').val(s2);
        }
    }).bind('datepicker-apply', function (event, obj) {
        var data = {}
        if (obj.date1) {
            data.starttime = parseInt((new Date($.format.date(obj.date1, 'yyyy-MM-dd')) - 0) / 1000, 10)
        } else {
            delete data.starttime
        }
        if (obj.date2) {
            data.time = parseInt((new Date($.format.date(obj.date2, 'yyyy-MM-dd')) - 0) / 1000, 10) + 86399
        } else {
            delete data.time
        }
        updateAccountOrderList(data)
    });