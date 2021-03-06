/*
 * Name space
 */
var CBMONITOR = CBMONITOR || {};

/*
 * Tabs with clusters/metrics/events
 */
CBMONITOR.configureAccordion = function() {
    "use strict";

    $("#accordion").accordion({
        heightStyle: "fill"
    });
};

/*
 * Panel with buttons related to cluster management
 */
CBMONITOR.configureCPanel = function() {
    "use strict";

    $("input:button")
        .button()
        .css({
            fontSize: "77%",
            width: "23%"
        })
        .click(function() {
            switch(this.value) {
                case "Add cluster":
                    $("#dialog_new_cluster").dialog("open");
                    break;
                case "Add server":
                    $("#dialog_new_server").dialog("open");
                    break;
                case "Add bucket":
                    $("#dialog_new_bucket").dialog("open");
                    break;
                case "Edit":
                    //var selected_id = jstree.jstree("get_selected").attr("id");
                    //jstree.jstree("rename", selected_id);
                    break;
                case "Delete":
                    $("#dialog_delete").dialog("open");
                    break;
                default:
                    break;
            }
        });

    $("input:text")
        .button()
        .css({
            fontSize: "77%",
            textAlign: "left",
            cursor : "text"
        });
};

/*
 * Cluster tree
 */
CBMONITOR.configureCTree = function() {
    "use strict";

    var jstree = $("#tree"),
        renc = $("#renc"),
        delc = $("#delc"),
        adds = $("#adds");

    // Disable buttons
    renc.addClass("ui-state-disabled");
    delc.addClass("ui-state-disabled");
    adds.addClass("ui-state-disabled");

    // Create tree
    jstree.jstree({
        "themes" : {
            "theme" : "default",
            "icons" : false
        },
        "crrm": {
            "move": {
                "check_move": function (m) {
                    var p = this._get_parent(m.o);
                    if (!p) {
                        return false;
                    }
                    p = p === -1 ? this.get_container() : p;
                    if (p === m.np) {
                        return true;
                    }
                    return p[0] && m.np[0] && p[0] === m.np[0];
                }
            }
        },
        "dnd": {
            "drop_target": false,
            "drag_target": false
        },
        "plugins": ["themes", "json_data", "dnd", "ui", "crrm"],
        "json_data": {
            "ajax" : {
                "url" : "/cbmonitor/get_tree_data/"
            }
        }
    });

    // Expand all nodes
    jstree.on("loaded.jstree", function() {
        jstree.jstree("open_all");
    });

    // Define binding
    jstree.bind("select_node.jstree", function (event, data) {
        var cls = data.rslt.obj.attr("class").split(" ")[0];
        switch(cls) {
            case "cluster":
                delc.removeClass("ui-state-disabled");
                adds.addClass("ui-state-disabled");
                break;
            case "servers":
                adds.removeClass("ui-state-disabled");
                adds.prop("value", "Add server");
                break;
            case "server":
                delc.removeClass("ui-state-disabled");
                adds.addClass("ui-state-disabled");
                break;
            case "buckets":
                adds.removeClass("ui-state-disabled");
                adds.prop("value", "Add bucket");
                break;
            case "bucket":
                delc.removeClass("ui-state-disabled");
                adds.addClass("ui-state-disabled");
                break;
            default:
                break;
        }
    });
};

/*
 * Panel with radio buttons related to chart views
 */
