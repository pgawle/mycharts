
if (!window.BGCharts) {
    window.BGCharts = {};
}


BGCharts.zoom = function(data){

    this.append(data)

}

BGCharts.zoom.prototype = {

    zoom_level: {},

    append: function(arguments){

        var svgObj = arguments.svgObj;
        var container_id = arguments.container_id;
        var container_wrapper = d3.select('#'+container_id);
        var chart_wrapper = arguments.chart_wrapper;
        this.zoom_level = arguments.zoom_level;
        d3.selectAll('#' + container_id + ' p.slider_wrapper').remove();
        var slider = d3.select('#'+container_id).append("p").attr('class','slider_wrapper').append("input").attr('id', container_id + "chart_slider");

        var zoom = d3.behavior.zoom()
            .scaleExtent([0.1, 10])
            .on("zoom", this.zoomed.bind(this, chart_wrapper, slider,container_wrapper),false);


        console.log(d3.select('#'+container_id+" .base"));
        console.log('#'+container_id+" .base");
        d3.select('#'+container_id+" .baseSVG").call(zoom);

        slider.datum({})
            .attr("type", "range")
            .attr("value", 10 * ((zoom.scaleExtent()[1] - zoom.scaleExtent()[0]) / 100))
            .attr("min", zoom.scaleExtent()[0])
            .attr("max", zoom.scaleExtent()[1])
            .attr("step", (zoom.scaleExtent()[1] - zoom.scaleExtent()[0]) / 100)
            .on("input", this.slided.bind(this, zoom, svgObj, '#' + container_id + 'chart_slider'));



        return slider;
    },

    zoomed: function (container, slider,container_wrapper) {
        if(!container_wrapper.classed('is_dragging')){
            container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");


            var black_backgrounds = container.selectAll('.image .node_details_background');
            if(d3.event.scale > this.zoom_level.row1){
                container.classed('show_node_details',true);
            }else{
                container.classed('show_node_details',false);
            }

            if(this.zoom_level.row1 < d3.event.scale && d3.event.scale < this.zoom_level.row2){
                black_backgrounds.attr('height',65);
                container.classed('row1',true);
            }else{
                container.classed('row1',false);
            }

            if( this.zoom_level.row2 < d3.event.scale && d3.event.scale < this.zoom_level.row3){
                black_backgrounds.attr('height',80);
                container.classed('row2',true);
            }else{
                container.classed('row2',false);
            }

            if(d3.event.scale > this.zoom_level.row3){
                black_backgrounds.attr('height',100);
                container.classed('row3',true);
            }else{
                container.classed('row3',false);
            }

            var node_scale = 1/d3.event.scale;
            if(d3.event.scale > this.zoom_level.stop_zoom_in){
                node_scale = 1/this.zoom_level.stop_zoom_in;
            }

            if(d3.event.scale < this.zoom_level.stop_zoom_out){
                node_scale = this.zoom_level.stop_zoom_out;
            }

            container.selectAll('.image image').attr("transform",function(d){
                    var trans_x = (d.image_width - (d.image_width * node_scale))/2;
                    var trans_y = (d.image_height - (d.image_height * node_scale))/2;
                    trans_y = 0;
                    return "translate(" +trans_x +","+trans_y + ")scale(" + node_scale + ")"
                }
            );

            container.selectAll('.image .node_name').attr("transform",function(d){
                    var pos_x = d.image_width / 2;
                    var pos_y = (d.image_height+10) * node_scale;
                    return "translate(" +pos_x +","+pos_y + ")scale(" + node_scale + ")"
                }
            );

            container.selectAll('.image .node_ip').attr("transform",function(d){
                    var pos_x = d.image_width / 2;
                    var pos_y = (d.image_height+25) * node_scale;
                    return "translate(" +pos_x +","+pos_y + ")scale(" + node_scale + ")"
                }
            );

            container.selectAll('.image .node_mac').attr("transform",function(d){
                    var pos_x = d.image_width / 2;
                    var pos_y = (d.image_height+40) * node_scale;
                    return "translate(" +pos_x +","+pos_y + ")scale(" + node_scale + ")"
                }
            );

            black_backgrounds.attr("transform",function(d){
                    var pos_x = (d.image_width - (d.image_width * node_scale))/2;
                    var pos_y = 0;
                    return "translate(" +pos_x +","+pos_y + ")scale(" + node_scale + ")"
                }
            );

            slider.property("value", d3.event.scale);
        }
    },

    slided: function (zoom, svgObj, container) {
        zoom.scale(d3.select(container).property("value")).event(svgObj);
    }

};
