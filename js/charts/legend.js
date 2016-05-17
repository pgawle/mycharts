
if (!window.VAP) {
    window.VAP = {};
}

VAP.legend = {

    appendFilterEvent: function(data){

        var svgObj = data.svgObj;
        var links = data.links;
        var force = data.force;
        var charge = data.charge;
        var container_id = data.container_id;


        if ($('#' + container_id + " " + ".legend").length) {
            var events_arguments = {
                data:data
            }

            d3.select('#' + container_id + " " + ".legend .udp_action").on('click',function(){
                events_arguments['event_this'] = this;
                events_arguments['link_type'] = 'UDP';
                VAP.onchartactions.filterByConversationType(events_arguments);
            });

            d3.select('#' + container_id + " " + ".legend .tcp_action").on('click',function(){
                events_arguments['event_this'] = this;
                events_arguments['link_type'] = 'TCP';
                VAP.onchartactions.filterByConversationType(events_arguments);
            });

        }
    }
};
