/* Created by frank on 14-10-6. */
(function ($) {

    if (window.historical_price) {
        if ($.browser.ie && $.browser.version <= 8) {
            $(window).on('load', showCharts)
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
            result.datasets[0].data.push(historicalPrice[i].price.value)
        }

        return result

    }

    function showCharts() {
        var data = parseData(window.historical_price)
        var ctx = document.getElementById('lineChart').getContext('2d');
        new Chart(ctx).Line(data, {
            bezierCurve: false,
            inGraphDataShow: true,
            yAxisMinimumInterval: 1000,
            yAxisMaximumInterval: 20000,
            inGraphDataFontColor: '#aaaaaa',
            inGraphDataFontSize: 12,
            inGraphDataAlign: 'center',
            graphSpaceBefore: 12
        })
    }


})(jQuery)
