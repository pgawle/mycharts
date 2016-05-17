if (!window.VAP) {
    window.VAP = {};
}


VAP.zoneChartFiltered = function (arguments) {

    this.settings.charge = -200;
    this.settings.linkDistance = 0;
    this.settings.gravity = 0;
    this.settings.linkStrength = 0;

    VAP.baseForcechart.call(this, arguments);

    this.showZonesConversationsOnly(true);


}

VAP.zoneChartFiltered.prototype = Object.create(VAP.baseForcechart.prototype);

VAP.zoneChartFiltered.prototype.addOnClikNodes = function(data){

    var that = this;

    data.chart_nodes.on('click',function(element){
        if(element.active === true){
            var event_arguments = {
                data: data,
                conversation_name: that.data.conversation_name_for_filter,
                event_element: element
            }
            VAP.onchartactions.updateFilterByConversationName(event_arguments);
        }
    })
}


VAP.zoneChartFiltered.prototype.addOnClickZones = function(data){


}

