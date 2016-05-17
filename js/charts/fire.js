/**
 * Created by piotr on 30/03/16.
 */



//nodes, links, container_id


//console.log(11,BGCharts.nodeslinksdata);

//VAP.App.createHeatZonesChart(VAP.data.nodeslinksdata.nodes,VAP.data.nodeslinksdata.links,'container1');

//VAP.App.createZoneChart(VAP.data.nodeslinksdata.nodes,VAP.data.nodeslinksdata.links,'container1');




//var arguments = {
//    nodes: nodes,
//    links: links,
//    //zones: chart_data.zones,
//    container_id: container_id
//}
//
//var chart = new VAP.zoneChart(arguments);
//this.charts[container_id] = chart;
//
//return chart;
//var chart = new VAP.baseForcechart2(VAP.data.nodeslinksdata.nodes,VAP.data.nodeslinksdata.links,'container1');




var arguments = {
    nodes: BGCharts.nodeslinksdata.nodes,
    links: BGCharts.nodeslinksdata.links
}



BGCharts.App.createChart(arguments, 'container1');
