module.exports = function(test, programme) {
    var headerWritten = false;

    test.on("testcomplete", function(url, stats) {
        if (!headerWritten) {
            headerWritten = true;

            console.log(Object.keys(stats).join(","));
        }

        console.log(Object.keys(stats).map(function(key) { return stats[key]; }).join(","));
    });
}