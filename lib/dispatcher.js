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
    var
    options={},
    positional = [],
    optional = [],
    next,
    name,
    value,
    equals,
    cmd,
    args,
    i,j;

    if (arguments.length == 1 && arguments[0] instanceof Array) {
	args = arguments[0];
    } else {
	args = arguments;
    }

    for (i = 0; i < args.length; ++i) {
	next = args[i];
	if (next && next.indexOf && next.indexOf("--") === 0) {
	    if (next.length == 2) {
		optional.push("--");
		positional.push.apply(positional, args.slice(i+1));
		break;
	    }
	    equals = next.indexOf("=");
	    if (equals < 0) {
		name = next.substring(2);
		value = "";
	    } else {
		name = next.substring(2, equals);
		value = next.substring(equals + 1);
	    }
	    options[name] = value;
	    optional.push(next);
	} else if (next && next.indexOf && next.indexOf("-") === 0) {
	    for (j = 1; j < next.length; ++j) {
		options[next.charAt(j)] = true;
	    }
	    optional.push(next);
	} else {
	    positional.push(next);
	}
    }

    cmd = command.createCommand.apply(command, optional.concat(positional)).shift(optional.length);
    cmd.options = options;
    return cmd;
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

Dispatcher.prototype._strategy = function() {
    var cmd;

    if (!(arguments.length == 1 && arguments[0] instanceof command.Command)) {
        cmd = this._parse.apply(this, arguments);
        if (!cmd) {
            throw new Error("parsing failed to produce an instanceof Command");
        }
    } else {
	cmd = arguments[0];
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
