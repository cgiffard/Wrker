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
    var graph = createGraph(graph, data, value);

    select.addEventListener("change", function(evt) {
        graph.setComparisonMetric(select.value || null);
    });

    return graph;
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

    function updateGraph() {
        d3.select(graphSVG)
            .attr("width", width)
            .attr("height", height);

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

        var xScale,
            yScale =
                d3.scale.linear()
                    .domain([0, dataMax])
                    .range([0, height]);

        if (!!comparisonMetric) {
            xScale =
                d3.scale.pow()
                    .domain([0, secondaryMetricMax])
                    .range([0, width]);
        } else {
            xScale =
                d3.scale.linear()
                    .domain([0, graphData.length])
                    .range([0, width]);
        }

        [].slice.call(graphSVG.querySelectorAll("rect")).forEach(function(rect) {
            graphSVG.removeChild(rect);
        });

        var graphNodes =
                d3.select(graphSVG)
                    .selectAll("rect")
                    .data(graphData),
            rects =
                graphNodes
                    .enter()
                    .append("rect");

        if (!!comparisonMetric) {
            rects
                .attr("stroke", "white")
                .attr("width",  4)
                .attr("height", 4)
                .attr("x",      function(d, i) { return xScale(secondryMetricData[i]) - 2; })
                .attr("y",      function(d, i) { return height - (yScale(d) - 2);          })
                .attr("fill",   "green");
        } else {
            rects
                .attr("width", function(d, i) {
                    var barWidth = (width / graphData.length) | 0;
                    return (barWidth > 1 ? barWidth - 1 : barWidth) || 1;
                })
                .attr("height", function(d)    { return yScale(d);           })
                .attr("x",      function(d, i) { return xScale(i);           })
                .attr("y",      function(d, i) { return height - yScale(d);  })
                .attr("fill",   "green");
        }

        graphNodes.exit().remove();

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