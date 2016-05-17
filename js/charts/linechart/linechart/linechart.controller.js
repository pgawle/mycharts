(function () {
  'use strict';

  angular
    .module('gocusWeb')
    .controller('lineChartController', lineChartController);

  /** @ngInject */
  function lineChartController($scope, $element, $compile) {


    var cleanData = function(data, settings){

      var return_data = data;

      return_data.forEach(function(d1){
        var temp_percent = [];
        d1.percents.forEach(function(item){
          if(item.percent !== null && item.percent !== undefined){
            temp_percent.push(item);
          }
        });

        d1.percents = temp_percent;
      });

      return return_data;
    }

    var buildChartData = function (data, settings) {

      var parseIntputDate = d3.time.format(settings.input_date_format).parse;

      var temp_max_min = [];
      var temp_max_y = [];
      var lines_combines = [];
      var points_combines = [];
      var temp_date_range = [];


      data.forEach(function (d1) {

        d1.percents.forEach(function (d2) {
          d2.date = parseIntputDate(d2.date);
          if(d2.percent > 100){
            d2.percent = 100;
          }
        })

        var tmp_max = d3.max(d1.percents, function (d) {
          return d.date;
        });

        var tmp_min = d3.min(d1.percents, function (d) {
          return d.date;
        });

        temp_max_min.push(tmp_max);
        temp_max_min.push(tmp_min);

        var is_new = true;
        var linesArr = [];
        var points = []

        d1.percents.forEach(function (item, index, object) {

          temp_date_range[item.date] = item.date;

          //var isInRange
          if (item.percent === null || item.date < settings.date_min || item.date > settings.date_max) {
            is_new = true;
          } else {
            points.push(object[index]);
            if (is_new === true) {
              linesArr.push([object[index]])
              is_new = false;

            } else {
              linesArr[linesArr.length - 1].push(object[index]);
            }

          }
        })

        temp_max_y.push(d3.max(d1.percents, function (d) {
          return Math.round(d.percent);
        }))

        var temp_line = {
          color: d1.color,
          line_values: linesArr,
          measure_state: d1.measure_state
        }

        var temp_points = {
          color: d1.color,
          points_values: points
        }


        lines_combines.push(temp_line);
        points_combines.push(temp_points);


      });

      var date_min_max = d3.extent(temp_max_min);

      var return_data = {
        full: data,
        date_min: date_min_max[0],
        date_max: date_min_max[1],
        max_y: d3.max(temp_max_y),
        lines: lines_combines,
        points: points_combines
      }


      if (settings.date_min) {
        return_data.date_min = settings.date_min;
      }

      if (settings.date_max) {
        return_data.date_max = settings.date_max;
      }

      return_data.date_min = d3.time.day.floor(return_data.date_min);
      return_data.date_max = d3.time.day.ceil(return_data.date_max);
      //
      //
      //return_data.date_range = d3.time.day.range(return_data.date_min, return_data.date_max);


      var temp_dates_range_array = [];

      for (var property in temp_date_range) {
        if (temp_date_range.hasOwnProperty(property)) {
          temp_dates_range_array.push(temp_date_range[property]);
        }
      }



      var date_sort_asc = function (date1, date2) {
        // This is a comparison function that will result in dates being sorted in
        // ASCENDING order. As you can see, JavaScript's native comparison operators
        // can be used to compare dates. This was news to me.
        if (date1 > date2) return 1;
        if (date1 < date2) return -1;
        return 0;
      };

      temp_dates_range_array.sort(date_sort_asc);

      return_data.date_range = temp_dates_range_array;

      if (settings.grouping === 'week') {
        return_data.date_range = d3.time.week.range(return_data.date_min, return_data.date_max);
      }

      if (settings.grouping === 'month') {
        return_data.date_range = d3.time.month.range(return_data.date_min, return_data.date_max);
      }

      return return_data;
    }


    var setupScales = function (data, settings) {
      var scale = {};

      //var x_converter = d3.time.scale();
      //var offset = d3.time.day.offset(data.date_min, settings.view_steps - 1);
      //if (settings.grouping === 'week') {
      //  offset = d3.time.week.offset(data.date_min, settings.view_steps - 1);
      //}
      //if (settings.grouping === 'month') {
      //  offset = d3.time.month.offset(data.date_min, settings.view_steps - 1);
      //}
      //x_converter.domain([data.date_min, offset]);
      //x_converter.range([0, settings.base_width - settings.margin.left - settings.margin.right - (settings.paddings * 2)]);

      var x_converter = d3.scale.linear();

      x_converter.domain([0, settings.view_steps - 1]);
      x_converter.range([0, settings.base_width - settings.margin.left - settings.margin.right - (settings.paddings * 2)]);

      //var x_axis_converter = d3.time.scale();
      //x_axis_converter.domain([data.date_min, data.date_max]);
      //x_axis_converter.range([0, x_converter(data.date_max)]);


      var x_axis_converter = d3.scale.linear();
      x_axis_converter.domain([0, data.date_range.length-1]);
      x_axis_converter.range([0, x_converter(data.date_range.length-1)]);

      var y_converter = d3.scale.linear();

      var real_max_y = data.max_y;

      if(real_max_y === 0){
        real_max_y = 100;
      }

      var lines = settings.y_axis_lines-1;
      var step_y = real_max_y/lines;
      var gradulation = step_y + function(){
          var missing = step_y%parseInt(step_y,10);

          if(missing === 0){
            return 0;
          }
          return 1-missing;
        }();
      var chart_max_y = gradulation * lines;

      y_converter.domain([0, chart_max_y]);
      y_converter.range([settings.base_height - settings.slider_height - settings.margin.bottom - settings.margin.top, 0]);


      var y_ticks = chart_max_y / gradulation;
      var tick_values = [];

      for (var i = 0, l = y_ticks + 1; i < l; i++) {
        tick_values.push((i * gradulation));
      }
      scale.x = x_converter;
      scale.x_axis = x_axis_converter;
      scale.y = y_converter;
      scale.y_tick_values = tick_values;


      return scale;

    }

    var setupMainChartElements = function (container, settings) {

      var svg_main = container.append("svg")
        .attr("width", settings.base_width - settings.margin.left - settings.margin.right)
        .attr("height", settings.base_height)
        .attr('class', 'd3chart')
        .attr('style', "left:" + settings.margin.left)
      //.call(zoom);

      var svg_y = container.append("svg")
        .attr("width", settings.base_width)
        .attr("height", settings.base_height - settings.slider_height)
        .attr('class', 'chart_y')
      //.call(zoom);


      var wrapper = svg_main.append("g")
        .attr("transform", "translate(" + settings.paddings + "," + settings.margin.top + ")")


      return {
        svg_main: svg_main,
        svg_y: svg_y,
        wrapper: wrapper
      }


    }

    var addAxis = function (scale, settings, data, chart_modules) {

      var getStringFromDate = d3.time.format("%a-%d %b");

      var xAxis = d3.svg.axis()
        .scale(scale.x_axis)
        .tickFormat(function (d) {
          return getStringFromDate(data.date_range[d]);
          //return getStringFromDate(d);

        })
        .ticks(data.date_range.length - 1)
        .orient("bottom");

      var yAxis_labels = d3.svg.axis()
        .scale(scale.y)
        .tickFormat(function (d) {
          return d + "%";
        })
        .tickValues(scale.y_tick_values)
        .orient("left")

      var yAxis_lines = d3.svg.axis()
        .scale(scale.y)
        .tickFormat(function (d) {
          return d + "%";
        })
        .tickValues(scale.y_tick_values)
        .orient("left")
        .innerTickSize(-(settings.base_width + settings.margin.left))
        .tickPadding(30)


      chart_modules.wrapper.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + (settings.base_height - settings.slider_height - settings.margin.bottom - 35) + ")")
        .call(xAxis)
        .selectAll('text')
        .call(function (selction) {
          selction.each(function (d) { // for each one
            var self = d3.select(this);
            var s = self.text().split('-');  // get the text and split it
            self.text(''); // clear it out
            self.append("tspan") // insert two tspans
              .attr("x", 0)
              .attr("dy", ".8em")
              .attr('class', 'day')
              .text(s[0].toUpperCase());
            self.append("tspan")
              .attr("x", 1)
              .attr("dy", "1em")
              .attr('class', 'date')
              .text(s[1]);
          })
        })


      function adjustLabels(selection) {
        selection.selectAll('text')
          .attr('style', 'text-anchor:start')
      }


      chart_modules.svg_y.append("g")
        .attr("class", "yAxis_labels")
        .attr("transform", "translate(" + 10 + "," + (settings.margin.top - 10) + ")")
        .call(yAxis_labels)
        .call(adjustLabels);

      chart_modules.svg_y.append("g")
        .attr("class", "yAxis_lines")
        .attr("transform", "translate(" + 0 + "," + settings.margin.top + ")")
        .call(yAxis_lines)

    }

    var addLines = function (chart_modules, scale, settings, data) {
      var line_converter = d3.svg.line()
        .x(function (d) {
          //console.log(data.date_range.map(Number).indexOf(+d.date), d.date);
          return scale.x(data.date_range.map(Number).indexOf(+d.date));
          //return scale.x(d.date)
        })
        .y(function (d) {
          return scale.y(d.percent);
        });


      var area = d3.svg.area()
        .x(function (d) {
          return scale.x(data.date_range.map(Number).indexOf(+d.date));
        })
        .y0(settings.base_height - settings.slider_height - settings.margin.bottom - settings.margin.top + 1)
        .y1(function (d) {
          return scale.y(d.percent);
        });

        data.lines.forEach(function (line, index) {
          line.line_values.forEach(function (item) {
            var line_class = 'line line' + index;

            if(line.measure_state){
              line_class = line_class +' '+ line.measure_state;
            }

            chart_modules.wrapper.append("path")
              .attr("d", line_converter(item))
              .attr('class', line_class)
              .attr('ng-hide', 'hideLines.line' + index)
              .attr('stroke', line.color);

            chart_modules.wrapper.append("path")
              .attr("d", area(item))
              .attr('class', 'area area' + index)
              .attr('ng-hide', 'hideLines.line' + index)
              .attr('fill', line.color);
          })
        });



      //if(data.lines[26]){
      //  data.lines[26].line_values.forEach(function (item) {
      //        //var line_class = 'line line' + index;
      //        //
      //        //if(line.measure_state){
      //        //  line_class = line_class +' '+ line.measure_state;
      //        //}
      //
      //        chart_modules.wrapper.append("path")
      //          .attr("d", line_converter(item))
      //          //.attr('class', line_class)
      //          //.attr('ng-hide', 'hideLines.line' + index)
      //          //.attr('stroke', line.color);
      //
      //        chart_modules.wrapper.append("path")
      //          .attr("d", area(item))
      //          //.attr('class', 'area area' + index)
      //          //.attr('ng-hide', 'hideLines.line' + index)
      //          //.attr('fill', line.color);
      //      })
      //
      //
      //
      //}

      data.points.forEach(function (line_points, index) {
        chart_modules.wrapper.selectAll('point' + index)
          .data(line_points.points_values)
          .enter().append('circle')
          .attr('cx', function (d) {
            return scale.x(data.date_range.map(Number).indexOf(+d.date));
          })
          .attr('cy', function (d) {
            return scale.y(d.percent);
          })
          .attr('class', 'point point' + index)
          .attr('ng-hide', 'hideLines.line' + index)
          .attr('stroke', line_points.color);

      })
    }

    var getChartBounds = function (settings, data, scale) {
      //var steps = data.date_range.length + 1;
      //
      //var start = scale.x(data.date_range[0]) + settings.paddings;
      //var end = start;
      //
      //if (data.date_range[steps - settings.view_steps]) {
      //  var right_bound = -(scale.x(data.date_range[steps - settings.view_steps]));
      //  end = right_bound - settings.paddings;
      //}


      var steps = data.date_range.length;

      var start = scale.x(0) + settings.paddings;
      var end = start;

      if (steps > settings.view_steps) {
        end = -(scale.x(steps-settings.view_steps));
      }

      return {
        start: start,
        end: end
      }


    }

    var addSlider = function (container, scale, bounds) {
      var slider = container.append("p")
        .attr("class", "chartSlider")
        .append("input")
        .datum({})
        .attr("type", "range")
        .attr("value", -bounds.start)
        .attr("min", -bounds.start)
        .attr("max", -bounds.end)
        .attr("step", scale.x(1))

      return slider;
    }

    var addPan = function (chart_modules, settings, scale, data, bounds, slider) {

      if (slider) {
        var slided = function () {
          zoom.translate([-d3.select(this).property("value"), settings.margin.top])
            .event(chart_modules.wrapper);
        }
        slider.on("input", slided);
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

        chart_modules.wrapper.attr("transform", "translate(" + translate + "," + settings.margin.top + ")")
        if (slider) {
          slider.property("value", -translate);
        }

      }

      var zoom = d3.behavior.zoom()
        .scaleExtent([bounds.start, bounds.end])
        .on("zoom", zoomed);

      chart_modules.svg_main.call(zoom);
    }

    var container = d3.select($element[0]).select('.chartWrapper');

    var view_steps = 7;

    if ($scope.viewSteps) {
      view_steps = $scope.viewSteps;
    }

    var settings = {
      slider_height: 0,
      margin: {top: 40, right: 20, bottom: 60, left: 50},
      view_steps: view_steps,
      paddings: 30,
      y_axis_lines: 5,
      input_date_format: "%Y-%m-%d",
      base_height: $scope.height,
      base_width: $scope.width,
      date_min: $scope.rangeStart,
      date_max: $scope.rangeEnd,
      grouping: $scope.grouping
    }


    $scope.$watchGroup(['chartData', 'rangeStart', 'rangeEnd', 'grouping'], function () {

      settings.grouping = $scope.grouping;
      if (!settings.grouping) {
        settings.grouping = 'day';
      }

      if(settings.date_min){
        settings.date_min = d3.time.day.floor($scope.rangeStart);
      }

      if(settings.date_max){
        settings.date_max = d3.time.day.ceil($scope.rangeEnd);
      }

      container.selectAll('svg').remove();

      if ($scope.chartData) {



        var clear_data = cleanData(angular.copy($scope.chartData), settings)


        var all_data = buildChartData(clear_data, settings);

        var scale = setupScales(all_data, settings);

        var chart_modules = setupMainChartElements(container, settings);

        var chartBounds = getChartBounds(settings, all_data, scale);

        var slider = null;
        //var slider = addSlider(container, scale, chartBounds);

        addAxis(scale, settings, all_data, chart_modules);
        addLines(chart_modules, scale, settings, all_data);
        addPan(chart_modules, settings, scale, all_data, chartBounds, slider);
        $compile($element)($scope);
      }
    });


  }
})();
