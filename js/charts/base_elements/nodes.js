if (!window.BGCharts) {
    window.BGCharts = {};
}

BGCharts.nodes = {
    create: function (container, force, svgObj) {
        var gnodes = container.selectAll(".node")
            .data(force.nodes())
            .enter()
            .append("g")
            .attr("id", function (d) {
                return d.type + d.index;
            })
            .attr("class", function (d) {

                var class_name = "node " + d.type + " " +d.name;
                if (d.element_not_selectable) {
                    class_name = class_name + ' ' + 'element_not_selectable';
                }

                return class_name;
            })


        var gnodes_inner = container.selectAll('g.node').append('g')
            .attr('class', 'node_inner');

        //console.log(data.nodes_settings);

        var rect = gnodes_inner.append("rect")
            .attr("width", function(d){return d.width;})
            .attr("height",function(d){return d.height;})
            .attr("rx", 15)
            .attr("ry", 15)
            .attr("transform", "translate(0,-5)")
            .attr('class', 'node_background');

        //var rect = gnodes_inner.append("rect")
        //    .attr("width", 100)
        //    .attr("rx", 15)
        //    .attr("ry", 15)
        //    .attr("transform", "translate(0,-5)")
        //    .attr('class','node_details_background')





        var images_wrapper = gnodes_inner;

        images_wrapper
            .append('text')
            .text(function (d) {
                return d.name;
            })
            .attr("text-anchor", "middle")
            .attr("transform", function (d) {
                var pos_x = d.width / 2;
                var pos_y = d.height+10;
                return "translate(" + pos_x + "," + pos_y + ")"
            })
            //.attr('class','node_text node_name')


        //images_wrapper
        //    .append('text')
        //    .text(function (d) {
        //        var ip_address ="";
        //        if(d.info.links !== undefined && d.info.links.length >0){
        //            ip_address = d.info.links[0].ip;
        //        }
        //
        //        return ip_address;
        //    })
        //    .attr("text-anchor", "middle")
        //    .attr("transform", function (d) {
        //        var pos_x = d.image_width / 2;
        //        var pos_y = d.image_height+25;
        //        return "translate(" + pos_x + "," + pos_y + ")"
        //    })
        //    .attr('class','node_text node_ip')

        //images_wrapper
        //    .append('text')
        //    .text(function (d) {
        //        var mac_address = '';
        //        if(d.info.links !== undefined && d.info.links.length >0){
        //            mac_address = d.info.links[0].mac_address;
        //        }
        //
        //        return mac_address;
        //    })
        //    .attr("text-anchor", "middle")
        //    .attr("transform", function (d) {
        //        var pos_x = d.image_width / 2;
        //        var pos_y = d.image_height+40;
        //        return "translate(" + pos_x + "," + pos_y + ")"
        //    })
        //    .attr('class','node_text node_mac')



        var images = images_wrapper
            .append("image")
            .attr("xlink:href", function (data) {
                return data.image_url;
            })
            .attr("width", function (d) {
                return d.width;
            })
            .attr("height", function (d) {
                return d.height;
            });



        //svgObj.selectAll(".logo .node_inner")
        //    .append("image")
        //    .attr("xlink:href", function (data) {
        //        return data.image;
        //    })
        //    .attr("width", function (d) {
        //        return d.image_width
        //    })
        //    .attr("height", function (d) {
        //        return d.image_height
        //    });
        //

        //var bars = svgObj.selectAll(".conversation_node .node_inner");
        //
        //
        //bars.attr("transform", "translate(-100,-15)")
        //
        //bars.append("rect")
        //    .attr("width", 200)
        //    .attr("height", 30)
        //    .attr('class', 'conversation_node')
        //
        //bars.append("text")
        //    .attr("dy", function (d) {
        //        //console.log(d);
        //        return 15
        //    })
        //    .attr("transform", "translate(100,5)")
        //    .attr("text-anchor", "middle")
        //    .text(function (d) {
        //        return d.name;
        //    });

        return gnodes;
    },


    addDrag: function (gnodes, force, svgObj) {
        var drag = d3.behavior.drag()
            .origin(function (d) {
                return d;
            })
            .on("dragstart", function (data) {
                this.dragstarted(data, force, svgObj);
            }.bind(this))
            .on("drag", this.dragged)
            .on("dragend", this.dragended);

        gnodes.call(drag);

    },

    dragstarted: function (d, force) {
        if (d.disable_drag !== true) {
            d3.event.sourceEvent.stopPropagation();
            force.start();
        }
    },

    dragged: function (d) {
        if (d.disable_drag !== true) {
            d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
        }
    },

    dragended: function (d) {
        if (d.disable_drag !== true) {
            d3.select(this).classed("dragging", false);
        }
    },

    tick: function (node) {
        node.attr("transform", function (d) {

            if ("node" === d.type) {
                return "translate(" + (d.x - (d.image_width / 2)) + "," + (d.y - (d.image_height / 2)) + ")";
            }

            return "translate(" + (d.x) + "," + (d.y) + ")";
        });
    },

    //tickConversation: function (node, width) {
    //
    //    var overlap = function (a, b) {
    //        return ((a.x < b.x < a.x2() && a.y < b.y < a.y2()) || (a.x < b.x2() < a.x2() && a.y < b.y2() < a.y2()))
    //    }
    //
    //    function collide(node) {
    //        var quadtree = d3.geom.quadtree(node);
    //        return function (d) {
    //            var rx = d.image_width / 2;
    //            var ry = d.image_height / 2;
    //
    //            var nx1 = d.x - rx,
    //                nx2 = d.x + rx,
    //                ny1 = d.y - ry,
    //                ny2 = d.y + ry;
    //
    //            quadtree.visit(function (quad, x1, y1, x2, y2) {
    //                var dx, dy;
    //                if (quad.point && (quad.point !== node)) {
    //                    if (overlap(node, quad.point)) {
    //                        dx = Math.min(node.x2 - quad.point.x, quad.point.x2 - node.x) / 2;
    //                        node.x -= dx;
    //                        quad.point.x -= dx;
    //                        dy = Math.min(node.y2 - quad.point.y, quad.point.y2 - node.y) / 2;
    //                        node.y -= dy;
    //                        quad.point.y += dy;
    //                    }
    //                }
    //
    //                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    //            });
    //        }
    //    };
    //
    //
    //    node.each(collide(.5));
    //
    //
    //    node.attr("transform", function (d) {
    //
    //        if ("node" === d.type) {
    //
    //            var middle = width / 2;
    //            var x1 = middle - 300;
    //            var x2 = middle + 300;
    //
    //            //Math.max(15, Math.min(width - 15, d.x))
    //            if (x1 < d.x && d.x < x2) {
    //                if (d.x < middle) {
    //                    d.x = x1;
    //                }
    //                if (d.x > middle) {
    //                    d.x = x2;
    //                }
    //            }
    //
    //            return "translate(" + (d.x - (d.image_width / 2)) + "," + (d.y - (d.image_height / 2)) + ")";
    //        } else {
    //            d.x = d.pos_x;
    //            d.y = d.pos_y;
    //            return "translate(" + (d.x - 100) + "," + (d.y - 15) + ")";
    //        }
    //
    //        return "translate(" + (d.x) + "," + (d.y) + ")";
    //    });
    //}


};
