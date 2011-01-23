/**
 * (C) copyright Jon Seymour, 2011.
 */
var cmd=require("cmd"),
    assert=require("assert");

module.exports = {
    "test empty dispatcher, no handler" : function() {
	var dispatcher = cmd.createDispatcher();
	assert.throws(function() {
		dispatcher(["one"]);
	    });
    },
    "test empty dispatcher, no arguments" : function() {
	var dispatcher = cmd.createDispatcher();
	dispatcher();
    },
    "test empty dispatcher, arbitrary object" : function() {
	var dispatcher = cmd.createDispatcher();
	assert.throws(function() {
		dispatcher({});
	    });
    },
    "test non-empty dispatcher, valid handler" : function() {
	var dispatcher = cmd.createDispatcher({
		"method": function (cmd) {
		    cmd.shared().good = true;
		    return cmd;
		}
	    });
	var result = dispatcher("method");
	assert.isDefined(result);
	assert.isDefined(result.shared());
	assert.isDefined(result.shared().good);
	assert.eql(true, result.shared().good);
    },
    "test non-empty dispatcher, valid handler, two args" : function() {
	var dispatcher = cmd.createDispatcher({
		"method": function (cmd) {
		    cmd.shared().good = true;
		    cmd.shared().unshifted = cmd.unshifted();
		    return cmd;
		}
	    });
	var result = dispatcher("method", "arg");
	assert.isDefined(result);
	assert.isDefined(result.shared);
	assert.isDefined(result.shared());
	assert.isDefined(result.shared().good);
	assert.eql(true, result.shared().good);
	assert.eql(["arg"], result.shared().unshifted);
    },
    "test non-empty dispatcher, valid handler - via anonymous function" : function() {
	var dispatcher = cmd.createDispatcher({
		"method": function (cmd) {
		    cmd.shared().good = true;
		    return cmd;
		}
	    });
	var result = dispatcher("method");
	assert.isDefined(result);
	assert.isDefined(result.shared());
	assert.isDefined(result.shared().good);
	assert.eql(true, result.shared().good);
    },
    "test non-empty dispatcher, object key" : function() {
	var key={ "a": true  };
	var config={};
	config[key]=function(cmd) { return cmd; };
	var dispatcher = cmd.createDispatcher(config);
	var result = dispatcher({ "a": true });
	assert.isDefined(result);
	assert.type(result, "object");
	assert.type(result.shifted, "function");
	assert.isDefined(result.shifted()[0]);
	assert.eql(key, result.shifted()[0]);
    },
    "test nested dispatch" : function() {
	var dispatcher = cmd.createDispatcher({
		"outer": cmd.createDispatcher({
		    "inner": function(x) {
			return x.unshifted();
		    }})
	    });
	var result = dispatcher("outer", "inner", "args");
	assert.eql(["args"], result);
    }
};