(function (ko, module) {

    ko.components.register('show-travel-time', {
        viewModel: function(params) {
            this.travel = ko.observableArray(params.travel.map(function (val) {
                var time =  window.project.transferTime(val.time, 'minute')
                val.formatTime = time.value + {minute: 'min', hour: 'hour', second: 'sec'}[time.unit]
                return val
            }))
            this.selectedType = ko.observable(_.find(this.travel(), {default: true}) || this.travel()[0])
        },
        template: { element: 'show-travel-time' }
    })

    function RentDetailViewModel() {
        this.surrouding = ko.observableArray()
        if($('#featuredFacilityData').text().length) {
            this.surrouding(_.map(JSON.parse($('#featuredFacilityData').text()), function (item) {
                //todo 目前featured_facility中的学校的数据没有展开，所以加上这一段来mock展开后的数据
                if (typeof item[item.type.slug] === 'string' || typeof item[item.type.slug] === 'undefined') {
                    item[item.type.slug] = {
                        id: item[item.type.slug],
                        name: 'Mock Data'
                    }
                }

                item.id = item[item.type.slug].id
                item.name = item[item.type.slug].name

                return item
            }))
        }
    }
    module.appViewModel.rentDetailViewModel = new RentDetailViewModel()
})(window.ko, window.currantModule = window.currantModule || {})