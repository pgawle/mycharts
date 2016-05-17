if (!window.VAP) {
    window.VAP = {};
}

VAP.popups = {

    chartsTemplatesId: "#chartTemplates",

    appendNodeInfoBox: function (container_id) {
        var $template_to_add = $(this.chartsTemplatesId + " .NodeInfoBox").clone();
        $('#' + container_id).append($template_to_add);
    },

    showNodeInfo:function(element,container_id){


        //info: Object
        //asset_class: Object
        //asset_class_id: 6
        //description: "Human Machine Interface (HMI)"
        //name: "HMI"
        //style_class: "hmi"
        //__proto__: Object
        //asset_id: 4
        //description: null
        //has_active_alarm: false
        //id: 4
        //impact: "LOW"
        //impact_id: 1
        //links: Array[1]
        //0: Object
        //length: 1
        //__proto__: Array[0]
        //model: Object
        //model_id: 2
        //name: "RsView 32"
        //vendor: Object
        //name: "Rockwell Automation"
        //vendor_id: 2
        //__proto__: Object
        //__proto__: Object
        //name: "HMI 4"
        //zone_id: 1


        if(element.selected === true){
            $('#' + container_id+" .NodeInfoBox").removeClass('hidden');
        }
    },

    hideNodeInfo: function(container_id){
        $('#' + container_id+" .NodeInfoBox").addClass('hidden');
    }
};
