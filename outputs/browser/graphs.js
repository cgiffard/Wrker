function createGraphContainer(title, data, value, graphs) {
    var container       = document.createElement("section"),
        heading         = document.createElement("h1"),
        graph           = document.createElement("graph"),
        control         = document.createElement("span"),
        select          = document.createElement("select"),
        defaultOption   = document.createElement("option");

    heading.innerText = title;
    container.appendChild(heading);
    container.appendChild(control);
    control.appendChild(document.createTextNode("Mash with — "));
    control.appendChild(select);
    container.appendChild(graph);

    defaultOption.appendChild(document.createTextNode("Default (by iteration)"));
    defaultOption.setAttribute("value", "0");
    select.appendChild(defaultOption);

    control.className = "mashwith";

    graphs.forEach(function(graph) {
        if (graph.name === value) return;

        var option = document.createElement("option");
        option.appendChild(document.createTextNode(graph.title))
        option.setAttribute("value", graph.name);
        select.appendChild(option);
    });

    document.querySelector("main").appendChild(container);

    // The single value parameter is temporary — will eventually replace with
    // multiple mappings per graph
    var graphObject = createGraph(graph, data, value);

    select.addEventListener("change", function(evt) {
        graphObject.setComparisonMetric(select.value || null);
    });

    return graphObject;
}

function createGraph(selector, data, value) {
    var comparisonMetric = null,
        container = typeof selector === "object" ?
                           selector : document.querySelector(selector);

    if (!container)
        throw new Error("Graph container couldn't be matched.");

    var width  = container.clientWidth,
        height = container.clientHeight;

    window.addEventListener("resize", function() {
        width  = container.clientWidth;
        height = container.clientHeight;
        updateGraph();
    });

    var graphSVG =
        d3.select(container)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("width", "100%")
            .style("height", "100%");

    // Unwrap d3 array into DOM node
    while (graphSVG instanceof Array)
        graphSVG = graphSVG[0];

    // Todo: make this useful
    var mappings = {
        "score": null,
        "average": null,
        "50thpercentile": null,
        "75thPercentile": null,
        "90thPercentile": null,
        "99thPercentile": null,
        "stdDev": null
    };

    var chart =
        nv.models.scatterChart()
            .duration(1000)
            .width(width)
            .height(height)
            .showDistX(true)
            .showDistY(true)
            .showLegend(false)
            .margin({
                top: 30, left: 100, right: 30, bottom: 50
            });

    chart.xAxis.ticks(20);
    chart.yAxis.ticks(6);

    function updateGraph() {

        // Process data
        var graphData =
            data.map(function(sample) {
                return sample[value];
            }),
            secondryMetricData =
                !!comparisonMetric ? data.map(function(sample) {
                    return sample[comparisonMetric];
                }) : [];

        var dataMax            = d3.max(graphData),
            secondaryMetricMax = d3.max(secondryMetricData);

        var axisValues =
            data.map(function(sample, index) {
                return {
                    x:      comparisonMetric ? sample[comparisonMetric] : index,
                    y:      sample[value],
                    size:   index + 2
                };
            }),
            graphSeries = [
                {
                    values: axisValues,
                    key:    value,
                    color:  "goldenrod"
                }
            ];

        chart
            .xDomain([0, comparisonMetric ? secondaryMetricMax : data.length])
            .yDomain([0, dataMax]);

        chart.xAxis.axisLabel(comparisonMetric || "Iteration");

        d3.select(graphSVG)
            .attr("width", width)
            .attr("height", height)
            .datum(graphSeries)
            .call(chart);

        return self;
    }

    var self = {
        map: function(input, output) {
            mappings[input] = String(output);
            return self;
        },
        data: function(newData) {
            data = newData;
            return self.update();
        },
        setComparisonMetric: function(metric) {
            comparisonMetric = metric !== "0" ? metric : null;
            updateGraph();
            return self;
        },
        update: updateGraph
    };

    return self;
}