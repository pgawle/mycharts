if (!window.BGCharts) {
    window.BGCharts = {};
}


BGCharts.zoneChart = function (arguments, container_id) {

    this.settings.charge = -1000;
    this.settings.linkDistance = 0;
    this.settings.gravity = 0;
    this.settings.linkStrength = 0;

    arguments['container_id'] = container_id;

    BGCharts.baseForcechart.call(this, arguments);

    //this.showZonesLinksOnly(true);


}

BGCharts.zoneChart.prototype = Object.create(BGCharts.baseForcechart.prototype);
