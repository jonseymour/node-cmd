/**
 * (C) cmd - Copyright Jon Seymour, 2001
 */

/**
 * This test will document proposed behaviour of the API. 
 *
 * Any behaviours documented by this file are subject to change without notice.
 */

var CMD=require("cmd"),
    assert=require("assert");

function assertCommandInvariant(aCmd) {
    assert.isDefined(aCmd);
    assert.eql(true, aCmd instanceof CMD.Command);

    assert.type(aCmd.unshifted, "function");
    assert.type(aCmd.shifted, "function");
    assert.type(aCmd.shift, "function");
    assert.type(aCmd.shared, "function");

    assert.isDefined(aCmd.unshifted());
    assert.isDefined(aCmd.shifted());
    assert.isDefined(aCmd.shared());

    assert.type(aCmd.options, "object");

}

module.exports = {
    "createDispatcher exists": function() {
	assert.isDefined(CMD.createDispatcher);
    },
    "createCommand exists": function() {
	assert.isDefined(CMD.createCommand);
    },
    "Command exists and is a constructor": function() {
	assert.isDefined(CMD.Command);
	assert.type(CMD.Command, "function");
    },
    "createCommand() yields an instanceof Command with no unshifted arguments": function() {

	var aCmd=CMD.createCommand();

	assertCommandInvariant(aCmd);

	assert.eql(aCmd.options, {});

	assert.eql(aCmd.unshifted(), []);
	assert.eql(aCmd.shifted(), []);
	assert.eql(aCmd.shared(), {});
    }
}