if (!window.BGCharts) {
    window.BGCharts = {};
}


BGCharts.baseForcechart = function (arguments) {

    this.width = 500;
    this.height = 500;


    this.createChart(arguments);
};

BGCharts.baseForcechart.prototype = {


    data: {},

    settings: {
        charge: -200,
        linkDistance: 0,
        gravity: 0,
        linkStrength: 0,
        zoom_level: {
            row1: .8,
            row2: 1.25,
            row3: 1.50,
            stop_zoom_out: 1,
            stop_zoom_in: 1.8
        },
        node_settings: {
            width: 100,
            height: 60
        }
    },


    createChart: function (arguments) {


        this.data = this.buildData(arguments);

        if (this.data === false) {
            return false;
        }


        this.data = this.createChartWrappers(this.data);
        this.data.force = this.createForceChart(this.data);
        /**
         * We start force chart here to have indexes
         */
        this.data.force.start();

        this.data = this.setupZones(this.data);

        this.data.chart_nodes = this.setUpChartNodes(this.data);


        //this.addOnClikNodes(this.data);
        //this.addOnClikPaths(this.data);
        //this.addOnClickZones(this.data);

        this.addMouseEventsForNodes(this.data);
        this.addMouseEventsZones(this.data);


        this.data = this.setUpDrag(this.data);

        this.setupTick(this.data);


        /**This is for stop rest of element from moving (zone links for example)*/
        this.setupOnEndChart(this.data);

        this.setUpZoom(this.data);


        this.data.paths = this.setUpPaths(this.data);


        //this.data = this.setupZones(this.data);


        //this.data.paths = this.setUpPaths(this.data);


    },

    buildData: function (arguments) {

        if (!arguments) {
            console.error("No Arguments");
            return false;
        }

        if (arguments.container_id === undefined) {
            console.error("id of container wrapper not defined")
            return false
        }

        if (arguments.nodes === undefined) {
            console.error(arguments.container_id, "Nodes not defined")
            return false;
        }

        if (arguments.links === undefined) {
            console.error(arguments.container_id, "Links not defined")
            return false;
        }


        var data = {};

        data.container_id = arguments.container_id;

        data.container_element = d3.select('#' + data.container_id);


        //this.data = this.createChartWrappers(this.data);
        //console.log(1,data);

        if (data.container_element.length < 1) {
            console.error(arguments.container_id, "container not in DOM")
            return false;
        }

        //data.zones = arguments.zones;
        data.nodes = arguments.nodes;
        data.links = arguments.links;

        data.nodes.forEach(function (d) {
            d.width = this.settings.node_settings.width;
            d.height = this.settings.node_settings.height;
            d.type = "node";
        }.bind(this));


        /** Add index for id creation **/

        data.links.forEach(function (d, index) {
            d.type = "link"
            d.index = index;
        })

        data.zones = d3.nest().key(function (d) {
            return d.zone;
        }).entries(data.nodes);


        data.zones.forEach(function (d, index) {
            d.type = "zone"
            d.index = index;
        })

        //console.log(22,data.zones.key('empty'));


        //console.log(data);

        //data.zones = arguments.zones;
        //data.nodes = structured_data.nodes;
        //data.links = structured_data.links;


        //groups.forEach(function (d) {
        //    data.zones.forEach(function (zone) {
        //
        //        if (zone.zone_id === parseInt(d.key, 10)) {
        //            d.css_style = zone.zone_type.css_style;
        //        }
        //
        //    });
        //})


        if (arguments.svgObj !== undefined) {
            data.svgObj = arguments.svgObj;
        } else {
            data.svgObj = this.createSVGbase(data.container_id);
        }

        data.charge = this.settings.charge;
        data.linkDistance = this.settings.linkDistance;
        data.gravity = this.settings.gravity;
        var linkStrength = 0;
        if (this.settings.linkStrength !== undefined) {
            linkStrength = this.settings.linkStrength;
        }
        data.linkStrength = linkStrength;
        data.zoom_level = this.settings.zoom_level;
        //data.nodes_settings = this.settings.node_settings;

        return data;

    },

    createSVGbase: function (containter_id) {
        d3.select('#' + containter_id).select('svg').remove();
        var svg = d3.select('#' + containter_id).append("svg")
            .attr('class', 'baseSVG')
            .style("width", '100%')
            .style("height", '90%');
        return svg;
    },

    createForceChart: function (data) {
        var force = d3.layout.force()
            .nodes(data.nodes)
            .links(data.links)
            .size([this.width, this.height])
            .linkDistance(data.linkDistance)
            .charge(data.charge)
            .gravity(data.gravity)
            .linkStrength(data.linkStrength);

        return force;
    },

    setUpChartNodes: function (data) {
        var gnodes = BGCharts.nodes.create(data.chart_wrapper, data.force, data.svgObj);

        return gnodes;
    },

    setUpPaths: function (data) {
        var paths = BGCharts.paths.create(data.chart_wrapper, data.force, data.svgObj);
        return paths;
    },


    createChartWrappers: function (data) {
        data.chart_wrapper = data.svgObj.append("g").attr('class', 'chart_wrapper');
        return data;
    },

    setupTick: function (data) {

        data.force.on('tick', function (d) {
            if (data.zone_manager) {
                data.zone_manager.concetrateNodesInZones(d, data.nodes);
                data.zone_manager.tick(data.svgObj, data.chart_zones, data.zones_link_chart.force_chart);
            }

            BGCharts.paths.tick(data.paths);
            //console.log(11,BGCharts.paths);
            //BGCharts.paths.tick2(data.paths);
            BGCharts.nodes.tick(data.chart_nodes);

            if (data.zones_link_chart) {
                data.zones_link_chart.force_chart.start();
            }

        });

    },

    setUpZoom: function (data) {
        var zoom_arguments = {
            container_id: data.container_id,
            svgObj: data.svgObj,
            chart_wrapper: data.chart_wrapper,
            zoom_level: data.zoom_level

        }

        new BGCharts.zoom(zoom_arguments);
    },

    setUpDrag: function (data) {

        var center_points = [];

        if (data.zone_manager) {
            center_points = data.zone_manager.getCenterPoints();
        }

        var attribs = {
            svgObj: data.svgObj,
            gnodes: data.chart_nodes,
            zones: data.chart_zones,
            force: data.force,
            center_points: center_points
        }

        var drag = new BGCharts.drag();

        drag.add(attribs);

        data.drag = drag;

        return data;
    },

    setupZones: function (data) {

        data.zone_manager = new BGCharts.zones(this.width, this.height, data.zones);
        data = this.setUpZoneLinks(data);
        data.chart_zones = data.zone_manager.add(data.chart_wrapper, data.zones);

        return data;
    },

    setUpZoneLinks: function (data) {
        if (data.zone_manager !== undefined) {

            var tmp_links = {};
            var tmp_nodes = {};
            var zone_nodes = [];

            data.nodes.forEach(function (o) {
                tmp_nodes[o.zone] = {
                    zone_name: o.zone,
                    zone: o.zone
                }

            });

            var index = 0;

            for (var key in tmp_nodes) {
                if (tmp_nodes.hasOwnProperty(key)) {
                    tmp_nodes[key]['index'] = index;
                    zone_nodes.push(tmp_nodes[key]);
                    index++;
                }
            }


            data.links.forEach(function (o) {
                if (o.source.zone !== undefined
                    && o.target.zone !== undefined
                    && o.target.zone !== o.source.zone
                ) {
                    var key = o.source.zone + "A" + o.target.zone;

                    if (o.target.zone < o.source.zone) {
                        key = o.target.zone + "A" + o.source.zone;
                    }

                    tmp_links[key] = {
                        target: tmp_nodes[o.target.zone].index,
                        source: tmp_nodes[o.source.zone].index,
                        type: 'zone_link',
                        hidden: false
                    }

                    if (tmp_links[key].links === undefined) {
                        tmp_links[key].links = [];
                    }

                    tmp_links[key].links.push(o);


                }
            });

            var zone_links = [];
            var z_index = 0;

            for (var key in tmp_links) {
                if (tmp_links.hasOwnProperty(key)) {
                    tmp_links[key]['index'] = z_index;
                    zone_links.push(tmp_links[key]);
                    z_index++;
                }
            }

            data['zones_link_chart'] = {};

            data['zones_link_chart']['links'] = zone_links;

            var force = d3.layout.force()
                .nodes(zone_nodes)
                .links(zone_links)
                .size([this.width, this.height])
                .linkDistance(data.linkDistance)
                .charge(data.charge)
                .gravity(data.gravity)
                .linkStrength(0);

            var paths = BGCharts.paths.create(data.chart_wrapper, force, data.svgObj);
            force.on('tick', function (d) {
                BGCharts.paths.tick(paths);
            });


            data['zones_link_chart'] = {
                force_chart: force,
                paths: paths
            }


        }

        return data;
    },

    setupOnEndChart: function (data) {

        /** to stop zone links from moving **/
        data.force.on('end', function (d) {
            if (data.zones_link_chart) {
                data.zones_link_chart.force_chart.stop();
            }
        });
    },

    showZonesLinksOnly: function (show_zones_conversations_only) {
        //var link_hidden = false;
        //var zone_link_hidden = true;
        ////this.view_type = this.VIEW_TYPES.DEFAULT;

        this.clearChart(this.data);

        this.data.zones_link_chart.force_chart.links().forEach(function (d) {
            d.hidden = false;
        });

        this.data.links.forEach(function (d) {
            d.hidden = true;
        })

        //console.log(this.data.links;

        //console.log(222,this.data.zones_link_chart.force_chart.links());


        //this.data.container_element.classed('zone_coversation_view', false);
        //if (show_zones_conversations_only === true) {
        //    link_hidden = true;
        //    zone_link_hidden = false;
        //this.view_type = this.VIEW_TYPES.ZONE_VIEW;
        //this.data.container_element.classed('zone_coversation_view', true);
        //}

        //this.data.force.links().forEach(function (link) {
        //    link.hidden = link_hidden;
        //});
        //
        //if (this.data.zones_link_chart) {
        //    this.data.zones_link_chart.force_chart.links().forEach(function (link) {
        //        link.hidden = zone_link_hidden;
        //    });
        //}

        this.updateView(this.data);
    },

    clearChart: function (data) {
        BGCharts.onchartactions.clearChartElementsModes(data);
    },

    updateView: function (data) {
        BGCharts.onchartactions.updateChartVisuals(data);
    },

    addMouseEventsForNodes: function (data) {
        var that = this;
        data.chart_nodes.on('click', function (element) {
            if (element.selected === true) {
                that.clearChart(data);
                that.updateView(data);
            } else {
                that.clearChart(data);
                element.selected = true;
                that.updateView(data);
            }
        });
    },

    addMouseEventsZones: function (data) {



        if (data.chart_zones) {

            var that = this;
            data.chart_zones.on('click', function (element) {

                if (element.selected === true) {
                    that.clearChart(data);
                    that.updateView(data);
                } else {
                    that.clearChart(data);
                    element.selected = true;
                    that.updateView(data);
                }
                //var events_arguments = {
                //    data: data,
                //    event_element: element,
                //    event_this: this
                //}
                //if (that.view_type === that.VIEW_TYPES.ZONE_VIEW) {
                //    VAP.onchartactions.toggleZoneSelectionZoneConversationMode(events_arguments);
                //} else {
                //    //VAP.onchartactions.toggleZoneSelectionZoneConversationMode(events_arguments_2);
                //    if (!data.top_wrapper.classed('edit_mode')) {
                //        VAP.onchartactions.toggleZoneSelection(events_arguments);
                //    }
                //
                //}
            });
        }
    },


};
