/**
 * (C) Copyright Jon Seymour, 2011
 */

var EMPTY = function() { return [] };

Command.prototype.shifted = EMPTY;
Command.prototype.unshifted = EMPTY;


/**
 * @constructor
 */
function Command()
{
    var args;
    if (arguments.length == 1) {
        args = arguments[0]
    } else {
        args=[];
        arguments.forEach(function(e) { args.push(e) });
    }
    if (args instanceof Command) {
        /**
         * Use the parent command as a prototype.
         */
        var tmp = function() { };
        tmp.prototype = args;
        return new tmp();
    } else if (args instanceof Array) {
        /**
         * Initialize unshifted() from a copy of the arguments.
         */
        this.unshifted = function() { return args.slice(0) };
    } else if (args) {
        /**
         * Initialize unshifted() from the argument.
         */
        this.unshifted = function() { return [ args ] };
    }

    var shared={};
    this.shared=function() {
        return shared;
    };

    this.options={};

    return this;
}

/**
 * @param count The number of parameters to shift from the unshifted array to the shifted array.
 * @return A new command that inherits the receiver, but whose shifted() and
 * unshifted() functions are altered.
 */
Command.prototype.shift = function (count) {
    if (count > 0) {
	var shiftedArgs = this.shifted();
	var unshiftedArgs = this.unshifted();
	var shifted = new Command(this);
	shiftedArgs = unshiftedArgs.splice(0, count);
	shifted.unshifted = function() { return unshiftedArgs.slice(0); };
	shifted.shifted = function() { return shiftedArgs.slice(0); };
	return shifted;
    } else if (count == 0) {
	return this;
    } else {
	throw new Error("invalid argument: less than zero");
    }
}

exports.createCommand = function() {
    if (arguments.length == 1) {
        return new Command(arguments[0]);
    } else {
        var args=[];
        for (var i = 0, max=arguments.length; i < max; i++) {
            args.push(arguments[i]);
        }
        return new Command(args);
    }
}

exports.Command = Command;

