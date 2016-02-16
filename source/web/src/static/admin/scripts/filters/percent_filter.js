angular.module('app')
  .filter('percentage', function ($filter) {
    return function (input, decimals) {
      if(input === 0) {
        return '0%'
      }
      return input ? $filter('number')(input * 100, decimals) + '%' : ''
    }
  })
