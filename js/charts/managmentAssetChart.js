if (!window.VAP) {
    window.VAP = {};
}


VAP.managmentAssetChart = function (arguments) {

    this.settings.charge = -1000;
    this.settings.linkDistance = 400;
    this.settings.gravity = 0.1;
    this.settings.linkStrength = 1;

    VAP.baseForcechart.call(this, arguments);


}


VAP.managmentAssetChart.prototype = Object.create(VAP.baseForcechart.prototype);

VAP.managmentAssetChart.prototype.init = function (data) {
    var center = {
        "id": 1,
        "type": "node",
        image: VAP.dataStructure.IMAGES['LOGO'],
        image_height: 50,
        image_width: 170,
        class: 'node logo',
        element_not_selectable: true,
        'zone_data': []
    };

    var links = [];

    data.nodes.unshift(center);


    for (var i = 0, l = data.nodes.length; i < l; i++) {
        links.push(
            {
                "source": i,
                "protocol_name": "MODBUS TCP",
                "protocol_class": "MODBUS_TCP",
                "target": 0
            }
        );


    }
    data.links = links;

    return data
}

VAP.managmentAssetChart.prototype.setupZones = function (data) {
    return data
}

