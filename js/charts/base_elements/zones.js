if (!window.BGCharts) {
    window.BGCharts = {};
}


BGCharts.zones = function (width, height, groups) {

    var column = width / 3 / 2 + 80;
    var row = height / 3 / 2 + 100;
    var center_points = [];
    var pos_x = column;
    var pos_y = row;

    groups.forEach(function (d, i) {
        var position = {
            x: pos_x,
            y: pos_y
        }

        pos_x += column;
        if (i % 3 === 2) {
            pos_x = column;
            pos_y += pos_y;
        }

        center_points[d.key] = position;
    })

    this.init(center_points);
}

BGCharts.zones.prototype = {

    center_points: {},

    init: function (center_points) {
        this.center_points = center_points;
    },


    getCenterPoints: function () {
        return this.center_points
    },

    add: function (container, groups) {

        var that = this;

        var zones = container.selectAll(".zone")
            .data(groups)
            .enter().insert("path")
            .attr('class', function (d) {
                return 'zone';
            })


        var labels = container.append("svg:g")
            .attr('class', 'zonelabels')
            .selectAll('.zonelabel')
            .data(groups)
            .enter()
            .append("text")
            .attr('id', function (d) {
                return "zonelabel" + d.key
            })
            .attr('class', 'zonelabel')
            .attr('text-anchor', 'middle')
            .text(function (d) {
                return d.values[0].zone;
                //return 'Zone ' + d.key
            })

        return zones;
    },

    groupPath: function (that, d) {

        if (d.values.length === 0) {

            var pos = that.center_points[parseInt(d.key, 10)];
            var r = 60;

            var path = "M " + (pos.x) + ", " + (pos.y - 100) + " m -" + r + ", 0 a " + r + "," + r + " 0 1,0 " + (r * 2) + ",0 a " + r + "," + r + " 0 1,0 -" + (r * 2) + ",0";

            return path;


        }
        else if (d.values.length > 2) {
            return "M" + d3.geom.hull(d.values.map(function (i) {
                    return [i.x, i.y];
                }))
                    .join("L")
                + "Z";
        } else {
            var x = d.values[0].x;
            var y = d.values[0].y;
            var x2 = parseFloat(x) + 1;
            var y2 = parseFloat(y) + 1;
            var x3 = parseFloat(x) - 1;
            var y3 = parseFloat(y) - 1;
            var path = "M" + x + "," + y + "L" + x2 + "," + y2 + "L" + x3 + "," + y3;

            for (var i = 1; i < d.values.length; i++) {
                var a = d.values[i].x;
                var b = d.values[i].y;
                path += "L" + a + "," + b;
            }
            path += "Z";
            return path;
        }
    },

    tick: function (svgObj, zones, zones_link_chart) {
        var that = this;
        zones.attr("d", function (d) {
            var pos = that.getLabelPosition(that, d);
            var label = svgObj.select('#zonelabel' + d.key)
            label.attr('x', pos.x);
            label.attr('y', pos.y - 50);


            if (zones_link_chart) {
                var zone_center = zones_link_chart.nodes()[d.key];
                zones_link_chart.nodes().forEach(function (node) {

                    if (node.zone === d.key) {
                        node.x = pos.x;
                        node.y = pos.y + 50;
                    }
                });
            }

            return that.groupPath(that, d);
        })
            .classed('empty', function (d) {
                if (d.values.length === 0) {
                    return true;
                }
                return false;
            })
    },

    getLabelPosition: function (that, d) {

        var pos = that.center_points[parseInt(d.key, 10)];


        if (d.values.length === 0) {

            return {
                x: pos.x,
                y: pos.y - 100 - 20
            }

        }


        var values = {
            x: 0,
            x1: d.values[0].x,
            x2: d.values[0].x,
            y: d.values[0].y

        }

        if (d.values.length === 1) {

            values.x = d.values[0].x;
            values.y = d.values[0].y;

            return values;
        }


        for (var i = 1; i < d.values.length; i++) {
            values.x = d.values[i].x;

            if (d.values[i].x > values.x2) {

                values.x2 = d.values[i].x;
            }

            if (d.values[i].x < values.x1) {

                values.x1 = d.values[i].x;
            }

            values.x = values.x1 + ((values.x2 - values.x1) / 2)


            if (d.values[i].y < values.y) {
                values.y = d.values[i].y;
            }
        }

        values.y = values.y;
        return values;

    },

    concetrateNodesInZones: function (tick_event, nodes) {

        var that = this;
        var k = tick_event.alpha * .1;

        nodes.forEach(function (o, i) {
            if (o.zone !== undefined) {
                o.y += (that.center_points[o.zone].y - o.y ) * k;
                o.x += (that.center_points[o.zone].x - o.x) * k;
            }
        });
    }
};
