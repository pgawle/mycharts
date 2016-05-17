if (!window.VAP) {
    window.VAP = {};
}


VAP.policyChart = function (arguments) {

    this.settings.charge = -2000;
    this.settings.linkDistance = 0;
    this.settings.gravity = 0.1;

    this.actions_enabled = true;

    VAP.baseForcechart.call(this, arguments);


}

VAP.policyChart.prototype = Object.create(VAP.baseForcechart.prototype);

VAP.policyChart.prototype.init = function (data) {
    var that = this;
    var $buttons = $('#chartTemplates .chart_buttons').clone();


    $buttons.removeClass('hidden');

    $buttons.find('.block').on('click', function () {
            that.block_asset();
        }
    );


    $('#' + data.container_id).append($buttons);


    var $tooltip = $('#chart_tooltip');

    if ($tooltip.length === 0) {
        $tooltip = $('<div id="chart_tooltip" class="chart_tooltip hidden block">' +
            '<span class="block_text">block</span>' +
            '<span class="allow_text hidden">allow</span>' +
            '<span class="disable_modify hidden">block by disabled node</span>' +
            '</div>');
        $('#' + data.container_id).append($tooltip);
    }

    data.svgObj.on('mousemove', function () {
        var pos = d3.mouse(this);
        $tooltip.css('left', (pos[0] + 15) + "px");
        $tooltip.css('top', (pos[1] - 10) + "px");
    });

    return data;

}


VAP.policyChart.prototype.onElementClick = function (element, that, event_this) {
    if (this.actions_enabled === true) {
        if (element.disable_modify !== true) {
            if (element.blocked === true) {
                d3.select(event_this).classed('element_blocked', false);
                element.blocked = false;
                that.toggleTooltip(
                    {
                        show_tooltip: true,
                        element: element
                    }
                )

            } else {
                element.blocked = true;
                d3.select(event_this).classed('element_blocked', true);
                that.toggleTooltip(
                    {
                        show_tooltip: true,
                        element: element
                    }
                )

            }
        }
    }

};

VAP.policyChart.prototype.addOnClikNodes = function (data) {
    if (this.actions_enabled === true) {
        var that = this;
        data.chart_nodes.on('click', function (element) {
            VAP.App.agularServices.show_asset_info_for_policy_manager(element.id);
            var events_arguments = {
                svgObj: data.svgObj,
                event_this: this,
                links: data.links,
                event_element: element,
                force: data.force,
                charge: data.charge
            }

            var links = data.force.links();

            if (element.selected === true) {
                element.selected = false;

            } else {
                data.force.nodes().forEach(function (d) {
                    d.selected = false;
                })
                element.selected = true;
            }

            that.updateView(data);
        });
    }
}

VAP.policyChart.prototype.setUpPaths = function (data) {
    data.force.links().forEach(function (o) {
        o.policy_path = true;
    })

    var paths = VAP.paths.create(data.chart_wrapper, data.force, data.svgObj);
    return paths;
};

VAP.policyChart.prototype.addMouseEventsForPaths = function (data) {
    var that = this;
    data.paths.on('mouseover', function (element) {
        VAP.App.agularServices.show_conversation(element.info);
        that.toggleTooltip(
            {
                show_tooltip: true,
                element: element
            }
        )
        d3.select(this).classed('active', true);
    });

    data.paths.on('mouseout', function (element) {
        that.toggleTooltip(
            {
                show_tooltip: false
            }
        )
        d3.select(this).classed('active', false);
    });
}


VAP.policyChart.prototype.addOnClikPaths = function (data) {
    if (this.actions_enabled === true) {
        var that = this;
        data.paths.on('click', function (element) {
            that.onElementClick(element, that, this);
            VAP.App.agularServices.coversation_allowed([element.info], element.blocked);
        });
    }
},

    VAP.policyChart.prototype.toggleTooltip = function (arguments) {
        if (this.actions_enabled === true) {
            var show_tooltip = arguments.show_tooltip;
            var blocked = false;
            var disable_modify = false;
            var $tooltip = $('#chart_tooltip');


            if (arguments.element) {
                blocked = arguments.element.blocked;
                disable_modify = arguments.element.disable_modify;
            }


            if (show_tooltip === true) {
                $tooltip.removeClass('hidden');
            } else {
                $tooltip.addClass('hidden');
            }

            $tooltip.find('.allow_text').addClass('hidden');
            $tooltip.find('.block_text').addClass('hidden');
            $tooltip.find('.disable_modify').addClass('hidden');

            if (blocked === true) {
                if (disable_modify === true) {
                    $tooltip.find('.disable_modify').removeClass('hidden');
                } else {
                    $tooltip.find('.allow_text').removeClass('hidden');
                }
            }

            if (blocked !== true) {
                $tooltip.find('.block_text').removeClass('hidden');
            }
        }

    }

VAP.policyChart.prototype.save = function () {
    this.actions_enabled = true;
    VAP.App.agularServices.save_policy();
}

VAP.policyChart.prototype.review = function () {
    this.actions_enabled = false;
    this.data.force.links().forEach(function (link) {
        if (link.blocked === true) {
            link.hidden = true;
        }
    })

    this.data.force.nodes().forEach(function (node) {
        if (node.blocked === true) {
            node.hidden = true;
        }
    })

    this.updateView(this.data);
}

VAP.policyChart.prototype.cancel = function () {
    this.actions_enabled = true;
    this.data.force.links().forEach(function (link) {
        link.hidden = false;
    });

    this.data.force.nodes().forEach(function (node) {
        node.hidden = false;
    });

    this.updateView(this.data);
}

VAP.policyChart.prototype.update = function (data) {
    this.data.force.links().forEach(function (link, i) {
        link.hidden = false;
        link.blocked = data.links[i].blocked;

    });

    this.data.force.nodes().forEach(function (node, i) {
        node.hidden = false;
        node.blocked = data.nodes[i].blocked;
    });


    this.updateView(this.data);
}


VAP.policyChart.prototype.block_asset = function () {
    if (this.actions_enabled === true) {
        var data = this.data;
        var links = this.data.force.links();
        var nodes = this.data.force.nodes();


        nodes.forEach(function (node) {
            if (node.selected === true) {


                var value = true;
                if (node.blocked === true) {
                    value = false;
                }

                node.blocked = value;
                for (var i = 0, l = links.length; i < l; i++) {
                    if (node.index === links[i].target.index) {
                        if (links[i].source.blocked !== true) {
                            links[i].blocked = value;
                            links[i].disable_modify = value;
                            VAP.App.agularServices.coversation_allowed([links[i].info], links[i].blocked);
                        }
                    }
                    else if (node.index === links[i].source.index) {
                        if (links[i].target.blocked !== true) {
                            links[i].blocked = value;
                            links[i].disable_modify = value;
                            VAP.App.agularServices.coversation_allowed([links[i].info], links[i].blocked);
                        }
                    }
                }

            }

        });


        this.updateView(this.data);
    }
}


