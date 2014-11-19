/*(function () {
    var propertyFromURL = window.team.getQuery('property', location.href)
    if (propertyFromURL) {
        $.betterGet('/api/1/property/' + propertyFromURL, {})
            .done(function (data) {
                if (data)  {
                    var property = data
                    if (property.type && property.type.slug && property.type.slug !== 'new_property' && property.type.slug !== 'student_housing') {
                        $('_total').val(property.get('total_price').get('value'))
                        $('input[name=_total]').val(parseFloat(property.total_price.value).toFixed(2))
                    }
                }
            })
	    .fail(function (ret) {
	    })
            .always(function () {
                
            })
    }

})()

*/
