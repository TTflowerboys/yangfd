(function(){

    function clickJoinInHanddler(){
        var orderBoxPosY = $('.orderBox').offset().top
        $('.joinIn').click(function(e){
            $('body,html').stop(true,true).animate({scrollTop: orderBoxPosY}, 500);
            e.preventDefault()
            return false
        })
    }
    $(function(){
        clickJoinInHanddler()
    })

    window.resetOrderForm = function(container){
        var successArea = container.find('.order .successMessage')
        successArea.hide()
        var errorArea = container.find('.errorMessage')
        errorArea.hide()
        container.find('.order_form').show()

        if(container.find('form[name=order]')[0]){
            container.find('form[name=order]')[0].reset()
        }

        if (window.user) {

            if (window.user.country) {
                container.find('input[name=country]').val(window.user.country)
            }

            if (window.user.email) {
                container.find('input[name=email]').val(window.user.email)
            }

        }
        container.show()
    }

    window.showOrderCancelButton = function(container) {
        container.find('button[name=cancel]').show()
    }

    window.setupOrderForm = function(container, submitSuccessCallBack) {

        /*function enableSubmitButton(enable) {
            var button = container.find('button[type=submit]')
            if (enable) {
                button.prop('disabled', false);
                button.removeClass('gray').addClass('red')
            }
            else {
                button.prop('disabled', true);
                button.removeClass('red').addClass('gray')
            }
        }*/

        //remove bind event first Bug #5515
        container.find('form[name=order]').off('submit').submit(function (e) {
            e.preventDefault()

            var errorArea = $(this).find('.errorMessage')
            errorArea.hide()
            var successArea = container.find('.successMessage')
            container.find('form[name=order] input, form[name=order] textarea').each(
                function (index) {
                    $(this).css('border', '1px solid #999')
                }
            )
            var valid = $.validate(this, {onError: function (dom, validator, index) {
                errorArea.text(window.getErrorMessage(dom.name, validator))
                errorArea.show()
                $(dom).css('border', '2px solid red')
            }})
            if (!valid) {return}

            var params = $(this).serializeObject()

            //for order phone page
            var propertyIdFromURL = window.team.getQuery('property', location.href)
            if (propertyIdFromURL) {
                params.property_id = propertyIdFromURL
            }

            if (!params.property_id) {
                //still don't have, remove it
                delete params.property_id
            }

            var button = $('form[name=order] button[type=submit]')
            button.css('cursor', 'wait')
            var api = '/api/1/crowdfunding_reservation_ticket/add'
            $.betterPost(api, params)
                .done(function (val) {
                    successArea.show()
                    container.find('.order_form,.info,.closePopupBtn').hide()
                    submitSuccessCallBack()

//                    ga('send', 'event', 'orderPopup', 'result', 'submit-success');
                })
                .fail(function (ret) {
                    errorArea.empty()
                    errorArea.append(window.getErrorMessageFromErrorCode(ret, api))
                    errorArea.show()

//                    ga('send', 'event', 'orderPopup', 'click', 'submit-failed',window.getErrorMessageFromErrorCode(ret, api));
                })
                .always(function () {
                    button.css('cursor', 'default')
                })
        })


        //Only bind click once
        container.find('button[name=cancel],.closePopupBtn').off('click').on('click', function () {
            container.hide()

//            ga('send', 'event', 'floatBar', 'click', 'cancel-order-popup')
        });
    }



    window.openOrderForm = function (event, budgetId, intentionId, propertyId) {
        var popup = $('#order_popup')
        window.resetOrderForm(popup)

        popup.find('.order_title').show()
        window.showOrderCancelButton(popup)

        window.setupOrderForm(popup, function () {
            popup.find('.order_title').hide()

            setTimeout(function () {
                popup.hide()
            }, 2000)
        })

        var wrapper = popup.find('.order_wrapper')
        var headerHeight = wrapper.outerHeight() - wrapper.innerHeight()
        if (wrapper.outerHeight() - headerHeight > $(window).height()) {
            wrapper.css('top', $(window).scrollTop() - headerHeight)
        }
        else {
            wrapper.css('top',
                $(window).scrollTop() - headerHeight + ($(window).height() - (wrapper.outerHeight() - headerHeight)) / 2)
        }
    }

    $('.orderBtn').click(function(){
        window.openOrderForm()

//        ga('send', 'event', 'floatBar', 'click', 'open-order-popup');
    })
})()