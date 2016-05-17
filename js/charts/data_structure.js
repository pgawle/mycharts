if (!window.VAP) {
    window.VAP = {};
}

VAP.dataStructure = {


    PROTOCOLS: {
        'RPC': 'RPC',
        'MODBUS TCP': 'MODBUS_TCP'
    },

     NODES_MAPPING:{
            'ES':'es',
            'GENERIC WORKSTATION ': 'generic_workstation',
            'HIST':'hist',
            'HIST Web Server': 'hist_web_server',
            'HMI':'hmi',
            'PLC':'plc',
            'SCADA Client':'scada_client',
            'SCADA Server': 'scada_server',
            'SCADA Web Server':'scada_web_server'
    },



    IMAGES: {
        'HMI': '../assets/svg/alien.svg'
    },


    getZonesJson: function (zones) {
        var result = {};
        result['zones']= [];
        for (var i = 0, l = zones.length; i < l; i++) {
            // console.log('zones',zones[i])
            var zone = {
                id: zones[i].zone_id,
                class: 'zone' + i,
                type: "zone",
                zone_data: this.getD3json(zones[i].assets, []).nodes,
                "r_size": 200

            }
            result.zones.push(zone);
        }
        return result;
    },


    getD3json: function (nodes, links) {

        // console.log('nodes',nodes);
       // console.log('links',links);

        var result = {
            nodes: [],
            links: [],
            zones: [],
            link_types: [],
        }

        var index_table = {}
        var temp_zones = {};
        var temp_link_types = {};

        for (var i = 0, l = nodes.length; i < l; i++) {
         console.log(nodes[i]);
            var node = {
                id: nodes[i].asset_id,
                type: 'node',
                image:nodes[i].image,
                //description: nodes[i].asset_class.description,
                image_height: 50,
                image_width: 100,
                //class: "image "+this.NODES_MAPPING[nodes[i].asset_class.name],
                zone_id: nodes[i].zone_id,
                zone_name: nodes[i].zone_name,
                info: nodes[i]
            }

            index_table[nodes[i].asset_id] = i;
            result.nodes.push(node);
            //console.log(nodes[i]);
            //console.log(nodes[i].zone_id);

            if (undefined === temp_zones[nodes[i].zone_id]) {
                temp_zones[nodes[i].zone_id] = [];
            }
            temp_zones[nodes[i].zone_id].push(node);
        }

        for (var j = 0, m = links.length; j < m; j++) {
            //console.log(links[j]);

            var link = {
                index: j,
                target: index_table[links[j].asset_target_id],
                source: index_table[links[j].asset_source_id],
                //'protocol_name': links[j].protocol.name,
                //'protocol_class': links[j].protocol.type,
                'alias': links[j].alias,
                //'protocol_name': links[j].protocol_name,
                //'protocol_class': this.PROTOCOLS[links[j].protocol_name],
                'bidirectional': links[j].bidirectional,
                'source_port': links[j].source_port,
                'target_port': links[j].target_port,
                'link_source_name':links[j].link_source_name,
                'link_target_name':links[j].link_target_name,
                'has_active_alarm': links[j].has_active_alarm,
                'blocked': links[j].blocked,
                'info': links[j]
            }

            //temp_link_types[links[j].protocol.name] = true;
            result.links.push(link);
        }


        for (var property in temp_zones) {
            if (temp_zones.hasOwnProperty(property)) {

                var zone = {
                    class: 'zone' + property,
                    type: "zone",
                    zone_data: temp_zones[property],
                    "r_size": 200

                }

                result.zones.push(zone);
            }
        }


        for (var property2 in temp_link_types) {
                    if (temp_link_types.hasOwnProperty(property2)) {

                        var link_type = {
                            name : property2
                        }

                        result.link_types.push(link_type);
                    }
                }

        return result;
    }

}


var insideVap = {
    "nodes": [
        {
            "id": 10,
            "type": "node",
            "image": "PLC.svg",
            "image_width": 100,
            "image_height": 50,
            "description": "Human Machine Interface (HMI)"
        },
        {
            "id": 20,
            "type": "node",
            "image": "workstation.svg",
            "image_width": 100,
            "image_height": 50,
            "description": "Human Machine Interface (HMI)"
        },
        {
            "id": 20,
            "type": "node",
            "image": "workstation.svg",
            "image_width": 100,
            "image_height": 50,
            "description": "Human Machine Interface (HMI)"
        },
        {
            "id": 30,
            "type": "node",
            "image": "HMI.svg",
            "image_width": 100,
            "image_height": 50,
            "description": "Human Machine Interface (HMI)"
        },
        {
            "id": 40,
            "type": "node",
            "image": "HMI.svg",
            "image_width": 100,
            "image_height": 50,
            "description": "Human Machine Interface (HMI)"
        }
    ],
    "links": [
        {
            "source": 0,
            "protocol_name": "MODBUS TCP",
            "protocol_class": "MODBUS_TCP",
            "target": 3
        },
        {
            "source": 1,
            "protocol_name": "MODBUS TCP",
            "protocol_class": "MODBUS_TCP",
            "target": 2
        }
    ]
};


VAP.dataStructure.example = {
    "nodes": [
        {
            "id": 1,
            "type": "node",
            "image": "PLC.svg",
            "image_width": 100,
            "image_height": 50,
            "description": "Human Machine Interface (HMI)"
        },
        {
            "id": 2,
            "type": "zone",
            "r_size": 200,
            class: 'zone1',
            zone_data: insideVap
        },
        {
            "id": 3,
            "type": "node",
            "image": "workstation.svg",
            "image_width": 100,
            "image_height": 50,
            "description": "Human Machine Interface (HMI)"
        },
        {
            "id": 4,
            "type": "node",
            "image": "HMI.svg",
            "image_width": 100,
            "image_height": 50,
            "description": "Human Machine Interface (HMI)"
        },
        {
            "id": 5,
            "type": "node",
            "image": "HMI.svg",
            "image_width": 100,
            "image_height": 50,
            "description": "Human Machine Interface (HMI)"
        }
    ],
    "links": [
        {
            "source": 0,
            "protocol_name": "MODBUS TCP",
            "protocol_class": "MODBUS_TCP",
            "target": 4
        },
        {
            "source": 0,
            "protocol_name": "MODBUS TCP",
            "protocol_class": "MODBUS_TCP",
            "target": 4
        },
        {
            "source": 0,
            "protocol_name": "MODBUS TCP",
            "protocol_class": "MODBUS_TCP",
            "target": 4
        },
        {
            "source": 0,
            "protocol_name": "MODBUS TCP",
            "protocol_class": "MODBUS_TCP",
            "target": 3,
            "step": 0
        },
        {
            "source": 0,
            "protocol_name": "RPC",
            "protocol_class": "RPC",
            "target": 3,
            "step": 1
        },
        {
            "source": 0,
            "protocol_name": "RPC",
            "protocol_class": "RPC",
            "target": 3,
            "step": 2
        },
        {
            "source": 0,
            "protocol_name": "RPC",
            "protocol_class": "RPC",
            "target": 3,
            "step": 3
        },
        {
            "source": 0,
            "protocol_name": "RPC",
            "protocol_class": "RPC",
            "target": 3,
            "step": 4
        }
    ]
};
