(function (ko, module) {       
    /*
    * 求租咨询单，大学搜索选择的控件
    * */
    ko.components.register('university-search-box', {
        viewModel: function(params) {
            this.parentVM = params.parentVM            
        },
        template: { element: 'university_search_box'}
    })
})(window.ko, window.currantModule = window.currantModule || {})
