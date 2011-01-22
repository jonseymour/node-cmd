/**
 * (C) Copyright Jon Seymour, 2011
 */

var EMPTY = function() { return [] };

Command.prototype.parsed = EMPTY;
Command.prototype.unparsed = EMPTY;


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
	var tmp = function() { };
	tmp.prototype = args;
	return new tmp();
    } else if (args instanceof Array) {
	this.unparsed = function() { return args.slice(0) };
    } else if (args) {
	this.unparsed = function() { return [ args ] };
    }
    var shared={};
    this.shared=function() {
	return shared;
    };
    return this;
}

/**
 * @param count The number of parameters to shift from the unparsed array to the parsed array.
 * @return A new command that inherits the receiver, but whose parsed() and
 * unparsed() functions are altered.
 */
Command.prototype.shift = function (count) {
    var parsedArgs = this.parsed();
    var unparsedArgs = this.unparsed();
    var shifted = new Command(this);
    parsedArgs.push(unparsedArgs.shift(count));
    shifted.unparsed = function() { return unparsedArgs; };
    shifted.parsed = function() { return parsedArgs; };
    return shifted;
}

exports.Command = Command;

