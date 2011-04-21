var command=require("./command");
var dispatcher=require("./dispatcher");

exports.createDispatcher=dispatcher.createDispatcher;
exports.use=dispatcher.use;
exports.createCommand=command.createCommand;
exports.Command=command.Command;
