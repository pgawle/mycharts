if (!window.BGCharts) {
    window.BGCharts= {};
}


BGCharts.nodeChart = function (arguments,container_id) {
    this.settings.charge = -1000;
    this.settings.linkDistance = 400;
    this.settings.gravity = 0.1;
    this.settings.linkStrength = 0;


    arguments['container_id'] = container_id;
    BGCharts.baseForcechart.call(this, arguments);
}

BGCharts.nodeChart.prototype = Object.create(BGCharts.baseForcechart.prototype);

BGCharts.nodeChart.prototype.setupZones = function(data){return data}
