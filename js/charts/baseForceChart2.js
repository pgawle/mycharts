if (!window.VAP) {
    window.VAP = {};
}


VAP.baseForcechart = function (arguments) {
    this.width = 500;
    this.height = 500;

    if (arguments && arguments.container_id !== undefined) {
        if ($('#' + arguments.container_id).width() > 0) {
            this.width = $('#' + arguments.container_id).width();
            this.height = $('#' + arguments.container_id).height();
        }
    }


    this.createChart(arguments);
    //this.showZonesConversationsOnly(true);

};

VAP.baseForcechart.prototype = {

    data: {},


    VIEW_TYPES: {
        'DEFAULT': 'DEFAULT',
        'ZONE_VIEW': 'ZONE_VIEW'
    },

    view_type: 'DEFAULT',

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
        }
    },

    updateView: function (data) {
        VAP.onchartactions.updateChartVisuals(data);
    },


    updateSize: function () {
        var element = $('#' + this.data.container_id);

        var that = this;

        setTimeout(function () {
            if (element.width() > 0) {
                that.width = element.width();
                that.height = element.height();
            }
        }, 10);
    },

    createSVGbase: function (containter_id) {
        d3.select('#' + containter_id).select('svg').remove();
        var svg = d3.select('#' + containter_id).append("svg")
            .attr('class', 'base')
            .style("width", '100%')
            .style("height", '90%');
        return svg;
    },

    prepareData: function (arguments) {

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

        //if (arguments.zones === undefined) {
        //    console.error(arguments.container_id, "Zones not defined")
        //    return false
        //}

        var data = {};

        data.raw_data = arguments;

        data.container_id = arguments.container_id;

        data.top_wrapper = d3.select('#' + data.container_id);

        var structured_data = VAP.dataStructure.getD3json(arguments.nodes, arguments.links);
        var groups = d3.nest().key(function (d) {
            return d.zone_id;
        }).entries(structured_data.nodes);


        data.zones = arguments.zones;
        data.nodes = structured_data.nodes;
        data.links = structured_data.links;


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


        data.groups = groups;

        data.charge = this.settings.charge;
        data.linkDistance = this.settings.linkDistance;
        data.gravity = this.settings.gravity;
        var linkStrength = 0;
        if (this.settings.linkStrength !== undefined) {
            linkStrength = this.settings.linkStrength;
        }
        data.linkStrength = linkStrength;
        data.zoom_level = this.settings.zoom_level;

        return data;

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

    setupZones: function (data) {

        data.zone_manager = new VAP.zones(this.width, this.height, data.groups);
        data = this.setUpZoneLinks(data);
        data.chart_zones = data.zone_manager.add(data.chart_wrapper, data.groups);

        return data;
    },

    setUpZoom: function (data) {
        var zoom_arguments = {
            container_id: data.container_id,
            svgObj: data.svgObj,
            chart_wrapper: data.chart_wrapper,
            zoom_level: data.zoom_level

        }

        new VAP.zoom(zoom_arguments);
        //VAP.zoom.append(zoom_arguments);

    },

    setUpPaths: function (data) {
        var paths = VAP.paths.create(data.chart_wrapper, data.force, data.svgObj);
        return paths;
    },

    setUpChartNodes: function (data) {
        var gnodes = VAP.nodes.create(data.chart_wrapper, data.force, data.svgObj);

        return gnodes;
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

        var drag = new VAP.drag();

        drag.add(attribs);

        data.drag = drag;

        return data;
    },

    addOnClikNodes: function (data) {
        var that = this;
        data.chart_nodes.on('click', function (element) {
            if (!d3.select(this).classed('disabled') && !d3.select(this).classed('element_not_selectable')) {
                var events_arguments = {
                    data: data,
                    event_this: this,
                    event_element: element
                }

                if (element.selected === true) {
                    VAP.App.agularServices.remove_asset_info(element.id);

                } else {
                    VAP.App.agularServices.show_asset_info(element.id);
                }

                if (that.view_type === that.VIEW_TYPES.ZONE_VIEW) {
                    VAP.onchartactions.toggleNodeSelectionZoneCoversationMode(events_arguments);

                } else {
                    VAP.onchartactions.toggleNodeSelection(events_arguments);
                    VAP.popups.showNodeInfo(element, data.container_id);
                }

            }

        });

    },

    addOnClickZones: function (data) {
        if (data.chart_zones) {

            var that = this;
            data.chart_zones.on('click', function (element) {

                var events_arguments = {
                    data: data,
                    event_element: element,
                    event_this: this
                }
                if (that.view_type === that.VIEW_TYPES.ZONE_VIEW) {
                    VAP.onchartactions.toggleZoneSelectionZoneConversationMode(events_arguments);
                } else {
                    //VAP.onchartactions.toggleZoneSelectionZoneConversationMode(events_arguments_2);
                    if (!data.top_wrapper.classed('edit_mode')) {
                        VAP.onchartactions.toggleZoneSelection(events_arguments);
                    }

                }
            });
        }
    },

    addMouseEventsForZones: function (data) {

    },

    setupTick: function (data) {

        data.force.on('tick', function (d) {
            if (data.zone_manager) {
                data.zone_manager.concetrateNodesInZones(d, data.nodes);
                data.zone_manager.tick(data.svgObj, data.chart_zones, data.zones_link_chart.force_chart);
            }
            VAP.paths.tick(data.paths);
            VAP.nodes.tick(data.chart_nodes)
            if (data.zones_link_chart) {
                data.zones_link_chart.force_chart.start();
            }

        });

    },

    addMouseEventsForNodes: function (data) {

    },

    init: function (data) {
        return data;
    },

    addMouseEventsForPaths: function (data) {
        VAP.paths.appendInfoBoxListener(data.container_id, data.paths);
    },

    addOnClikPaths: function (data) {

    },

    setUpZoneLinks: function (data) {
        if (data.zone_manager !== undefined) {

            var tmp_links = {};
            var tmp_nodes = {};
            var zone_nodes = [];

            data.nodes.forEach(function (o) {
                tmp_nodes[o.zone_id] = {
                    zone_name: o.zone_name,
                    zone_id: o.zone_id
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
                if (o.source.zone_id !== undefined
                    && o.target.zone_id !== undefined
                    && o.target.zone_id !== o.source.zone_id
                ) {
                    var key = o.source.zone_id + "A" + o.target.zone_id;

                    if (o.target.zone_id < o.source.zone_id) {
                        key = o.target.zone_id + "A" + o.source.zone_id;
                    }

                    if (tmp_links[key]) {
                        if (o.has_active_alarm === true) {
                            tmp_links[key].has_active_alarm = true;
                        }

                    } else {
                        tmp_links[key] = {
                            target: tmp_nodes[o.target.zone_id].index,
                            source: tmp_nodes[o.source.zone_id].index,
                            type: 'zone_link',
                            hidden: true,
                            has_active_alarm: o.has_active_alarm
                        }
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

            var paths = VAP.paths.create(data.chart_wrapper, force, data.svgObj);
            force.on('tick', function (d) {
                VAP.paths.tick(paths);
            });


            data['zones_link_chart'] = {
                force_chart: force,
                paths: paths
            }


        }

        return data;
    },


    setupOnEndChart: function (data) {
        data.force.on('end', function (d) {
            if (data.zones_link_chart) {
                data.zones_link_chart.force_chart.stop();
            }
        });
    },

    addLegend: function (data) {

        var $legend = $('#' + data.container_id + ' .legend');

        if ($legend.length > 0) {

            VAP.legend.appendFilterEvent(data);

            $legend.removeClass('hidden');
        }


    },

    appendOnLinksInfoBoxEvents: function (data) {
        VAP.paths.appendInfoBoxListener(this.data.container_id, this.data.paths);
    },

    setUpAlarm: function (data) {
        VAP.paths.setUpAlarm(data.svgObj);
    },

    createChartWrappers: function (data) {
        data.chart_wrapper = data.svgObj.append("g").attr('class', 'chart_wrapper');
        return data;
    },

    addMouseEventsForZonePaths: function (data) {
        if (data && data.zones_link_chart) {
            VAP.paths.appendConversationNodesInfoBox(data);
        }
    },

    hightLightByCoversationName: function (conversation_name) {
        var start_arguments = {
            data: this.data,
            conversation_name: conversation_name
        }

        this.data.conversation_name_for_filter = conversation_name;

        VAP.onchartactions.filterByConversationName(start_arguments);

        var that = this;
        this.data.force.charge(function (d) {
            if (d.selected === true) {
                return that.data.charge - 700;
            }
            return that.data.charge;
        });


        this.data.force.start();
    },

    createChart: function (arguments) {


        this.data = this.prepareData(arguments);

        if (this.data === false) {
            return false;
        }

        this.data = this.init(this.data);

        this.data.force = this.createForceChart(this.data);

        this.data.force.start();

        //this.data.chart_wrapper = this.data.svgObj.append("g").attr('class', 'chart_wrapper');
        this.data = this.createChartWrappers(this.data);
        this.data = this.setupZones(this.data);


        this.setUpZoom(this.data);

        this.data.paths = this.setUpPaths(this.data);

        this.data.chart_nodes = this.setUpChartNodes(this.data);


        this.data = this.setUpDrag(this.data);

        this.addOnClikNodes(this.data);
        this.addOnClikPaths(this.data);
        this.addOnClickZones(this.data);

        this.addMouseEventsForNodes(this.data);
        this.addMouseEventsForPaths(this.data);
        this.addMouseEventsForZones(this.data);
        this.addMouseEventsForZonePaths(this.data);

        this.setupTick(this.data);
        this.setupOnEndChart(this.data);
        this.addLegend(this.data);

        this.appendOnLinksInfoBoxEvents(this.data);

        this.updateView(this.data);
        this.setUpAlarm(this.data);
    },


    showZonesConversationsOnly: function (show_zones_conversations_only) {
        var link_hidden = false;
        var zone_link_hidden = true;
        this.view_type = this.VIEW_TYPES.DEFAULT;
        this.clearChart(this.data);
        this.data.top_wrapper.classed('zone_coversation_view', false);
        if (show_zones_conversations_only === true) {
            link_hidden = true;
            zone_link_hidden = false;
            this.view_type = this.VIEW_TYPES.ZONE_VIEW;
            this.data.top_wrapper.classed('zone_coversation_view', true);
        }

        this.data.force.links().forEach(function (link) {
            link.hidden = link_hidden;
        });

        if (this.data.zones_link_chart) {
            this.data.zones_link_chart.force_chart.links().forEach(function (link) {
                link.hidden = zone_link_hidden;
            });
        }

        this.updateView(this.data);
    },

    clearChart: function (data) {
        VAP.onchartactions.clearChartElementsModes(data);
    },

    update: function (chart_data) {
    },

    udpateNodeLabelsFilter: function (filter) {
        this.data.svgObj.selectAll('.node_name').classed('hidden', !filter.name);
        this.data.svgObj.selectAll('.node_ip').classed('hidden', !filter.ip);
        this.data.svgObj.selectAll('.node_mac').classed('hidden', !filter.mac);
    }

};
