if (!window.VAP) {
    window.VAP = {};
}

VAP.onchartactions = {

    updateChartVisuals: function(data){
        data.svgObj.selectAll('.zone_link')
            .classed('hidden',false);

        if(data.zones_link_chart){
            data.zones_link_chart.force_chart.links().forEach(function(link){
                if(link.hidden === true){
                    data.svgObj.select('#zone_link' + link.index).classed('hidden', true);
                }

            });
        }

        this.showSelection(data);
    },

    showSelection: function (data) {
        var svgObj = data.chart_wrapper;
        var nodes = data.nodes;
        var links = data.links;

        svgObj.selectAll('.node')
            .classed('disabled', false)
            .classed('selected', false)
            .classed('transparent', false)
            .classed('element_blocked', false)
            .classed('hidden',false)
        svgObj.selectAll('.link')
            .classed('active', false)
            .classed('hidden', false)
            .classed('element_blocked',false)
            .classed('disabled',false);
        nodes.forEach(function (d) {
            if (d.selected === true) {
                svgObj.select('#'+ d.type + d.index).classed('selected', true);
            }

            if (d.disabled === true) {
                svgObj.select('#node' + d.index).classed('disabled', true);
            }

            if (d.transparent === true) {
                svgObj.select('#node' + d.index).classed('transparent', true);
            }

            if (d.blocked === true) {
                svgObj.select('#node' + d.index).classed('element_blocked', true);
            }

            if (d.hidden === true) {
                svgObj.select('#'+ d.type + d.index).classed('hidden', true);
                //svgObj.select('#node' + d.index).classed('hidden', true);
            }
        });
        links.forEach(function (d) {
            if (d.active === true) {
                svgObj.select('#link' + d.index).classed('active', true);
            }
            if(d.hidden === true){
                svgObj.select('#link' + d.index).classed('hidden', true);
            }
            if(d.blocked === true){
                svgObj.select('#link' + d.index).classed('element_blocked', true);
            }
            if(d.disabled === true){
                svgObj.select('#link' + d.index).classed('disabled', true);
            }

        });

        var zones_link_chart = data.zones_link_chart;

        svgObj.selectAll('.zone_link')
            .classed('selected', false)
            .classed('hidden',false)
            //.classed('alar_on',false)

        if(zones_link_chart !== undefined){
            var zones_conversations = zones_link_chart.force_chart.links();

            zones_conversations.forEach(function(link){
                if (link.selected === true) {
                    svgObj.select('#zone_link' + link.index).classed('selected', true);
                }
                if(link.hidden === true){
                    svgObj.select('#zone_link' + link.index).classed('hidden', true);
                }

                if(link.has_active_alarm === true){
                    svgObj.select('#zone_link' + link.index).classed('alarm_on', true);
                }

            });

        }


    },

    clearFiltering: function(nodes,links){
        nodes.forEach(function (d) {
            d.filter_on = false;
        });

        links.forEach(function (d) {
            d.filter_on = false;
        });
    },

    clearChartElements: function(arguments){

        var force = arguments.force;
        var nodes = force.nodes();
        var links = force.links();
        var charge = arguments.charge;
        var svgObj = arguments.svgObj;
        var zones_link_chart = arguments.zones_link_chart;



        //if(zones_link_chart !== undefined){
        //    var zones_conversations = zones_link_chart.force_chart.links();
        //    zones_conversations.forEach(function(link){
        //        link.selected = false;
        //        link.hidden = false;
        //    });
        //}

        nodes.forEach(function (d) {
            d.selected = false;
            d.transparent = false;
        });

        links.forEach(function (d) {
            d.active = false;
            if(d.filter_on !== true){
                d.hidden = false;
            }

        });

        svgObj.selectAll('path').classed('selected',false);

        force.charge(charge);
        force.start();
    },


    selectNodeAndLinks: function(element,nodes,links){
        if (element.selected === true) {
            element.selected = false;
            element.transparent = false;
        } else {
            element.selected = true;
        }

        for (var i = 0, l = links.length; i < l; i++) {
            if (element.index === links[i].target.index) {
                links[i].active = true;
                nodes[links[i].source.index].transparent = false;
            }
            else if (element.index === links[i].source.index) {
                links[i].active = true;
                nodes[links[i].target.index].transparent = false;
            }
        }

    },


    toggleNodeSelectionZoneCoversationMode: function (arguments) {

        var data = arguments.data;
        var element = arguments.event_element;



        var force = data.force;
        var links = force.links();
        var nodes = force.nodes();
        var zones_link_chart = data.zones_link_chart.force_chart;
        var zone_links = zones_link_chart.links();
        var groups = data.groups;



        if(element.selected === true){
            nodes.forEach(function(node){
                node.selected = false;
            });
            zone_links.forEach(function(zone_link){
                        zone_link.selected = false;
                        zone_link.hidden = false;
                    });
        }else{
            nodes.forEach(function(node){
                node.selected = false;
            });
            element.selected = true;
            zone_links.forEach(function(zone_link){
                zone_link.selected = false;
                zone_link.hidden = false;
            });
            for (var i = 0, l = links.length; i < l; i++) {
                var zone_id = null;
                if (element.index === links[i].target.index) {
                    zone_id = links[i].source.zone_id;
                }
                else if (element.index === links[i].source.index) {
                    zone_id = links[i].target.zone_id;
                }

                if(zone_id !== null){
                    zone_links.forEach(function(zone_link){
                        if(zone_link.target.zone_id === zone_id && zone_link.source.zone_id === element.zone_id) {
                            zone_link.selected = true;
                        }

                        if(zone_link.source.zone_id === zone_id && zone_link.target.zone_id === element.zone_id) {
                            zone_link.selected = true;
                        }
                    })
                }


            }

        }

        this.showSelection(data);
    },




    toggleNodeSelection: function (arguments) {

        var data = arguments.data;
        var d3this = arguments.event_this;
        var element = arguments.event_element;


        var svgObj = data.svgObj;
        var force = data.force;
        var links = force.links();
        var nodes = force.nodes();
        var charge = data.charge;

        if(element.selected === true){
            this.clearChartElements(data);
        }else{
            this.clearChartElements(data);
            nodes.forEach(function(d){
                d.transparent = true;
            });
            this.selectNodeAndLinks(element,nodes,links);
        }

        this.showSelection(data);
    },


    selectNode: function(arguments){
        var data = arguments.data;
        var d3this = arguments.event_this;
        var element = arguments.event_element;


        var svgObj = data.svgObj;
        var force = data.force;
        var links = force.links();
        var nodes = force.nodes();
        var charge = data.charge;


        nodes.forEach(function(d){
            d.transparent = true;
        });
        this.selectNodeAndLinks(element,nodes,links);
        this.showSelection(data);

    },

    unselectAll: function(arguments){
        var data = arguments.data;

        var svgObj = data.svgObj;
        var force = data.force;
        var links = force.links();
        var nodes = force.nodes();
        var charge = data.charge;

        this.clearChartElements(data);
        this.showSelection(data);
    },

    toggleZoneSelectionZoneConversationMode: function(arguments){
        var data = arguments.data;
        var element = arguments.event_element;
        var d3this = arguments.event_this;
        var svgObj = data.svgObj;
        var force = data.force;
        var charge = data.charge;
        var dom_element = d3.select(d3this);
        var links = data.zones_link_chart.force_chart.links();
        if (dom_element.classed('selected')) {
            dom_element.classed('selected', false);
            links.forEach(function(link){
                link.selected = false;
            })

        } else {
            dom_element.classed('selected', true);
            links.forEach(function(link){
                if(link.target.zone_id === parseInt(element.key,10) || link.source.zone_id === parseInt(element.key,10)){
                    link.selected = true;
                }else{
                    link.selected = false;
                }

            })
        }

        this.showSelection(data);

    },

    toggleZoneSelection: function (arguments) {
        var data = arguments.data;
        var d3this = arguments.event_this;
        var element = arguments.event_element;


        var svgObj = data.svgObj;
        var force = data.force;
        var links = force.links();
        var nodes = force.nodes();
        var charge = data.charge;
        var zones = arguments.zones;


        var dom_element = d3.select(d3this);




        if (dom_element.classed('selected')) {
            this.clearChartElements(data);
        } else {
            this.clearChartElements(data);
            dom_element.classed('selected', true);

            for (var i = 0, l = element.values.length; i < l; i++) {
                this.selectNodeAndLinks(element.values[i], nodes,links);
            }


            force.charge(function (d) {
                if (d.zone_id === parseInt(element.key, 10)) {
                    return charge - 1500;
                }
                return charge;
            });
            force.start();

        }

        this.showSelection(data);


    },

    filterByConversationType: function(arguments){

        var data = arguments.data;
        var d3this = arguments.event_this;
        var type = arguments.link_type;

        var svgObj = data.svgObj;
        var force = data.force;
        var links = force.links();
        var nodes = force.nodes();
        var charge = data.charge;
        var container_id = data.container_id;

        var dom_element = d3.select(d3this);

        var clear_arguments = {
            force: force,
            charge: charge,
            svgObj: svgObj
        }

        if(dom_element.classed('selected')){
            d3.selectAll('#'+container_id+" .cell").classed('selected',false);
            this.clearFiltering(nodes,links);
            this.clearChartElements(clear_arguments);
        }else{
            d3.selectAll('#'+container_id+" .cell").classed('selected',false);
            dom_element.classed('selected',true);
            this.clearChartElements(clear_arguments);
            nodes.forEach(function(d){
                d.disabled = true;
                d.filter_on = true;
            });
            links.forEach(function(d){
                d.hidden = true;
                d.filter_on = true;
                if(d.protocol_class === type){
                    nodes[d.source.index].disabled = false;
                    nodes[d.target.index].disabled = false;
                    d.hidden = false;
                }
            });
        }
        this.showSelection(data);

    },

    filterByConversationName: function(arguments){

        var data = arguments.data;
        var force = data.force;
        var links = force.links();
        var nodes = force.nodes();
        var conversation_name = arguments.conversation_name;

        nodes.forEach(function(d){
            d.disabled = false;
            d.selected = false;
        });
        links.forEach(function(d){
            d.active = false;
        });

        links.forEach(function(d){
            if(d.protocol_name === conversation_name){
                d.active = true;
                d.target['selected'] = true;
                d.target['active'] = true;
                d.source['selected'] = true;
                d.source['active'] = true;
            }else{
                d.disabled = true;
            }
        });

        nodes.forEach(function(d){
            if(!d.selected){
                d.disabled = true;
            }
        });

        this.showSelection(data);

    },


    updateFilterByConversationName: function(arguments){

        var data = arguments.data;
        var force = data.force;
        var links = force.links();
        var nodes = force.nodes();
        var conversation_name = arguments.conversation_name;
        var element = arguments.event_element;



        if(element.selected === true){
            element.selected = false;
        }else{
            element.selected = true;
        }

        links.forEach(function(d){
            if(d.protocol_name === conversation_name){
                if(d.target['selected'] !== true && d.source['selected'] !== true){
                    d.active = false;
                }else{
                    d.active = true;
                }

            }
        });

        this.showSelection(data);
    }

};
