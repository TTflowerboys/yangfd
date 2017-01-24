(function (ko) {
	ko.components.register('add-card', {
        viewModel: function(params) {
        	var nowYear = new Date().getFullYear()

        	function generateYearList(total) {
                total = total || 15
                
                return _.map(window.team.generateArray(15), function (val, index) {
                    return nowYear + index
                })
            }

            this.cardName = ko.observable()
            this.cardNumber = ko.observable()
            this.cardCVC = ko.observable()
            this.cardPostalCode = ko.observable()

        	this.expiryYearList = ko.observableArray(generateYearList(15))
            this.expiryYear = ko.observable(nowYear)
            this.expiryMonthList = ko.observableArray(window.team.generateArray(12))
            this.expiryMonth = ko.observable(1)
            
            this.countryCodeList = ko.observableArray(_.map(JSON.parse($('#countryData').text()), function (country) {
                country.name = window.team.countryMap[country.code]
                country.countryCode = window.team.countryCodeMap[country.code]
                return country
            }))
            this.country = ko.observable(this.user() ? _.find(this.countryCodeList(), {countryCode: this.user().country_code.toString()}) : this.countryCodeList()[0])

        },
        template: { element: 'add-card-tpl' }
    })
})(window.ko);