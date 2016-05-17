if (!window.VAP) {
    window.VAP = {};
}


VAP.converastionChart = function (arguments) {
    this.settings.charge = -1000;
    this.settings.linkDistance = 400;
    this.settings.gravity = 0.1;

    this.settings.zoom_level ={
        row1: 0.7,
            row2: 0.8,
            row3: 0.9,
            stop_zoom_out: 1,
            stop_zoom_in: 1.8
    }


    VAP.baseForcechart.call(this, arguments);


}

VAP.converastionChart.prototype = Object.create(VAP.baseForcechart.prototype);

VAP.converastionChart.prototype.init = function (data) {

    data['original_nodes'] = data.nodes.slice();
    data['original_links'] = data.links.slice();


    var link_types = d3.nest().key(function (d) {
        return d.protocol_name;
    }).entries(data.links);

    var conversation_nodes = [];
    var conversation_index = {}

    var that = this;

    link_types.forEach(function (o, i) {
        var conversation_node = {
            "id": i + 1,
            "type": "conversation_node",
            "class": "node "+ o.key.replace(/ /g,''),
            'name': o.key,
            'pos_x': that.width / 2,
            'pos_y': 20 + i * 30,
            'disable_drag': true
        };
        conversation_index[link_types[i].key] = i;
        conversation_nodes.push(conversation_node);
    });

    var conversation_nodes_nr = conversation_nodes.length;

    data.nodes = conversation_nodes.concat(data.nodes);

    var new_links = [];
    var temp_links = [];
    var new_links_duplicate = {};


    data.links.forEach(function (o, i) {
        var link1 = jQuery.extend({}, o);
        var link2 = jQuery.extend({}, o);
        link1.has_active_alarm = false;
        link2.has_active_alarm = false;
        link1.protocol_class = "conversation";
        link2.protocol_class = "conversation";

        link1['source'] = link1['source'] + conversation_nodes_nr;
        link1['target'] = conversation_index[o.protocol_name];


        link2['source'] = link2['target'] + conversation_nodes_nr;
        link2['target'] = conversation_index[o.protocol_name];

        new_links_duplicate[link1['source'] + "a" + link1['target']] = link1;
        new_links_duplicate[link2['source'] + "a" + link2['target']] = link2;

        temp_links.push(link1);
        temp_links.push(link2);
    })


    temp_links.forEach(function (element, index) {
        element.index = index;
    });

    data.links = temp_links;

    for (var i = 0, l = data.nodes.length; i < l; i++) {
        if (data.nodes[i].type !== 'conversation_node') {
            data.links.push(
                {
                    "source": i,
                    "type": 'position_only',
                    "target": 3
                }
            );
        }
    }


    return data;
};


VAP.converastionChart.prototype.createForceChart = function (data) {

    var force = d3.layout.force()
        .nodes(data.nodes)
        .links(data.links)
        .size([this.width, this.height])
        .linkDistance(data.linkDistance)
        .charge(data.charge)
        .gravity(data.gravity)
        .linkStrength(0);

    force.linkStrength(
        function (d) {
            if (d.type === 'position_only') {
                return 1;
            }
            return 0;
        }
    );

    return force;
};


VAP.converastionChart.prototype.setupTick = function (data) {
    var that = this;
    data.force.on('tick', function (d) {
        VAP.paths.tickForConversationChart(data.paths);
        VAP.nodes.tickConversation(data.chart_nodes, that.width)
    });
};

VAP.converastionChart.prototype.setupZones = function (data) {
    return data;
}

VAP.converastionChart.prototype.createChartWrappers = function (data) {
    data.chart_wrapper = data.svgObj.append("g").attr('class', 'chart_wrapper');
    data.detailscontainer = data.svgObj.append('g').attr('class', 'detailsContainer');
    data.detailscontainer.classed('hidden', false);


    return data;
},


    VAP.converastionChart.prototype.addOnClikNodes = function (data) {
        var that = this;
        data.chart_nodes.on('click', function (element) {
            if(d3.select(this).classed('conversation_node')){
                var zone_groups = d3.nest().key(function (d) {
                    return d.zone_id;
                }).entries(that.data.original_nodes);

                VAP.App.agularServices.active_conversation_chart_detail();
                that.data.detailscontainer.selectAll("*").remove();
                that.data.detailscontainer.classed('hidden', false);
                that.data.chart_wrapper.classed('hidden',true);

                var arguments = {
                    nodes: that.data.raw_data.nodes,
                    links: that.data.raw_data.links,
                    zones: [],
                    container_id: that.data.container_id,
                    'svgObj': that.data.detailscontainer
                }

                var conversation_info_box =  $('#' + that.data.container_id + " .conversation_name_info_box");
                conversation_info_box.text(element.name);
                conversation_info_box.removeClass('hidden',false);
                var chart = new VAP.zoneChartFiltered(arguments);
                chart.showZonesConversationsOnly(false);
                chart.hightLightByCoversationName(element.name);


            }
        });
    }

VAP.converastionChart.prototype.addMouseEventsForNodes = function (data) {

    //var that = this;
    var listener = function (element) {
        if (!d3.select(this).classed('disabled')) {
            var events_arguments = {
                data: data,
                event_this: this,
                event_element: element
            }
            VAP.App.agularServices.show_asset_info(element.id);
            VAP.onchartactions.selectNode(events_arguments);
        }
    }


    var listener2 = function (element) {
        var clear_arguments = {
            data: data
        }

        VAP.onchartactions.unselectAll(clear_arguments);
    }

    data.chart_nodes.on('mouseout', listener2);
    data.chart_nodes.on('mouseover', listener);
}


VAP.converastionChart.prototype.updateSize = function () {
    var data = this.data;
    var element = $('#' + data.container_id);

    var that = this;

    setTimeout(function () {
        if (element.width() > 0) {
            that.width = element.width();
            that.height = element.height();
        }

        data.force.nodes().forEach(function (node) {
            if (node.pos_x !== undefined) {
                node.pos_x = that.width / 2;
            }
        });


    }, 10);
};


VAP.converastionChart.prototype.update = function (chart_data) {
    console.log(chart_data);

    var updated_nodes = chart_data.nodes;
    var updated_links = chart_data.links;
    var that = this;
    for (var i = 0, l = updated_nodes.length; i < l; i++) {
        this.data.force.nodes().forEach(function (node) {
            if (updated_nodes[i].id === node.id) {
                if (updated_nodes[i].viewable === false) {
                    node.hidden = true;
                } else {
                    node.hidden = false;
                }
            }
        });
    }

    for (var j = 0, m = updated_links.length; j < m; j++) {
        this.data.force.links().forEach(function (link) {
            if (link.info !== undefined && updated_links[j].conversation_id === link.info.conversation_id) {
                if (updated_links[j].viewable === false) {

                    that.data.force.nodes().forEach(function (node) {
                        if(node.type === 'conversation_node' && node.name === updated_links[j].protocol.name ){
                            console.log(node);
                            node.hidden = true;
                        }
                    });
                    link.hidden = true;
                } else {
                    link.hidden = false;
                }
            }
        });
    }

    this.updateView(this.data);

}

VAP.converastionChart.prototype.backToMainChart = function(){
    this.data.detailscontainer.classed('hidden', true);
    this.data.chart_wrapper.classed('hidden',false);
    $('#' + this.data.container_id + ' p.slider_wrapper').remove();
    $('#' + this.data.container_id + " .conversation_name_info_box").addClass('hidden');
}
