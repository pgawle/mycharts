if (!window.BGCharts) {
    window.BGCharts = {};
}

BGCharts.drag = function () {
}

BGCharts.drag.prototype = {

    drag_element: null,

    addDragAndDrop: function (attributes) {
        var gnodes = attributes.gnodes;
        var zones = attributes.zones;
        var force = attributes.force;
        var svgObj = attributes.svgObj;
        var center_points = attributes.center_points;
        var container_id = attributes.container_id;
        var container_wrapper = d3.select('#'+container_id);
        var groups = attributes.groups;
        var chart_wrapper = $('#'+container_id +" .chart_wrapper");
        var that = this;

        var drag = d3.behavior.drag()
            .origin(function (d) {
                return d;
            })
            .on("dragstart", function (data) {
                if(container_wrapper && container_wrapper.classed('edit_mode')){
                    that.dd_dragstarted(data, force,container_id,container_wrapper,chart_wrapper,this);
                }else{
                    that.dragstarted(data, force,container_id);
                }
            })
            .on("drag", function (d) {
                if(container_wrapper && container_wrapper.classed('edit_mode')){
                    that.dd_dragged(d, this, center_points);
                }else{
                    that.dragged(d, this, center_points);
                }
            })
            .on("dragend", function(d){
                if(container_wrapper && container_wrapper.classed('edit_mode')){
                    that.dd_dragended(d,that,force,groups,container_wrapper)
                }else{
                    that.dragended(d,that,force,groups);
                }
            });

        if (gnodes !== undefined) {
            gnodes.call(drag);
        }

        if (zones !== undefined) {
            zones.call(drag);
        }

    },


    drag_over: function(element){
        this.drag_element = element;
        //console.log(this.drag_element);
    },

    drag_out: function(element){
        this.drag_element = null;
    },


    dd_dragstarted: function (d, force,container_id,container_wrapper,chart_wrapper,event_this) {

        force.stop();
        var nodes = force.nodes();


            d3.selectAll('.node').classed('no_pointers',true);
            d3.selectAll('.link').classed('no_pointers',true);
            d3.selectAll('.zone').classed('drag_mode',true);




        var element_to_drag = $('#'+ d.type + d.id);



        var $cloned = element_to_drag.clone();

        var cloned_class = $cloned.attr('class');
        $cloned.attr('class',cloned_class+" dragged");
        $cloned.attr('id','drag_me');
        //$cloned.attr('transform','translate(0,0)');
        container_wrapper.classed('is_dragging',true);
        //console.log(chart_wrapper);
        chart_wrapper.append($cloned);
        d3.select(event_this).classed('red_box',true);

    },

    dd_dragged: function (d, event_this, center_points) {
           // d3.select('#drag_me').attr("cx", d3.event.x).attr("cy", d3.event.y);
        d3.select('#drag_me').attr("transform", 'translate('+(d3.event.x- d.image_width/2)+','+(d3.event.y - d.image_height/2)+')');
    },

    dd_dragended: function (d,that,force,groups,container_wrapper) {
        container_wrapper.classed('is_dragging',false);

        d3.selectAll('.node')
            .classed('no_pointers',false)
            .classed('red_box',false)

        d3.selectAll('.link').classed('no_pointers',false);

        d3.selectAll('.zone')
            .classed('drag_mode',false)
            .classed('dragover',false);


        if(that.drag_element){
            d.zone_id = parseInt(that.drag_element.key,10);

            groups.forEach(function(o){

                o.values.forEach(function(p,i){
                    if(d === p){
                        o.values.splice(i, 1);
                    }
                });

            });

            that.drag_element.values.push(d);
        }

        $('#drag_me').remove();
        that.drag_element = null;

        force.start();

    },

    add: function (attributes) {

        var gnodes = attributes.gnodes;
        var zones = attributes.zones;
        var force = attributes.force;
        var svgObj = attributes.svgObj;
        var center_points = attributes.center_points;
        var that = this;

        var drag = d3.behavior.drag()
            .origin(function (d) {
                return d;
            })
            .on("dragstart", function (data) {
                this.dragstarted(data, force);
            }.bind(this))
            .on("drag", function (d) {
                that.dragged(d, this, center_points);
            })
            .on("dragend", this.dragended);

        if (gnodes !== undefined) {
            gnodes.call(drag);
        }


        if (zones !== undefined) {
            zones.call(drag);
        }


    },

    dragstarted: function (d, force) {
        //force.stop();
        if (d.disable_drag !== true) {
            d3.event.sourceEvent.stopPropagation();
            force.start();
        }
    },

    dragged: function (d, event_this, center_points) {
        if (d.disable_drag !== true) {
            if (d3.select(event_this).classed('zone')) {
                center_points[d.key]['x'] = center_points[d.key]['x'] + d3.event.dx * 2;
                center_points[d.key]['y'] = center_points[d.key]['y'] + d3.event.dy * 2;
            }

            d3.select(event_this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
        }
    },

    dragended: function (d) {
        if (d.disable_drag !== true) {
        }
    }

};
