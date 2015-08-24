module.exports = require("./lib/runner");
module.exports.outputs = {
    "csv":      require("./outputs/csv"),
    "console":  require("./outputs/console"),
    "browser":  require("./outputs/browser")
};