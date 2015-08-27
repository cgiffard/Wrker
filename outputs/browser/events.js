var evtSourceStreamURL  = window.location.href + "event-source",
    source              = new EventSource(evtSourceStreamURL);

// temporary
var testData = JSON.parse(localStorage.testData || "[]");

function updateStatus(status) {
    document.body.querySelector("header h2").innerText = status;
}

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
    localStorage.testData = JSON.stringify(testData);
    console.log(eventData[1]);
    updateGraph();
});

source.addEventListener("suitecomplete", function(evt) {
    var eventData = JSON.parse(event.data);
    // console.log(eventData);
    updateStatus("Suite complete.");
});