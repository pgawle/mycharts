if (!window.VAP) {
    window.VAP = {};
}


VAP.zoneChart = function (arguments) {

    this.settings.charge = -200;
    this.settings.linkDistance = 0;
    this.settings.gravity = 0;
    this.settings.linkStrength = 0;

    VAP.baseForcechart.call(this, arguments);

    this.showZonesConversationsOnly(true);


}

VAP.zoneChart.prototype = Object.create(VAP.baseForcechart.prototype);
