(function (ko) {
    /*<kot-payment-details-phone params="price: {{json_dumps(payment.get('data'))}}"></kot-payment-details-phone>*/
	ko.components.register('kot-payment-details-phone', {
        viewModel: function(params) {
            this.data = ko.observable(params.data)
            this.cardNumber = this.data().cardNumber
            this.isdefault = this.data().isdefault
            this.type = this.data().type

            this.errorMsg = ko.observable()
            this.errorMsg.subscribe(function (msg) {
                if(msg.length) {
                    window.dhtmlx.message({ type:'error', text: window.getErrorMessageFromErrorCode(msg)})
                }
            })

            this.removeCard = function(card){
                $.betterPost('/api/1/adyen/' + card.id + '/delete')
                    .done(_.bind(function (data) {
                        location.href = '/user-payment'
                    }, this))
                    .fail(_.bind(function (ret) {
                        this.errorMsg(window.getErrorMessageFromErrorCode(ret))
                    }, this))
            }

            this.setDefault = function(card){
                $.betterPost('/api/1/adyen/' + card.id + '/make_default')
                    .done(_.bind(function (data) {
                        location.href = '/user-payment'
                    }, this))
                    .fail(_.bind(function (ret) {
                        this.errorMsg(window.getErrorMessageFromErrorCode(ret))
                    }, this))
            }
        },
        template: { element: 'kot-payment-details-phone-tpl' }
    })
})(window.ko);
