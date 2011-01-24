/**
 * (C) Copyright Jon Seymour, 2011
 */
command=require("./command");

function Dispatcher(config)
{
    var self = this;

    this.table = config || {};

    if (!this.table._unhandled) {
	this.table._unhandled = function(cmd) {
	    if (cmd.unshifted().length > 0) {
		throw new Error("no dispatcher defined for \"" + cmd.unshifted().join(" ") + "\"");
	    } else {
		return cmd;
	    }
	}
    }

    if (!this.table._parse) {
	this.table._parse = function() {
	    return command.createCommand.apply(command, arguments);
	}
    }

    if (!this.table._select) {
	this.table._select = function(cmd) {
	    var unshifted = cmd.unshifted();
	    var selector = unshifted.length > 0 ? unshifted[0] : undefined;
	    return ( selector && typeof self.table[selector] === "function") 
	       ? self.table[selector]
	       : undefined;
	}
    }

    this.api = function(cmd) {

	if (!(arguments.length == 1 && arguments[0] instanceof command.Command)) {
	    cmd = self.table._parse.apply(self.api, arguments);
	}

	var handler = self.table._select(cmd);

	if (handler) {
	    return handler.call(self.api, cmd.shift(1));
	} else {
	    return self.table._unhandled.call(self.api, cmd);
	}
    };

    return this;
}

function createDispatcher(config) {
    return new Dispatcher(config).api;
}

exports.createDispatcher = createDispatcher;
