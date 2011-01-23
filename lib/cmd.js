var command=require("./command");
var dispatcher=require("./dispatcher");

exports.createDispatcher=dispatcher.createDispatcher;
exports.createCommand=command.createCommand;
exports.Command=command.Command;
