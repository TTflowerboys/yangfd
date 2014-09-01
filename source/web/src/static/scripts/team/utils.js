/* Created by frank on 14-8-4. */

(function () {
    function Delayer(options) {
        options = options || {}
        this.data = options.data
        this.task = options.task
        this.delay = options.delay || 200
        this.timer = setTimeout(function () {
            if (this.task) {
                this.task(this.data)
            }
        }.bind(this), this.delay)
    }

    Delayer.prototype.update = function (options) {
        options = options || {}
        if (options.task !== undefined) {
            this.task = options.task
        }
        if (options.data !== undefined) {
            this.data = options.data
        }
        if (options.delay !== undefined) {
            this.delay = options.delay
        }

        if (this.timer) {
            window.clearTimeout(this.timer)
        }
        this.timer = setTimeout(function () {
            this.task(this.data)
        }.bind(this), this.delay)
    }

    window.team = {
        wrapErrors: function (jQueryAjax) {
//            jQueryAjax
//                .done(function (response) {
//                    if (response.ret !== 0) {
//                        //alert(response.ret)
//                    }
//                })
//                .fail(function (xhr) {
//                    //alert(xhr.status)
//                })

            return jQueryAjax
        },
        Delayer : Delayer
    }
})();
