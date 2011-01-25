/**
 * (C) Copyright Jon Seymour, 2011
 */
command=require("./command");

function Dispatcher(config)
{
    if (typeof config === "object") {
	for (var p in config) {
	    if (config.hasOwnProperty(p)) {
		this[p] = config[p];
	    }
	}
    }

    var self = this;

    this.api = function() {
	return self._strategy.apply(self, arguments);
    };

    return this;
}


Dispatcher.prototype._unhandled = function(cmd) {
    if (cmd.unshifted().length > 0) {
	throw new Error("no dispatcher defined for \"" + cmd.unshifted().join(" ") + "\"");
    } else {
	return cmd;
    }
} 

Dispatcher.prototype._parse = function() {
    return command.createCommand.apply(command, arguments);
}

Dispatcher.prototype._select = function(cmd) {
    var unshifted = cmd.unshifted();
    var selector = unshifted.length > 0 ? unshifted[0] : undefined;
    var handler = ( selector && typeof this[selector] === "function") 
       ? this[selector]
       : undefined;
    var self = this;
    return function() {
	if (handler) {
	    return handler.call(self, cmd.shift(1));
	} else {
	    return self._unhandled.call(self, cmd);
	}
    };
}

Dispatcher.prototype._strategy = function(cmd) {
    if (!(arguments.length == 1 && arguments[0] instanceof command.Command)) {
	cmd = this._parse.apply(this, arguments);
	if (!cmd) {
	    throw new Error("parsing failed to produce an instanceof Command");
	}
    }
    return (this._select.call(this, cmd))();
};

Dispatcher.prototype.api = function()
{
    throw new Error("unexpected invocation of unitialized API");
}

function createDispatcher(config) {
    return new Dispatcher(config).api;
}

exports.createDispatcher = createDispatcher;
