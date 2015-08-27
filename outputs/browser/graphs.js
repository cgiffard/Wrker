function createGraphContainer(title, data, value) {
    var container = document.createElement("section"),
        heading   = document.createElement("h1"),
        graph     = document.createElement("graph");

    heading.innerText = title;
    container.appendChild(heading);
    container.appendChild(graph);
    document.querySelector("main").appendChild(container);

    // The single value parameter is temporary — will eventually replace with
    // multiple mappings per graph
    return createGraph(graph, data, value);
}

function createGraph(selector, data, value) {
    var container = typeof selector === "object" ?
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

        var graphData = data.map(function(sample) {
            return sample[value];
        });

        var dataMax = d3.max(graphData);

        var yScale =
            d3.scale.linear()
                .domain([0, dataMax])
                .range([0, height]);

        var xScale =
            d3.scale.linear()
                .domain([0, graphData.length])
                .range([0, width]);

        [].slice.call(graphSVG.querySelectorAll("rect")).forEach(function(rect) {
            graphSVG.removeChild(rect);
        });

        var graphNodes =
            d3.select(graphSVG)
                .selectAll("rect")
                .data(graphData);

        graphNodes
            .enter()
            .append("rect")
                .attr("width", function(d, i) {
                    var barWidth = (width / graphData.length) | 0;
                    return (barWidth > 1 ? barWidth - 1 : barWidth) || 1;
                })
                .attr("height", function(d)    { return yScale(d);               })
                .attr("x",      function(d, i) { return xScale(i);               })
                .attr("y",      function(d, i) { return height - yScale(d);      })
                .attr("fill",   "green");

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
            return self.updateGraph();
        },
        update: updateGraph
    };

    return self;
}