CBMONITOR.configureChartPanel = function() {
    "use strict";

    $("#vpanel").buttonset();
    $(".vradio").click(function() {
        var views = $("#views");
        views.empty();
        switch(this.id) {
            case "view1":
                $("<div/>", {
                    "id": "first_view",
                    "class": "chart_view_single"
                }).appendTo(views);
                break;
            case "view2":
                $("<div/>", {
                    "id": "first_view",
                    "class": "chart_view_double"
                }).appendTo(views);
                $("<div/>", {
                    "id": "second_view_double",
                    "class": "chart_view_double"
                }).appendTo(views);
                break;
            case "view4":
                $("<div/>", {
                    "id": "first_view",
                    "class": "chart_view_quadruple"
                }).appendTo(views);
                $("<div/>", {
                    "id": "second_view",
                    "class": "chart_view_quadruple"
                }).appendTo(views);
                $("<div/>", {
                    "id": "third_view",
                    "class": "chart_view_quadruple"
                }).appendTo(views);
                $("<div/>", {
                    "id": "fourth_view",
                    "class": "chart_view_quadruple"
                }).appendTo(views);
                break;
            default:
                break;
        }
        CBMONITOR.enableDroppable();
    });
    $("#rpanel").buttonset();
};

CBMONITOR.getMetricsAndEvents = function(type) {
    "use strict";

    var prefix = (type === "metric")? "met" : "evnt";
    $.ajax({
        url: "/cbmonitor/get_metrics_and_events/", dataType: "json",
        data: {
            "cluster": $("#" + prefix + "_cluster option:selected").val(),
            "server": $("#" + prefix + "_server option:selected").val(),
            "bucket": $("#" + prefix + "_bucket option:selected").val(),
            "type": type
        },
        success: function(metrics) {
            var ul = (type === "metric") ? "#metrics_ul" : "#events_ul";
            metrics.forEach(function(metric) {
                $(ul).empty();
                $(ul).append(
                    $("<li>").addClass("ui-state-default ui-corner-all").append(
                        metric
                    )
                );
            });
            $(ul + " li").draggable({
                "revert": "invalid",
                "appendTo": "#views",
                "helper": "clone"
            });
        }
    });
};

CBMONITOR.enableDroppable = function() {
    "use strict";

    $("#views div").droppable({
        activeClass: "ui-state-default",
        hoverClass: "ui-state-hover",
        drop: function(event, ui) {
            //$(this).attr("id") ui.draggable.text();
        }
    });
};

CBMONITOR.configureMEPanel = function() {
    "use strict";

    CBMONITOR.configureClusters("metric");
    CBMONITOR.configureClusters("event");
};

CBMONITOR.configureClusters = function(type) {
    "use strict";

    $.ajax({url: "/cbmonitor/get_clusters/", dataType: "json",
        success: function(clusters){
            var sel = (type === "metric") ? $("#met_cluster") : $("#evnt_cluster");
            sel.empty();
            clusters.forEach(function(cluster) {
                var o = new Option(cluster, cluster);
                sel.append(o);
            });
            sel.selectmenu({
                select: function(event, option) {
                    CBMONITOR.configureMEItems(option.value, type, "server");
                    CBMONITOR.configureMEItems(option.value, type, "bucket");
                }
            });
            CBMONITOR.configureMEItems(clusters[0], type, "server");
            CBMONITOR.configureMEItems(clusters[0], type, "bucket");
        }
    });
};

CBMONITOR.configureMEItems = function(cluster, type, item) {
    "use strict";

    $.ajax({url: "/cbmonitor/get_" + item + "s/", dataType: "json",
        data: {"cluster": cluster},
        success: function(items) {
            var sel = (type === "metric") ? $("#met_" + item) : $("#evnt_" + item);
            sel.empty();
            var o = new Option("None", "");
            sel.append(o);
            items.forEach(function(item) {
                var o = new Option(item, item);
                sel.append(o);
            });
            sel.selectmenu({
                select: function() {
                    CBMONITOR.getMetricsAndEvents(type);
                }
            });
            CBMONITOR.getMetricsAndEvents(type);
        }
    });
};

$(document).ready(function(){
    "use strict";

    CBMONITOR.configureMEPanel();
    CBMONITOR.configureAccordion();
    CBMONITOR.configureCPanel();
    CBMONITOR.configureCTree();
    CBMONITOR.addNewCluster();
    CBMONITOR.addNewServer();
    CBMONITOR.addNewBucket();
    CBMONITOR.deleteItem();
    CBMONITOR.configureChartPanel();
    CBMONITOR.enableDroppable();
});