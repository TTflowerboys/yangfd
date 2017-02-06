(function (ko) {
	ko.components.register('kot-payment-card', {
        viewModel: function(params) {
        	var nowYear = new Date().getFullYear()
            var cardData = JSON.parse($('#cardData').text())
            var self = this;

        	function generateYearList(total) {
                total = total || 15
                
                return _.map(window.team.generateArray(15), function (val, index) {
                    return nowYear + index
                })
            }
            this.user = ko.observable(window.user)
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

            self.cardList = ko.observableArray(cardData)
            this.paymentForm = ko.observable(false)
            this.togglePaymentForm = function(){
                this.paymentForm(true)
            }

            self.removeCard = function(){
                self.cardList.remove(this)
                /*$.betterPost('/api/1/card/' + this.id + '/remove')
                    .done(function (data) {
                        self.cardList.remove(this)
                    })
                    .fail(function (ret) {
                    })
                    .always(function () {

                    })*/
            }
            self.settingDefault = function(){
                window.console.log(this+'\n self.cardList: '+self.cardList)
                this.isdefault = true

            }
            

        },
        template: { element: 'kot-payment-card-tpl' }
    })
})(window.ko);