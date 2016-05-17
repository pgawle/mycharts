if (!window.BGCharts) {
    window.BGCharts= {};
}

BGCharts.App = {

    createChart: function (chart_data, container_id) {
        var chart = new BGCharts.nodeChart(chart_data, container_id);
        return chart;
    }


};
