/* Created by frank on 14-10-6. */
(function ($) {

    if (window.historical_price) {
        if ($.browser.msie && parseInt($.browser.version, 10) <= 8) {
            $(window).on('load', function () {
                showCharts()
            })
        } else {
            $(function () { showCharts() })
        }
    }

    function parseData(historicalPrice) {
        var red = '#e20013'
        var result = {
            labels: [],
            datasets: [
                {
                    fillColor: 'rgba(255,255,255,0)',
                    strokeColor: red,
                    pointColor: red,
                    pointStrokeColor: red,
                    data: []
                }
            ]
        }
        for (var i = 0, length = historicalPrice.length; i < length; i += 1) {
            var date = new Date(historicalPrice[i].time * 1000)
            var dateString = [date.getFullYear(), date.getMonth()].join('.')
            result.labels.push(dateString)
            result.datasets[0].data.push(parseFloat(historicalPrice[i].price.value).toFixed(2))
        }

        return result

    }

    function showCharts() {
        var data = parseData(window.historical_price)


        var chart = document.getElementById('lineChart')
        var ctx;
        // var G_vmlCanvasManager;
        // // code for IE browsers
        // if (window.G_vmlCanvasManager)
        // {
        //     chart = window.G_vmlCanvasManager.initElement(chart);
        //     ctx = chart.getContext('2d');
        // }
        // // Non IE browsers
        // else
        // {
        //     ctx = chart.getContext('2d');
        // }

        ctx = chart.getContext('2d');
        if (window.team.isPhone()) {
            chart.setAttribute('width', $(window).width())
            chart.setAttribute('height', $(window).width() / 2)
        }
        else {
            chart.setAttribute('width', '800')
            chart.setAttribute('height', '400')
        }

        new Chart(ctx).Line(data, {
            bezierCurve: false,
            scaleLabel: '<%= team.encodeCurrency(value) %>',
            tooltipTemplate: '<%= team.encodeCurrency(value) %>',
            showTooltips: true
        })

    }


})(jQuery)
