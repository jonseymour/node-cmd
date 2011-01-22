/**
 * (C) Copyright Jon Seymour, 2011
 */
command=require("./command");

function defaultDispatcher(cmd) {
    if (cmd.unparsed().length > 0) {
	throw new Error("no dispatcher defined for \"" + cmd.unparsed().join(" ") + "\"");
    } else {
	return cmd;
    }
}

Dispatcher.prototype.createCommand=function() {
    if (arguments.length == 1) {
	return new command.Command(arguments[0]);
    } else {
	var args=[];
	for (var i = 0, max=arguments.length; i < max; i++) {
	    args.push(arguments[i]);
	}
	return new command.Command(args);
    }
}

Dispatcher.prototype.unhandled=defaultDispatcher;

Dispatcher.prototype.dispatch=function() {

    if (!(arguments.length == 1 && arguments[0] instanceof command.Command)) {
	cmd = this.createCommand.apply(this, arguments);
    } else {
	cmd = arguments[0];
    }

    var unparsed = cmd.unparsed();
    var selector = unparsed.length > 0 ? unparsed[0] : undefined;

    if (selector && typeof this[selector] === 'function') {
	return this[selector](cmd.shift(1));
    } else if (typeof this.unhandled === 'function') {
	return this.unhandled(cmd);
    } else {
	return defaultDispatcher.call(this, cmd);
    }
};

function Dispatcher(config)
{
    for (t in config) {
	this[t] = config[t];
    }
    return this;
}

function createDispatcher(config) {
    var dispatcher = new Dispatcher(config);
    return function() {
	return dispatcher.dispatch.apply(dispatcher,arguments);
    }
}

exports.createDispatcher = createDispatcher;
