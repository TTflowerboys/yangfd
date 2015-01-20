(function ($) {
    function parseData() {
        var red = '#e20013'
        var result = {
            labels: [],
            datasets: [
                {
                    fillColor: red,
                    strokeColor: red,
                    pointColor: red,
                    pointStrokeColor: red,
                    data: []
                }
            ]
        }

        result.labels.push('2015')
        result.datasets[0].data.push('1000.14')

        result.labels.push('2016')
        result.datasets[0].data.push('1200.14')
        result.labels.push('2017')
        result.datasets[0].data.push('1300.14')

        return result

    }

    window.updateInvestmentChart =  function () {
        var data = parseData()

        var chart = document.getElementById('barChart')
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

        new Chart(ctx).Bar(data, {
            scaleShowGridLines: false,
            barShowStroke: false,
            barValueSpacing: 90,
        });

    }

    window.updateInvestmentChart()

})(jQuery)
