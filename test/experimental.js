/**
 * (C) cmd - Copyright Jon Seymour, 2001
 */

/**
 * This test will document proposed behaviour of the API. 
 *
 * Any behaviours documented by this file are subject to change without notice.
 */

var cmd=require("cmd"),
    assert=require("assert");

module.exports = {
    "createDispatcher exists": function() {
	assert.isDefined(cmd.createDispatcher);
    },
    "createCommand exists": function() {
	assert.isDefined(cmd.createCommand);
    },
    "Command exists and is a constructor": function() {
	assert.isDefined(cmd.Command);
	assert.type(cmd.Command, "function");
    },
    "createCommand() yields an instanceof Command with no unparsed arguments": function() {
	var result=cmd.createCommand();
	assert.isDefined(result);
	assert.eql(true, result instanceof cmd.Command);
	assert.length(result.unparsed(), 0);
	assert.length(result.parsed(), 0);
    }
}