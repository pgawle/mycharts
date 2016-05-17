(function() {
  'use strict';

  angular
    .module('gocusWeb')
    .directive('lineChart', lineChart);

  /** @ngInject */
  function lineChart() {

    var directive = {
      restrict: "E",
      templateUrl: "app/partials/linechart/lineChart.html",
      replace: true,
      controller: 'lineChartController',
      link: link,

      scope: {
        chartData: '=',
        width: '=',
        height: '=',
        viewSteps: '=',
        hideLines: '=',
        rangeStart: '=',
        rangeEnd: '=',
        grouping: '='
      }
    };

    return directive;



    function link(scope, element, attrs){









    }





  }

})();
