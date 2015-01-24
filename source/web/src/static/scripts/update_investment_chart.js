(function ($) {
    function calculateInvestment() {
        var capital = parseFloat($('[data-investment=capital]').val())
        var maxReturnRate = parseFloat($('[data-investment=max_annual_return_estimated]').attr('data-investment-value'))
        var maxCashReturnRate = parseFloat($('[data-investment=max_annual_cash_return_estimated]').attr('data-investment-value'))
        var term = parseFloat($('[data-investment=term]').attr('data-investment-value'))
        var cashReturn = capital * maxCashReturnRate * term;
        var totalReturn = capital * Math.pow( (1  + maxReturnRate), term)
        $('[data-investment=cash_return]').html(team.formatCurrency(cashReturn))
        $('[data-investment=total_return]').html(team.formatCurrency(totalReturn))

        var yearReturn = []
        for (var i=0;i<term;i++)
        {
            yearReturn.push((capital * Math.pow( (1  + maxReturnRate), i + 1)).toFixed(2))
        }
        updateInvestmentChart(yearReturn)
    }

    function updateInvestmentChart(yearReturn) {
        var red = '#e20013'
        var data = {
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

        var yearCount = yearReturn.length
        //TODO: update year base on crowdfunding end time
        var startYear = 2015
        for (var i=0;i<yearCount;i++)
        {
            data.labels.push(startYear + i)
            data.datasets[0].data.push(yearReturn[i])
        }

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

        var barSpace = (chart.getAttribute('width') - yearCount * 70) / (yearCount * 2)
        new Chart(ctx).Bar(data, {
            scaleShowGridLines: false,
            barShowStroke: false,
            barValueSpacing: barSpace,
        });
     }

    $('.calculator button[name=calculate]').click(function (e) {
        if (isNaN($('[data-investment=capital]').val())) {
            return;
        }
        calculateInvestment()
    })

    if (!isNaN($('[data-investment=capital]').val())) {
        //calculate for default value
        calculateInvestment()
    }



})(jQuery)
