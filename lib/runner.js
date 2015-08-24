var exec         = require("child_process").exec,
    cpus         = require("os").cpus().length,
    util         = require("util"),
    EventEmitter = require("events").EventEmitter,
    parseResults = require("./parser");

function initialiseTest(urls, iterations, duration, averageOf, stepBy) {
    if (!urls || !urls.length)
        throw new Error("One or more valid URLs must be specified.");

    var emitter = new EventEmitter();

    urls = urls instanceof Array ? urls : [ urls ];
    duration    = duration  || 5;
    averageOf   = averageOf || 3;
    stepBy      = stepBy    || 10;

    function doTestForURL(url, doTestForURLCallback) {
        var iterationData = [];

        (function runLoop(iteration) {
            var connections = ((iteration / averageOf) | 0) * stepBy || 1;

            if (!(iteration % averageOf) || !iteration) {
                emitter.emit("iterationstart",
                    ((iteration / averageOf) | 0),
                    connections);
            }

            emitter.emit("teststart", url, connections, duration);
            runWrk(connections, duration, url, function(err, data) {
                if (err) return doTestForURLCallback(err);

                emitter.emit("testcomplete", url, data);

                iterationData.push({
                    "url":          url,
                    "connections":  connections,
                    "duration":     duration,
                    "data":         data
                });

                if (iteration + 1 < iterations * averageOf) {
                    return runLoop(iteration + 1);
                }

                doTestForURLCallback(null, iterationData);
            });
        })(0);
    }

    emitter.start = function testRunner(testCallback) {
        var urlData = {};
        testCallback = testCallback || function() {
            emitter.emit.apply(emitter,
                ["suitecomplete"].concat([].slice.call(arguments)));
        };

        (function urlIterator(urls) {
            if (!urls.length)
                return testCallback(null, urlData);

            var head    = urls[0],
                tail    = urls.slice(1);

            doTestForURL(head, function(err, data) {
                if (err) return testCallback(err);
                urlData[head] = data;
                urlIterator(tail);
            });
        })(urls);
    };

    return emitter;
}

function runWrk(connections, duration, url, runWrkCallback) {
    var command =
        util.format("wrk -t %d -d %ds -c %d --latency -- %s",
            cpus > connections ? connections : cpus,
            duration,
            connections,
            url
        );

    exec(command, function(err, stdout, stderr) {
        if (err) return runWrkCallback(err);
        var result = parseResults(stdout);

        // Add test configuration to result
        result.connections  = connections;
        result.duration     = duration;
        result.url          = url;

        runWrkCallback(null, result);
    });
}

module.exports = initialiseTest;