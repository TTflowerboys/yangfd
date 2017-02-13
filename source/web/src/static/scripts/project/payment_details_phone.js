(function (ko) {
    /*<kot-payment-details-phone params="price: {{json_dumps(payment.get('data'))}}"></kot-payment-details-phone>*/
	ko.components.register('kot-payment-details-phone', {
        viewModel: function(params) {
            this.data = ko.observable(params.data)
            this.cardNumber = this.data().cardNumber
            this.isdefault = this.data().isdefault
            this.type = this.data().type

            this.removeCard = function(){
                /*$.betterPost('/api/1/card/' + this.id + '/remove')
                    .done(function (data) {
                        location.href = '/user-payment'
                    })
                    .fail(function (ret) {
                    })
                    .always(function () {

                    })*/
            }
            this.setDefault = function(){
                //window.console.log('setDefault')
                /*$.betterPost('/api/1/card/' + this.id + '/remove')
                    .done(function (data) {
                        this.cardList.remove(this)
                    })
                    .fail(function (ret) {
                    })
                    .always(function () {

                    })*/
            }
        },
        template: { element: 'kot-payment-details-phone-tpl' }
    })
})(window.ko);
