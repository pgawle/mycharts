if (!window.VAP) {
    window.VAP = {};
}


VAP.dragChart = function (arguments) {

    this.settings.charge = -200;
    this.settings.linkDistance = 0;
    this.settings.gravity = 0;


    VAP.baseForcechart.call(this, arguments);


}

VAP.dragChart.prototype = Object.create(VAP.baseForcechart.prototype);


VAP.dragChart.prototype.setUpDrag = function (data) {

    var center_points = [];

    if (data.zone_manager) {
            center_points = data.zone_manager.getCenterPoints();
        }

    var attribs = {
        svgObj: data.svgObj,
        gnodes: data.chart_nodes,
        zones: data.chart_zones,
        force: data.force,
        center_points: center_points,
        container_id :data.container_id,
        groups: data.groups,
        chart_wrapper: data.chart_wrapper
    }

    var drag = new VAP.drag();

    drag.addDragAndDrop(attribs);

    data.drag = drag;

    return data;
};


VAP.dragChart.prototype.addMouseEventsForZones = function(data){



    data.chart_zones.on('mouseover', function (element) {
        if (data.top_wrapper.classed('is_dragging')) {
            data.drag.drag_over(element);
            d3.select(this).classed('dragover', true);
        }
    });

    data.chart_zones.on('mouseout', function (element) {
        if (data.top_wrapper.classed('is_dragging')) {
            data.drag.drag_out(element);
            d3.select(this).classed('dragover', false);
        }
    });


}
