if (!window.VAP) {
    window.VAP = {};
}
if (!window.VeracityAngular) {
    window.VeracityAngular = {};
}

VAP.App = {

    width: 500,
    height: 500,

    svgs: {},

    charts: {},


    updateSize: function (container_id) {
        var that = this;
        if ($('#' + container_id).width() > 0) {
            that.width = $('#' + container_id).width();
            that.height = $('#' + container_id).height();
        }


        if (that.charts[container_id]) {
            that.charts[container_id].updateSize(container_id);
        }


    },


    udpateNodeLabelsFilter: function(filter){
        for (var key in this.charts) {
            if (this.charts.hasOwnProperty(key)) {
                if(this.charts[key].udpateNodeLabelsFilter !== undefined){
                    this.charts[key].udpateNodeLabelsFilter(filter);
                }
            }
        }
    },


    createSVGbase: function (containter_id) {
        d3.select('#' + containter_id).select('svg').remove();
        var svg = d3.select('#' + containter_id).append("svg")
            .attr('class', 'base')
            .style("width", '100%')
            .style("height", '90%');
        return svg;
    },


    createRealTimeGraphB: function (chart_data, container_id) {


        var arguments = {
            nodes: chart_data.nodes,
            links: chart_data.links,
            zones: chart_data.zones,
            //zones: [],
            container_id: container_id
        }

        var chart = new VAP.nodeChart(arguments);
        this.charts[container_id] = chart;

        return chart;
    },


    createHeatZonesChart: function (nodes, links, container_id) {
        var svg = this.createSVGbase(container_id);
        //var vapData = VAP.dataStructure.getD3json(nodes, links);


        this.updateSize(container_id);

        var arguments = {
            'raw_data': {
                links: links,
                nodes: nodes
            },
            'svgObject': svg,
            'nodes': nodes,
            'links': links,
            'width': this.width,
            'height': this.height,
            'container_id': container_id
        };
        VAP.heatChartZones.createChart(arguments);
    },

    createRealTimeGraphA: function (chart_data, container_id) {
        var svg = this.createSVGbase(container_id);
        var vapData = VAP.dataStructure.getD3json(chart_data.nodes, chart_data.links);


        this.updateSize(container_id);

        var arguments = {
            'raw_data': {
                links: chart_data.links,
                nodes: chart_data.nodes
            },
            'svgObject': svg,
            'nodes': vapData.nodes,
            'links': vapData.links,
            'width': this.width,
            'height': this.height,
            'container_id': container_id
        };
        var chart = new VAP.heatChart(arguments);

        this.charts[container_id] = chart;

        return chart;
    },

    createRealConversationChart: function (chart_data, container_id) {
        var arguments = {
            nodes: chart_data.nodes,
            links: chart_data.links,
            zones: [],
            container_id: container_id
        }
        var chart = new VAP.converastionChart(arguments);

        this.charts[container_id] = chart;

        return chart;
    },

    createZoneChart: function (nodes,links, container_id) {

        var arguments = {
            nodes: nodes,
            links: links,
            //zones: chart_data.zones,
            container_id: container_id
        }

        var chart = new VAP.zoneChart(arguments);
        this.charts[container_id] = chart;

        return chart;
    },


    createPolicyChart: function (chart_data, container_id) {
        var arguments = {
            nodes: chart_data.nodes,
            links: chart_data.links,
            zones: [],
            container_id: container_id
        }
        var chart =  new VAP.policyChart(arguments);
        this.charts[container_id] = chart;
        return chart;
    },

    dragChart: function (chart_data, container_id) {
        var arguments = {
            nodes: chart_data.nodes,
            links: chart_data.links,
            zones: chart_data.zones,
            container_id: container_id
        }



        var chart = new VAP.dragChart(arguments);
        this.charts[container_id] = chart;
        return chart;

    },

    toggleEdit: function (value) {
        $('#zones_graph').toggleClass('edit_mode');
    },

    createAssetManagmentChart: function (chart_data, container_id) {
        var arguments = {
            nodes: chart_data.nodes,
            links: chart_data.links,
            zones: chart_data.zones,
            //zones: [],
            container_id: container_id
        }

        var chart = new VAP.managmentAssetChart(arguments);
        this.charts[container_id] = chart;
        return chart;
    },

    agularServices: {

        assetsService: function () {
            return angular.element('*[ng-app]').injector().get("AssetsService");
        },

        //Piotr - Use this method to mark as blocked/allowed conversation
        // conversation_to_change - conversation to be changed
        // value - true for "allow" and false for "deny"
        coversation_allowed: function (conversations_to_change, value) {
            angular.element('[ng-controller=PolicyWizardController]').scope().block_allow_conversation(conversations_to_change, value);
        },

        //Piotr - Use this method to when a asset has been clicked
        // asset_id
        show_asset_info_for_policy_manager: function (asset_id) {
            angular.element('[ng-controller=PolicyWizardController]').scope().load_asset_for_policy(asset_id);
        },

        //Piotr - Use this method to when a asset has been clicked
        // asset
        show_conversation: function (conversation) {
            angular.element('[ng-controller=PolicyWizardController]').scope().conversation(conversation);
        },

        //Piotr - Use this method to save policy
        // asset
        save_policy: function () {
            angular.element('[ng-controller=PolicyWizardController]').scope().review_policy();
            angular.element('[ng-controller=PolicyWizardController]').scope().save_policy_from_chart();
        },

        //Piotr tree_chart - Use this method to say to angular that you are going to the detail in tree chart
        active_tree_chart_detail: function () {
            angular.element('[ng-controller=HomeController]').scope().active_tree_chart_detail();
        },

        active_conversation_chart_detail: function () {
            angular.element('[ng-controller=HomeController]').scope().active_conversation_chart_detail();
        },

        show_asset_info: function(id){
            angular.element('[ng-controller=AssetManagementAppController]').scope().load_asset_detail(id);
        },

        remove_asset_info: function(id){
            angular.element('[ng-controller=AssetManagementAppController]').scope().remove_asset_detail();
        }
    }

};
