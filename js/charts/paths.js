if (!window.VAP) {
    window.VAP = {};
}

VAP.paths = {
    create: function (container, force, svgObj) {
        var paths = container.append("svg:g")
            .attr('class', 'links')
            .selectAll('path')
            .data(force.links())
            .enter()
            .append('svg:g')
            .attr('class', function (d) {
                return 'link_wrapper';
            })
            .append('path')
            .attr("class", function (d) {
                var className = "link " + d.protocol_class;
                if (d.has_active_alarm === true) {

                    className += " alarm_on";
                }

                if(d.policy_path === true){
                    className += " policy_path";
                }


                if (d.type === 'position_only') {
                    return 'hidden';
                }

                if (d.type === 'zone_link') {
                    return 'zone_link';
                }
                return className;
            })
            .attr('id', function (d) {
                if(d.type === 'zone_link'){
                    return "zone_link" + d.index;
                }

                return "link" + d.index;
            })
            .attr("marker-mid", function (d) {
                if (d.bidirectional) {
                    return "url(#double-arrow)";
                }
                return "url(#arrow)";
            })


        this.addArrow(svgObj);

        return paths;
    },


    setUpAlarm: function (svgObj) {
        var path_alarm = svgObj.selectAll('.alarm_on');
        path_alarm.classed('active', true);

        setInterval(function () {
            if (!path_alarm.empty()) {
                if (path_alarm.classed('alarm_on')) {
                    path_alarm.classed('alarm_on', false);
                    path_alarm.classed('alarm_off', true);
                } else if (path_alarm.classed('alarm_off')) {
                    path_alarm.classed('alarm_off', false);
                    path_alarm.classed('alarm_on', true);
                }
            }
        }, 500);

    },

    addArrow: function (svgObj) {


        var doubleArrow = svgObj.append("svg:defs").selectAll("marker")
            .data(["double-arrow"])
            .enter().append("svg:marker")
            .attr("id", String)
            .attr("refY", 0)
            .attr("refX", 0)
            .attr("viewBox", "0 -20 40 40")
            .attr("markerWidth", 20)
            .attr("markerHeight", 20)
            .attr("markerUnits", 'userSpaceOnUse')
            .attr("orient", "auto");

        doubleArrow.append("svg:path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr('transform', 'translate(20)');

        doubleArrow.append("svg:path")
            .attr("d", "M0,0L10,-5L10,5")
            .attr('transform', 'translate(0)');

        svgObj.append("svg:defs").selectAll("marker")
            .data(["arrow"])
            .enter().append("svg:marker")
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .attr("markerUnits", 'userSpaceOnUse')
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");
    },

    tick: function (path) {
        path.attr("d", function (d) {

            //in order to arrow be placed in the middle we need create two lines that are connected in the middle
            //https://www.dashingd3js.com/svg-paths-and-d3js
            //http://www.purplemath.com/modules/midpoint.htm

            var h = 0;
            if (d.step) {
                h = d.step * 20;
            }


            var target = {}, source = {};

            target['x'] = d.target.x;
            target['y'] = d.target.y;

            source['x'] = d.source.x;
            source['y'] = d.source.y;


            var c = Math.sqrt(Math.pow((target.x - source.x), 2) + Math.pow((target.y - source.y), 2)) / 2;
            var r = (h / 2) + Math.pow(c, 2) / (2 * h);
            var middle = this.getMiddleLinePoint({target: target, source: source, height: h});


            if (h === 0) {
                var pathDef = [
                    'M', source.x, source.y,
                    'L', middle.x, middle.y,
                    'L', target.x, target.y
                ].join(" ");

            } else {
                var pathDef = [
                    'M', source.x, source.y,
                    'A', r, r, 0, 0, 1, middle.x, middle.y,
                    'A', r, r, 0, 0, 1, target.x, target.y
                ].join(" ");
            }

            return pathDef;
        }.bind(this));

    },

    tickForConversationChart: function (path) {
        path.attr("d", function (d) {

            var target ={}, source= {};

            //target['x'] = d.target.x - transition+ target_left;

            source['x'] = d.source.x;
            source['y'] = d.source.y;
            var transition = 100;
            if(source['x'] < d.target.x){
                transition = -100;
            }
            target['x'] = d.target.x + transition;
            target['y'] = d.target.y;

            var curve_x = target.x+transition;
            var curve_y = target.y;

            //x1 y1 x2 y2 x y
            var pathDef = [
                'M', source.x, source.y,
                'S', curve_x,curve_y,target.x, target.y
            ].join(" ");


            return pathDef;
        }.bind(this));
    },

    getMiddleLinePoint: function (data) {

        var result = null;

        if (data && data.target && data.source && undefined !== data.height) {
            var target = {}, source = {};

            target['x'] = data.target.x;
            target['y'] = data.target.y;

            source['x'] = data.source.x;
            source['y'] = data.source.y;

            var h = data.height;

            /*
             Let's find the width of the straight line segment between source and target. Result c;
             */
            //var c = Math.sqrt(Math.pow((target.x - source.x),2) + Math.pow((target.y - source.y),2))/2;

            /*
             Because we want to draw a arc we need to have radius of the circle. Result r;
             */

            //var r = (h/2) + Math.pow(c,2)/(2*h);


            /*We can find now x and y of middle of our line segment. Result mx and my.*/
            var mx = (source.x + target.x) / 2;
            var my = (source.y + target.y) / 2;


            if (h === 0) {
                return {x: mx, y: my};
            }

            /*We find line line formula that goes through points target and source. Result y = a1*x + b1;*/
            var b1 = (target.x * source.y - source.x * target.y) / (target.x - source.x);
            var a1 = (source.y - b1) / source.x;


            /*We find a line formula for a perpendicular line that goes trough middle point of our line segment. Result y = a2*x + b2*/
            var a2 = -1 / a1;
            var b2 = my - (a2 * mx);

            /* Now with all of that. The perpendicular line and middle point we can resolve this quadratic equation
             * So we can get y = a3* x^2 + b3*x + c3;
             */
            var a3 = 1 + Math.pow(a2, 2);
            var b3 = -2 * mx + 2 * a2 * b2 - 2 * a2 * my;
            var c3 = Math.pow(my, 2) + Math.pow(mx, 2) + Math.pow(b2, 2) - Math.pow(h, 2) - 2 * b2 * my;

            /*
             *   With that we can count our delta. b^2-4ac
             */


            var delta = Math.pow(b3, 2) - 4 * a3 * c3;

            /*
             * https://en.wikipedia.org/wiki/Quadratic_formula
             * The only thing is use proper quadratic formula and tadam! we have result.
             * Please remember because this is quadric formula we can have two result. With minus sigh and plus.
             */

            var point_selection = 1;
            if (data.target.y < data.source.y) {
                point_selection = -1;
            }

            var final_x = (-b3 + point_selection * Math.sqrt(delta, 2)) / (2 * a3);
            var final_y = a2 * final_x + b2;

            result = {};
            result['x'] = final_x;
            result['y'] = final_y;

        }

        return result;


    },

    appendInfoBoxListener: function (container_id, path) {
        var that = this;
        var info_box = d3.select('#' + container_id).select("div.info_box");

        path.on('mouseover', function (data) {
            that.linkmouseover(info_box, container_id, data, d3.select(this));
        })

        path.on('mouseout', function () {
            that.linkmouseout(info_box, container_id, d3.select(this));
        })
    },

    appendConversationNodesInfoBox: function (data) {
        var $info_box = $('#chartTemplates .ZoneConversationInfoBox').clone();
        $('#'+data.container_id).append($info_box)


        var that = this;

        data.zones_link_chart.paths.on('mouseover', function (element) {
            that.zoneCoversationMouseOver(element,data.container_id);
        });

        data.zones_link_chart.paths.on('mouseout', function (element) {
            that.zoneCoversationMouseOut(data.container_id);
        })

    },

    zoneCoversationMouseOver: function(element,container_id){

        var $info_box = $('#'+container_id+ ' .ZoneConversationInfoBox');
        $info_box.find('.info_row').remove();
        var $header =$info_box.find('.header');
        var $table = $info_box.find('table');

        element.links.forEach(function(link){
            var $row = $header.clone();
            $row.removeClass('header').addClass('info_row');
            $row.find('.targetPort').text(link.target_port);
            $row.find('.sourcePort').text(link.source_port);
            $row.find('.protocol').text(link.protocol_name);
            $row.find('.sourceAsset').text(link.source.info.name);
            $row.find('.targetAsset').text(link.target.info.name);

            $table.append($row);
        });

        $info_box.removeClass('hidden');
    },

    zoneCoversationMouseOut: function(container_id){
        var $info_box = $('#'+container_id+ ' .ZoneConversationInfoBox');
        $info_box.addClass('hidden');
    },


    linkmouseover: function (info_box_element, container_id, data, path_element) {

        if (path_element.classed('active')) {
            info_box_element.select('.header .name').text(data.protocol_name);
            info_box_element.select('.header .alias').text(data.alias);


            info_box_element.select('.source .description').text(data.source.description);
            info_box_element.select('.source .port .value').text(data.source_port);
            info_box_element.select('.source .link_name .value').text(data.link_source_name);


            info_box_element.select('.target .description').text(data.target.description);
            info_box_element.select('.target .port .value').text(data.target_port);
            info_box_element.select('.target .link_name .value').text(data.link_target_name);


            info_box_element
                .transition()
                .duration(300)
                .style("display", 'block')
                .style("opacity", 1);
        }
    },

    linkmouseout: function (info_box_element) {
        info_box_element
            .transition()
            .duration(300)
            .style("opacity", 1e-6)
            .style("display", 'none');
    }

};
