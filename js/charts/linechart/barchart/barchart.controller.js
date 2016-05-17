(function () {
  'use strict';

  angular
    .module('gocusWeb')
    .controller('barChartController', barChartController);

  /** @ngInject */
  function barChartController($scope, $element, $compile) {


    function drawChart() {
      var svg_main = container.append("svg")
        .attr("width", settings.base_width)
        .attr("height", settings.base_height)
        .attr('class', 'bar_chart')
        //.attr('style', "left:" + settings.margin.left);

      var all_data = {
        full: $scope.chartData,
        bars: [],
        max_y: d3.max($scope.chartData, function (d) {
          return d.total_percent;
        })
      }

      var lines = settings.y_axis_lines - 1;
      var real_max_y = all_data.max_y;

      var gradulation = (real_max_y + (lines - real_max_y % lines)) / lines;
      var chart_max_y = real_max_y + gradulation - (real_max_y % gradulation);

      var y_ticks = chart_max_y / gradulation;
      var tick_values = [];

      for (var i = 0, l = y_ticks + 1; i < l; i++) {
        tick_values.push((i * gradulation));
      }

      var y_converter = d3.scale.linear();
      y_converter.domain([0, chart_max_y]);
      y_converter.range([0, settings.base_height - settings.margin.top]);

      var y_axis_converter = d3.scale.linear();
      y_axis_converter.domain([0, chart_max_y]);
      y_axis_converter.range([settings.base_height - settings.margin.top, 0]);

      all_data.full.forEach(function (data) {
        var circles = {
          max: prepareDotsData(data.total_percent, "#c2bbbc", y_converter),
          //max: prepareDotsData(data.total_percent, data.color,y_converter),

          filled: prepareDotsData(data.value, data.color, y_converter)
        }
        all_data.bars.push(circles);
      });

      var yAxis_labels = d3.svg.axis()
        .scale(y_axis_converter)
        .tickFormat(function (d) {
          return d + "%";
        })
        .tickValues(tick_values)
        .orient("left")

      var yAxis_lines = d3.svg.axis()
        .scale(y_axis_converter)
        .tickFormat(function (d) {
          return d + "%";
        })
        .tickValues(tick_values)
        .orient("left")
        .innerTickSize(-(settings.base_width + settings.margin.left))
        .tickPadding(30)

      svg_main.append("g")
        .attr("class", "yAxis_labels")
        .attr("transform", "translate(" + 10 + "," + (settings.margin.bottom + 10) + ")")
        .call(yAxis_labels)
        .call(adjustLabels);

      svg_main.append("g")
        .attr("class", "yAxis_lines")
        .attr("transform", "translate(" + 0 + "," + (settings.margin.bottom + 20) + ")")
        .call(yAxis_lines)

      var barsWrapper = svg_main.append("g")
        .attr("class", "bars-wrapper")
        .attr("transform", "translate(" + -7 + "," + (-(settings.margin.bottom-10)) + ")")

      var wrapper = svg_main.append("g");

      all_data.bars.forEach(function (bar, index) {
        drawCircleBars(barsWrapper, bar.max, settings, index);
        drawCircleBars(barsWrapper, bar.filled, settings, index);
      })


      var bounds = {
        start: -7,
        end: function(){
          var bars = all_data.bars.length - 8;
          if(bars > 0){
            return -bars*45;
          }
        return -7
      }()
      }




      function zoomed() {

        var translate = d3.event.translate[0];
        if (translate > bounds.start) {
          zoom.translate([bounds.start, 0]);
          translate = bounds.start;
        }

        if (translate < bounds.end) {
          zoom.translate([bounds.end, 0]);
          translate = bounds.end;
        }

        barsWrapper.attr("transform", "translate(" + translate + "," +  (-(settings.margin.bottom-10))  + ")")
      }

      var zoom = d3.behavior.zoom()
        .on("zoom", zoomed);
      svg_main.call(zoom);
    }

    function prepareDotsData(value, color, scale) {
      var max_rows = scale(value) / (settings.circle_def.r * 2 + settings.circle_def.padding);
      var circles_max = [];
      for (var i = 0; i < max_rows; i++) {
        for (var j = -2; j < 3; j++) {
          circles_max.push(
            {
              y: settings.circle_def.r + ((settings.circle_def.r * 2 + settings.circle_def.padding) * i),
              x: 0 + (j * (settings.circle_def.padding + settings.circle_def.r * 2)),
              color: color
            }
          );
        }
      }
      return circles_max;
    }

    function drawCircleBars(container, data, settings, index) {
      container.selectAll('point')
        .data(data)
        .enter().append('circle')
        .attr('r', settings.circle_def.r)
        .attr('cx', function (d) {
          return (settings.margin.left + index * settings.circle_def.bar_space) + d.x;
        })
        .attr('cy', function (d) {
          return settings.base_height - settings.margin.bottom - d.y;
        })
        .attr('class', 'point')
        .attr('fill', function (d) {
          return d.color
        })
        .attr('stroke', function (d) {
          return d.color
        });
    }

    function adjustLabels(selection) {
      selection.selectAll('text')
        .attr('style', 'text-anchor:start')
    }


    var getChartBounds = function (settings, data, scale) {
      var steps = data.date_range.length + 1;

      var start = scale.x(data.date_range[0]) + settings.paddings;
      var end = start;

      if (data.date_range[steps - settings.view_steps]) {
        var right_bound = -(scale.x(data.date_range[steps - settings.view_steps]));
        end = right_bound - settings.paddings;
      }

      return {
        start: start,
        end: end
      }


    }


    var container = d3.select($element[0]).select('.chartWrapper');

    var settings = {
      margin: {top: 40, right: 20, bottom: 10, left: 60},
      paddings: 30,
      base_height: $scope.height,
      base_width: $scope.width,
      date_min: $scope.rangeStart,
      date_max: $scope.rangeEnd,
      y_axis_lines: 6,
      circle_def: {
        r: 2,
        padding: 2,
        bar_space: 40
      }
    }


    $scope.$watchGroup(['chartData', 'rangeStart', 'rangeEnd'], function () {

      container.selectAll('svg').remove();

      if ($scope.chartData) {
        drawChart();
      }


    });


  }
})();
