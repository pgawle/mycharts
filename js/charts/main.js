if (!window.BGCharts) {
    window.BGCharts= {};
}

BGCharts.App = {


    data:  {
        nodes: BGCharts.nodeslinksdata.nodes,
        links: BGCharts.nodeslinksdata.links
    },



    createNodeChart: function (chart_data, container_id) {
        var chart = new BGCharts.nodeChart(chart_data, container_id);
        return chart;
    },

    createZoneChart: function (chart_data, container_id) {
        var chart = new BGCharts.zoneChart(chart_data, container_id);
        return chart;
    }


};
