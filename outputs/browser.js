module.exports = function(test, programme) {

    console.log(
        "Starting server for browser reporter...".yellow);

    var http    = require("http"),
        jade    = require("jade"),
        path    = require("path"),
        server  = http.createServer(serverInitHandler)
                        .listen(2501, nowListening);

    var eventListeners = [];

    function nowListening() {
        console.log("Server now listening on http://::1:2501.".green);
    }

    function writeError(err, res) {
        res.writeHead(500, { "Content-type":  "text/plain" });
        res.end("Internal Server Error: \n" + err.stack);
    }

    function write404(res) {
        res.writeHead(404);
        res.end("Resource not found.");
    }

    function sendHTML(data, res) {
        res.writeHead(200, { "Content-type":  "text/html" });
        res.end(data);
    }

    function serverInitHandler(req, res) {
        if (req.url === "/event-source") {
            return handleServerSentEvents(req, res);
        }

        if (req.url === "/start-test") {
            test.start();
            return sendHTML("OK", res);
        }

        if (req.url === "/") {
            jade.renderFile(
                path.join(__dirname, "browser", "index.jade"), {},
                function(err, data) {
                    if (err)
                        return writeError(err, res);

                    sendHTML(data, res);
                });
        }

        return write404(res);
    }

    function handleServerSentEvents(req, res) {
        var listenerIndex = eventListeners.length,
            removed = false;

        eventListeners.push(function(eventName, args) {
            res.write("event: " + eventName + "\n" +
                      "data: " + JSON.stringify(args) + "\n\n");
        });

        function killListener() {
            if (removed) return;

            console.log(
                "SSE connection severed. Removing listener %d.".red,
                listenerIndex);

            eventListeners.splice(listenerIndex);
            removed = true;
        }

        console.log(
            "Registered new SSE listener at index %d.".yellow,
            listenerIndex)

        req.on("aborted", killListener)
           .on("error",   killListener);
        res.on("aborted", killListener)
           .on("error",   killListener)
           .on("close",   killListener)
           .on("end",     killListener);

        res.socket.setNoDelay(true);
        res.writeHead(200, {
            "Content-type":  "text/event-stream",
            "Cache-Control": "private, no-cache"
        });

        setInterval(function keepAlive() { res.write(":keepAlive\n\n"); }, 1000);
    };

    function sendMessage() {
        if (!eventListeners.length) return;

        console.log("Sending event %s".dim, arguments[0]);

        var eventName = arguments[0],
            args = [].slice.call(arguments, 1);
        eventListeners.forEach(function(listener) {
            listener(eventName, args);
        });
    }

    test.on("iterationstart",   sendMessage.bind(null, "iterationstart"));
    test.on("teststart",        sendMessage.bind(null, "teststart"));
    test.on("testcomplete",     sendMessage.bind(null, "testcomplete"));
    test.on("suitecomplete",    sendMessage.bind(null, "suitecomplete"));

};