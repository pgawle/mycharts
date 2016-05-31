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
            'category': 'person',
            'zone': "admin",
            'image_url' : 'assets/svg/monkey.svg'
        },
        {
            'name': "Eve",
            //'protocol_name': 'Ewa',
            'category': 'person',
            'zone': "admin",
            'image_url' : 'assets/svg/alien.svg'
        },

        {
            'name': "Sonia",
            //'protocol_name': 'Ewa',
            'category': 'person',
            'zone': "admin",
            'image_url' : 'assets/svg/alien.svg'
        },

        {
            'name': "Kazik",
            //'protocol_name': 'Kazik',
            'category': 'person',
            'zone': "manager",
            'image_url' : 'assets/svg/alien.svg'
        },
        {
            'name': "Staszek",
            //'protocol_name': 'Kazik',
            'category': 'person',
            'zone': "manager",
            'image_url' : 'assets/svg/alien.svg'
        },
        {
            'name': "Janina",
            //'protocol_name': 'Janina',
            'category': 'person',
            'zone': "user",
            'image_url' : 'assets/svg/monkey.svg'
        }
    ],
    links: [
        {
            source: 0,
            target: 1,
            'category': 'love',
            'same_connection_index': 0
        },
        {
            source: 0,
            target: 1,
            'category': 'love',
            'same_connection_index': 1
        },
        {
            source: 1,
            target: 0,
            'category': 'hate',
            'same_connection_index': 2,
            'bidirectional': true
        },
        {
            source: 0,
            target: 1,
            'category': 'friendzone',
            'same_connection_index': 3
        },
        {
            source: 1,
            target: 0,
            'category': 'love'
        },
        {
            source: 2,
            target: 3,
            'category': 'hate',
            'bidirectional': true
        }

    ],

    zones: [
        {}


    ]
//    var nodes = [{name: ‘Alice’}, {name: ‘Bob’}, {name: ‘Eve’}],
//links = [{source: 0, target: 1}, {source: 2, target: 0}];
}