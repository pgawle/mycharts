if (!window.BGCharts) {
    window.BGCharts= {};
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



        this.data.force = this.createForceChart(this.data);
        /**
         * We start force chart here to have indexes
         */

        this.data.force.start();

        this.data = this.createChartWrappers(this.data);

        this.data.paths = this.setUpPaths(this.data);
        this.data.chart_nodes = this.setUpChartNodes(this.data);

        this.data = this.setUpDrag(this.data);

        this.setupTick(this.data);

        this.setUpZoom(this.data);





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

        data.nodes.forEach(function(d){
            d.width = this.settings.node_settings.width;
            d.height = this.settings.node_settings.height;


        }.bind(this))



        data.zones = d3.nest().key(function (d) {
            return d.zone;
        }).entries(data.nodes);


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
            //if (data.zone_manager) {
            //    data.zone_manager.concetrateNodesInZones(d, data.nodes);
            //    data.zone_manager.tick(data.svgObj, data.chart_zones, data.zones_link_chart.force_chart);
            //}

            BGCharts.paths.tick(data.paths);
            //console.log(11,BGCharts.paths);
            //BGCharts.paths.tick2(data.paths);
            BGCharts.nodes.tick(data.chart_nodes)
            //if (data.zones_link_chart) {
            //    data.zones_link_chart.force_chart.start();
            //}

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



};
