if (!window.VAP) {
    window.VAP = {};
}

VAP.heatChartZones = {
    getChildren: function(conversations){


        var groups_conversations = d3.nest().key(function (d) {
            return d.communication;
        }).entries(conversations);

        console.log(1,conversations);
        console.log(1,groups_conversations);

        var conversation_data = [];

        for(var i= 0,l=groups_conversations.length;i<l;i++){
            var leaf = {
                name: groups_conversations[i].key,
                size: groups_conversations[i].values.length
            }

            conversation_data.push(leaf);
        }


        //console.log(conversation_data);
        //fdsfsdf
        return conversation_data;
    },

    createChart: function (arguments) {

        var nodes = arguments.nodes;
        var links = arguments.links;
        var width = arguments.width;
        var height = arguments.height;
        var svgObject = arguments.svgObject;
        var container_id = arguments.container_id;


        //var groups_zones = d3.nest().key(function(d) { return d.zone; }).entries(nodes);

        //var groups_conversations = d3.nest().key(function (d) {
        //    return d.protocol_name;
        //}).entries(links);

        var conversation_data = {
            name: "converastion_types",
            children: []
        }

        var zones_groups = {};

        for(var i= 0,l=links.length;i<l;i++){


            if(!zones_groups[nodes[links[i].target].zone]){
                zones_groups[nodes[links[i].target].zone] = [];
            }

            zones_groups[nodes[links[i].target].zone].push(links[i]);

            if(!zones_groups[nodes[links[i].source].zone]){
                zones_groups[nodes[links[i].source].zone] = [];
            }

            zones_groups[nodes[links[i].source].zone].push(links[i]);

        }



        for (var property in zones_groups) {
            if (zones_groups.hasOwnProperty(property)) {
                var leaf = {
                            name: property,
                            size: zones_groups[property].length,
                            children: this.getChildren(zones_groups[property])
                        }
                conversation_data.children.push(leaf);
            }
        }

        var color = d3.scale.category20c();

        var treemap = d3.layout.treemap()
            .size([width, height])
            .padding(function(d){
                if(d.name === "converastion_types"){

                    return 0;
                }

                return [20,0,0,0]

            })
            .value(function(d) { return d.size; })
            .nodes(conversation_data);

        var heatcontainer = svgObject.append('g').attr('class','heatContainer');
        var detailscontainer = svgObject.append('g').attr('class','detailsContainer');
        detailscontainer.classed('hidden',true);

        var cells = heatcontainer.selectAll('.cells')
            .data(treemap)
            .enter()
            .append('g')
            .attr('class','cell')



        cells
            .attr("transform", function(d){
                //if(d.parent && d.parent.name !== "converastion_types"){
                //    return "translate("+d.x+","+ (d.y+20)+")"
                //}

                return "translate("+d.x+","+ d.y+")"

            })
            .attr('width',function(d){return d.dx})
            .attr('height',function(d){
                //if(d.parent && d.parent.name !== "converastion_types"){
                //    return (d.dy-20);
                //}


                return d.dy

            })

            //.attr("class", function(d) { return d3.select(this).attr("class") + " " + d; })
            //cells.classed(function(d){console.log("Heya",d)},true);
            .attr('class',function(d){

                if(d.parent && d.parent.name !== "converastion_types"){
                    return d3.select(this).attr("class") + " "+ 'conversations_number';
                }
                return d3.select(this).attr("class") + " "+ 'heat_zones';
            })

        cells.append('rect')
            .attr('width',function(d){return d.dx})
            .attr('height',function(d){
                //if(d.parent && d.parent.name !== "converastion_types"){
                //    return (d.dy-20);
                //}


                return d.dy

            })
            .attr("stroke", function(d) {
                return "white";
            })
            .attr("fill", function(d) {
                //console.log(d3.select(d.parent).attr('fill'));
                if(d.parent && d.parent.name !== "converastion_types"){
                    return color(d.parent.name);
                }
                return d.children ? null: color(d.name);
            })

        //console.log(cells);



        cells.append('text')
            .text(function(d){
                //console.log(d);
                //return "Zone "+d.name
                if(d.parent && d.parent.name === "converastion_types"){
                    return "Zone "+d.name;
                }

                if(d.parent && d.parent.name !== "converastion_types"){
                    return "["+d.size+"] "+d.name;
                }
            })
            .style("text-anchor", "middle")
            .attr("fill","white")
            .attr('x',function(d){return d.dx/2})
            .attr('y',function(d){
                if(d.parent && d.parent.name === "converastion_types"){
                    return 15;
                }

                if(d.parent && d.parent.name !== "converastion_types"){
                    return d.dy/2
                }

            })


            //.text(function(d){return "["+d.size+"] "+d.name})
            //.style("text-anchor", "middle")
            //.attr('x',function(d){return d.dx/2})
            //.attr('y',function(d){return d.dy/2})


    }




};
