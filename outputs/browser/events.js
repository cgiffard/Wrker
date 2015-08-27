var evtSourceStreamURL  = window.location.href + "event-source",
    source              = new EventSource(evtSourceStreamURL);

var testData = [];

function decamelise(string) {
    return (
        (string.match(/(\d+th|[0-9]+|[a-z]+|[A-Z][a-z]+)/g) || [])
            .filter(function(piece) {
                return piece && piece.length;
            })
            .map(function(i) {
                return  i.substr(0,1).toUpperCase() +
                        i.substr(1, i.length);
            })
            .join(" ")
    );
}

var graphs = [];
var testRunning = false;
window.addEventListener("load", function(e) {
    graphs = [
            "requestsSec",
            "connections",
            "duration",
            "latency50thPercentile",
            "latency75thPercentile",
            "latency90thPercentile",
            "latency99thPercentile",
            "threadLatencyAvg",
            "threadLatencyMax",
            "threadLatencyStdDev",
            "threadLatencyStdDevPerc",
            "threadRequestsSecAvg",
            "threadRequestsSecMax",
            "threadRequestsSecStdDev",
            "threadRequestsSecStdDevPerc",
            "totalDataRead",
            "totalRequestsMade",
            "totalTimeTaken",
            "transferSec"
        ]
        .map(function(value) {
            return createGraphContainer(decamelise(value), testData, value);
        });

    graphs.forEach(function(graph) {
        graph.update();
    });

    document.querySelector("h2.status").
        addEventListener("click", function() {
            if (testRunning) return;
            var req = new XMLHttpRequest()
            req.open("GET", "/start-test");
            req.send();
            testRunning = true;
        });
});

function updateStatus(status) {
    document.body.querySelector("header h2").innerText = status;
}

source.addEventListener("open", function() {
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
});

source.addEventListener("teststart", function(evt) {
    var eventData = JSON.parse(event.data);
    updateStatus("Launching test (" + eventData[1] + " connections)");
});

source.addEventListener("testcomplete", function(evt) {
    var eventData = JSON.parse(event.data);
    updateStatus("Test complete (" + eventData[1].requestsSec + " req/s)")
    testData.push(eventData[1]);
    graphs.forEach(function(graph) {
        graph.update();
    });
});

source.addEventListener("suitecomplete", function(evt) {
    var eventData = JSON.parse(event.data);
    updateStatus("Suite complete.");
    testRunning = false;
});