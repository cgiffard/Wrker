function createGraph(selector, data) {
    var container = document.querySelector(selector);

    if (!container)
        throw new Error("Graph container couldn't be matched.");

    var width           = container.clientWidth,
        height          = container.clientHeight,
        graphSVG        = document.createElement("svg");
        graphSVG.width  = width,
        graphSVG.height = height;

    document.appendChild(svg);

    var mappings = {
        "score": null,
        "average": null,
        "50thpercentile": null,
        "75thPercentile": null,
        "90thPercentile": null,
        "99thPercentile": null,
        "stdDev": null
    };

    var self = {
        map: function(input, output) {
            mappings[input] = String(output);
            return self;
        },
        data: function(newData) {
            data = newData;
            return self.updateGraph();
        },
        updateGraph: updateGraph.bind(self, graphSVG, mappings, data)
    }

    return self;
}

function updateGraph() {
    // console.log("Updating graph...");

    var maxReqSec = d3.max(testData, function(sample) {
        return sample.requestsSec;
    });

    var yScale =
        d3.scale.linear()
            .domain([0, maxReqSec])
            .range([0, 100]);

    var xScale =
        d3.scale.linear()
            .domain([0, testData.length])
            .range([0, 100]);

    [].slice.call(document.querySelectorAll("p")).forEach(function(p) {
        p.parentNode.removeChild(p);
    })

    var tpsNodes =
        d3.select("graph.tps")
            .selectAll("p")
            .data(testData);

    tpsNodes.enter()
            .append("p")
            .style("height", function(d) { return yScale(d.requestsSec) + "%" })
            .style("width", function(d, i) { return (100 / testData.length) + "%";})
            .style("left", function(d, i) { return xScale(i) + "%"; })
            .style("bottom", "0px")
            .style("position", "absolute");

    tpsNodes.exit().remove();

    var maxLatency = d3.max(testData, function(sample) {
        return sample.threadLatencyAvg;
    });

    var yScale =
        d3.scale.linear()
            .domain([0, maxLatency])
            .range([0, 100]);

    var xScale =
        d3.scale.linear()
            .domain([0, testData.length])
            .range([0, 100]);

    var latencyNodes =
        d3.select("graph.latency")
            .selectAll("p")
            .data(testData);

    latencyNodes.enter()
            .append("p")
            .style("height", function(d) { return yScale(d.threadLatencyAvg) + "%" })
            .style("width", function(d, i) { return (100 / testData.length) + "%";})
            .style("left", function(d, i) { return xScale(i) + "%"; })
            .style("bottom", "0px")
            .style("position", "absolute");

    latencyNodes.exit().remove();
}

// To make not rubbish
window.setTimeout(function() {
    // document.querySelector("header h2").addEventListener("click", function(e) {
    //     console.log("Kicking off test...");
    //     var f = new Image();
    //     f.src = "/start-test";
    // }, false);

    updateGraph();
}, 250);