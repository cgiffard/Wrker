module.exports = function parseResults(text) {
    var result = {};

    var threadLatency       =
            text.match(/Latency\s+([\d\.]+)[^\d]+([\d\.]+)[^\d]+([\d\.]+)[^\d]+([\d\.]+)/i),
        threadReqSec        =
            text.match(/Req\/Sec\s+([\d\.]+)[^\d]+([\d\.]+)[^\d]+([\d\.]+)[^\d]+([\d\.]+)/i),
        latencyDistribution =
            text.match(/Distribution[^\%]+[^\d]+([\d\.]+)[^\%]+[^\d]+([\d\.]+)[^\%]+[^\d]+([\d\.]+)[^\%]+[^\d]+([\d\.]+)/i),
        generalStats        =
            text.match(/(\d+)\s+requests in\s+([\d\.]+)[^\d]+([\d\.]+)[^\d]+/i),
        requestsSec         =
            text.match(/Requests\/sec[^\d]+([\d\.]+)/i),
        transferSec         =
            text.match(/Transfer\/sec[^\d]+([\d\.]+)/i);

    // Thread latency statistics
    result.threadLatencyAvg             = parseFloat(threadLatency[1]);
    result.threadLatencyStdDev          = parseFloat(threadLatency[2]);
    result.threadLatencyMax             = parseFloat(threadLatency[3]);
    result.threadLatencyStdDevPerc      = parseFloat(threadLatency[4]);

    // Thread req/s statistics
    result.threadRequestsSecAvg         = parseFloat(threadLatency[1]);
    result.threadRequestsSecStdDev      = parseFloat(threadLatency[2]);
    result.threadRequestsSecMax         = parseFloat(threadLatency[3]);
    result.threadRequestsSecStdDevPerc  = parseFloat(threadLatency[4]);

    // Latency distribution
    result.latency50thPercentile        = parseFloat(latencyDistribution[1]);
    result.latency75thPercentile        = parseFloat(latencyDistribution[2]);
    result.latency90thPercentile        = parseFloat(latencyDistribution[3]);
    result.latency99thPercentile        = parseFloat(latencyDistribution[4]);

    // Total stats breakdown
    result.totalRequestsMade            = parseFloat(generalStats[1]);
    result.totalTimeTaken               = parseFloat(generalStats[2]);
    result.totalDataRead                = parseFloat(generalStats[3]) * 1024 * 1024;

    // Requests per second
    result.requestsSec                  = parseFloat(requestsSec[1]);
    // Transfer per second
    result.transferSec                  = parseFloat(transferSec[1]) * 1024 * 1024;

    return result;
};
