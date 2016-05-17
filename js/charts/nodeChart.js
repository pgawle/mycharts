if (!window.VAP) {
    window.VAP = {};
}


VAP.nodeChart = function (arguments) {

    this.settings.charge = -1000;
    this.settings.linkDistance = 400;
    this.settings.gravity = 0.1;
    this.settings.linkStrength = 0;

    VAP.baseForcechart.call(this, arguments);


}

VAP.nodeChart.prototype = Object.create(VAP.baseForcechart.prototype);

VAP.nodeChart.prototype.setupZones = function(data){return data}
