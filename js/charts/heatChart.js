if (!window.VAP) {
    window.VAP = {};
}


VAP.heatChart = function (arguments) {
    this.width = 500;
    this.height = 500;

    if (arguments && arguments.container_id !== undefined) {
        if ($('#' + arguments.container_id).width() > 0) {
            this.width = $('#' + arguments.container_id).width();
            this.height = $('#' + arguments.container_id).height();
        }
    }


    this.createChart(arguments);

}

VAP.heatChart.prototype = {

    data: {},

    updateSize: function (container_id) {
        var element = $('#' + container_id);

        var that = this;

        setTimeout(function () {
            if (element.width() > 0) {
                that.width = element.width();
                that.height = element.height();
            }

            that.data.treemap = d3.layout.treemap()
                .size([that.width, that.height])
                .value(function (d) {
                    return d.size;
                })
                .nodes(that.data.conversation_data)

            that.setupSizes();
        }, 10);


    },


    setupSizes: function () {
        this.data.cells
            .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")"
                    })
            .attr('width', function (d) {
                return d.dx
            })
            .attr('height', function (d) {
                return d.dy
            })

        this.data.bg_box
            .attr('width', function (d) {
                return d.dx
            })
            .attr('height', function (d) {
                return d.dy
            });


        this.data.text1
            .attr('x', function (d) {
                return d.dx / 2
            })
            .attr('y', function (d) {
                return d.dy / 2
            })

        this.data.text2
            .attr('x', function (d) {
                return d.dx / 2
            })
            .attr('y', function (d) {
                return d.dy / 2 + 20
            })
    },


    createChart: function (arguments) {
        var raw_data = arguments.raw_data;
        var nodes = arguments.nodes;
        var links = arguments.links;
        this.width = arguments.width;
        this.height = arguments.height;
        var svgObject = arguments.svgObject;
        var container_id = arguments.container_id;

        this.data.container_id = container_id;

        var that = this;

        var groups = d3.nest().key(function (d) {
            return d.protocol_name;
        }).entries(links);

        this.data.conversation_data = {
            name: "converastion_types",
            children: []
        }

        var links_number = links.length;
        for (var i = 0, l = groups.length; i < l; i++) {
            var leaf = {
                name: groups[i].key,
                size: groups[i].values.length,
                percent: ((groups[i].values.length * 100) / links_number).toFixed(2)
            }

            this.data.conversation_data.children.push(leaf);
        }

        var color = d3.scale.category20c();

        this.data.treemap = d3.layout.treemap()
            .size([this.width, this.height])
            .value(function (d) {
                return d.size;
            })
            .nodes(this.data.conversation_data)

        this.data.heatcontainer = svgObject.append('g').attr('class', 'heatContainer');

        this.data.detailscontainer = svgObject.append('g').attr('class', 'detailsContainer');

        this.data.detailscontainer.classed('hidden', true);

        this.data.cells = this.data.heatcontainer.selectAll('.cells')
            .data(this.data.treemap)
            .enter()
            .append('g')
            .attr('class', 'cell')

        this.data.bg_box = this.data.cells.append('rect')
            .attr("fill", function (d) {

                var r = 200;
                var g = 200;

                for (var i = 0, l = parseInt(d.percent, 10); i < l; i++) {
                    r -= 5;
                    g -= 5;
                }


                return "rgb(" + r + "," + g + ",255)"
            });

        this.data.text1 = this.data.cells.append('text')
            .text(function (d) {
                return d.name
            })
            .style("text-anchor", "middle")


        this.data.text2 = this.data.cells.append('text')
            .text(function (d) {
                return d.percent + "%"
            })
            .style("text-anchor", "middle")


        this.setupSizes();

        var conversation_name_info_box = $('#' + container_id + " .conversation_name_info_box");



        this.data.cells.on('click', function (d) {
            VAP.App.agularServices.active_tree_chart_detail();
            that.data.detailscontainer.selectAll("*").remove();
            that.data.detailscontainer.classed('hidden', false);
            that.data.heatcontainer.classed('hidden', true);
            conversation_name_info_box.removeClass('hidden');

            var zone_groups = d3.nest().key(function (d) {
                return d.zone_id;
            }).entries(nodes);

            var arguments = {
                nodes: raw_data.nodes,
                links: raw_data.links,
                zones: [],
                container_id: container_id,
                'svgObj': that.data.detailscontainer
            }

            var chart = new VAP.zoneChartFiltered(arguments);
            chart.showZonesConversationsOnly(false);
            chart.hightLightByCoversationName(d.name);

            $('#' + container_id + " .conversation_name_info_box").text(d.name);
        });


    },

    backToTreeChart: function(){
            this.data.detailscontainer.classed('hidden', true);
            this.data.heatcontainer.classed('hidden', false);
            var conversation_name_info_box = $('#' + this.data.container_id + " .conversation_name_info_box");
            conversation_name_info_box.addClass('hidden');
            $('#' + this.data.container_id + ' p.slider_wrapper').remove();
    }
};
