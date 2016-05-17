/**
 * Created by piotr on 25/04/16.
 */
if (!window.BGCharts) {
    window.BGCharts = {};
}

BGCharts.nodeslinksdata = {
    nodes: [
        {
            'name': "Adam",
            //'protocol_name': 'Adam',
            'type': 'person',
            'zone': "admin",
            'image_url' : 'assets/svg/monkey.svg'
        },
        {
            'name': "Eve",
            //'protocol_name': 'Ewa',
            'type': 'person',
            'zone': "admin",
            'image_url' : 'assets/svg/alien.svg'
        },
        {
            'name': "Kazik",
            //'protocol_name': 'Kazik',
            'type': 'person',
            'zone': "manager",
            'image_url' : 'assets/svg/alien.svg'
        },
        {
            'name': "Janina",
            //'protocol_name': 'Janina',
            'type': 'person',
            'zone': "user",
            'image_url' : 'assets/svg/monkey.svg'
        }
    ],
    links: [
        {
            source: 0,
            target: 1,
            'type': 'love',
            'same_connection_index': 0
        },
        {
            source: 1,
            target: 0,
            'type': 'hate',
            'same_connection_index': 1
        },
        {
            source: 0,
            target: 1,
            'type': 'friendzone',
            'same_connection_index': 2
        },
        {
            source: 1,
            target: 0,
            'type': 'love'
        },
        {
            source: 2,
            target: 3,
            'type': 'hate'
        }

    ],

    zones: [
        {}


    ]
//    var nodes = [{name: ‘Alice’}, {name: ‘Bob’}, {name: ‘Eve’}],
//links = [{source: 0, target: 1}, {source: 2, target: 0}];
}