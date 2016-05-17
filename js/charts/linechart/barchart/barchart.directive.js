(function() {
  'use strict';

  angular
    .module('gocusWeb')
    .directive('barChart', barChart);

  /** @ngInject */
  function barChart() {

    var directive = {
      restrict: "E",
      templateUrl: "app/partials/barchart/barChart.html",
      replace: true,
      controller: 'barChartController',
      link: link,

      scope: {
        chartData: '=',
        width: '=',
        height: '=',
        viewSteps: '=',
        hideLines: '=',
        rangeStart: '=',
        rangeEnd: '='
      }
    };

    return directive;



    function link(scope, element, attrs){









    }





  }

})();
