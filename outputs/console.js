module.exports = function(test, programme) {

    console.log(
        "\nRunning %d testing iterations:" +
        "\n\t- Duration %ds" +
        "\n\t- Reporting for an average of %d tests" +
        "\n\t- Stepping up by %d connections each iteration\n",
        programme.iterations,
        programme.duration,
        programme.averageOf,
        programme.stepBy);

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

    function pad(string, to) {
        while (string.length < to) {
            string = " " + string;
        }
        return string;
    }

    function printStats(stats, clear) {

        if (clear) {
            for (var lineCount = -2;
                lineCount < Object.keys(stats).length;
                lineCount++)
                process.stdout.write("\x1b[1A\x1b[K");
        }

        var labelMaxLength =
            Math.max.apply(Math,
                Object.keys(stats)
                    .map(decamelise)
                    .map(function(item) { return item.length; }));

        Object.keys(stats)
            .map(function(stat) {
                return {
                    name: decamelise(stat),
                    value: valueOrBreakdown(stats[stat])
                };
            })
            .forEach(function(stat) {
                console.log(
                    "%s".dim + " %s",
                    pad(stat.name, labelMaxLength + 1 ),
                    stat.value);
            });

        console.log("\n");
    }

    function avg(array) {
        return (((
            array.reduce(function(acc, cur) { return cur + acc; }, 0) /
                array.length
        ) * 100) | 0) / 100;
    }

    function valueOrBreakdown(value) {
        if (!(value instanceof Array)) return value;

        if (value.length <= 3)
            return value.join(", ") + (" (avg " + avg(value) + ")").blue;

        return "...".dim + (
            value.slice(value.length - 3, value.length).join(", ") +
                (" (avg " + avg(value) + " of " + value.length + ")").blue
        );
    }

    function collateStats(stats) {
        return stats.reduce(function(collated, statIteration) {
            Object.keys(statIteration)
                .map(function(key) {
                    return { key: key, val: statIteration[key] };
                })
                .forEach(function(item) {
                    if (typeof item.val === "string") {
                        return (collated[item.key] = item.val);
                    }

                    collated[item.key] = collated[item.key] ?
                        collated[item.key].concat(item.val) : [item.val];
                });

            return collated;
        }, {})
    }

    var statsForIteration = [],
        totalStats        = []

    test.on("iterationstart", function(iteration, connections) {
        console.log(
            "\tCommencing iteration %d ".cyan + "(%d connection/s)".dim + "\n",
            iteration + 1, connections);

        statsForIteration = [];
    });

    test.on("testcomplete", function(url, stats) {
        statsForIteration.push(stats);
        totalStats.push(stats);
        printStats(collateStats(statsForIteration), statsForIteration.length > 1);
    });

    test.on("suitecomplete", function() {
        console.log("\n\n------------------------------------------------");
        console.log("Testing complete!\n".green);
        printStats(collateStats(totalStats));
    });
}