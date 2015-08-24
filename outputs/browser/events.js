var evtSourceStreamURL = window.location.href + "event-source";
var source = new EventSource(evtSourceStreamURL);

var testData = [{requestsSec:1.23},{requestsSec:502.23}];

// var i = 0;
// setInterval(
//     function() {
//         testData.push({
//             requestsSec:
//                 (i * 10) +
//                 Math.abs(Math.cos((Date.now()/1000)%(4*Math.PI)) * 5000) +
//                 Math.abs(Math.sin((Date.now()/100000)%(2*Math.PI)) * 1000) +
//                 Math.abs(Math.sin((Date.now()/100000)%(3*Math.PI)) * 250) +
//                 ((Math.random()-0.5) * 700)
//             });
// 
//         updateGraph();
//         // console.log(testData[testData.length-1]);
//         i++;
// 
//         if (testData.length >= 400)
//             testData.shift();
// 
//         updateStatus(testData.length);
//     }, 33);

function updateStatus(status) {
    document.body.querySelector("header h2").innerText = status;
}

function updateGraph() {
    // console.log("Updating graph...");

    var maxReqSec =
        Math.max.apply(Math,
            testData.map(function(data) { return data.requestsSec; }));

    [].slice.call(document.querySelectorAll("p")).forEach(function(p) {
        p.parentNode.removeChild(p);
    })

    var latencyNodes =
        d3.select("graph.latency")
            .selectAll("p")
            .data(testData);

    latencyNodes.enter()
            .append("p")
            // .text(function(d) { return d.requestsSec })
            .style("height", function(d) { return String(( d.requestsSec / maxReqSec) * 100) + "%" });
            // .exit().remove();

    // latencyNodes
    //     .enter()
    //     .append("p")
    //     .attr("class", "latency")
    //     .attr("height", function(d) { return d.reqSec })
    //     .text(function(d) { return d.reqSec });

    latencyNodes.exit().remove();
}

// To make not rubbish
window.setTimeout(function() {
    document.querySelector("header h2").addEventListener("click", function(e) {
        console.log("Kicking off test...");
        var f = new Image();
        f.src = "/start-test";
    }, false);

    updateGraph();
}, 250);

source.addEventListener("open", function(evt) {
    console.log("Started new eventSource at %s", source.url);
    document.body.classList.add("ok");
    document.body.classList.remove("error");
});

source.addEventListener("error", function(evt) {
    console.error("Error talking to wrker server.");
    document.body.classList.remove("ok");
    document.body.classList.add("error");
});

source.addEventListener("iterationstart", function(evt) {
    var eventData = JSON.parse(event.data),
        iteration = eventData[0],
        connections = eventData[1];

    // updateStatus(
    //     "Starting iteration " + iteration +
    //         " (" + connections + " connections)");
});

source.addEventListener("teststart", function(evt) {
    var eventData = JSON.parse(event.data);
    // console.log(eventData);
});

source.addEventListener("testcomplete", function(evt) {
    var eventData = JSON.parse(event.data);
    updateStatus("Test complete (" + eventData[1].requestsSec + " req/s)")
    testData.push(eventData[1]);
    console.log(eventData[1]);
    updateGraph();
});

source.addEventListener("suitecomplete", function(evt) {
    var eventData = JSON.parse(event.data);
    // console.log(eventData);
    updateStatus("Suite complete.");
});