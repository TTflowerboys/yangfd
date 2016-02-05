angular.module('app')
  .filter('percentage', function ($filter) {
    return function (input, decimals) {
      return input ? $filter('number')(input * 100, decimals) + '%' : ''
    };
  });
