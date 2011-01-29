/**
 * (C) cmd - Copyright Jon Seymour, 2001
 */

/**
 * This test will document proposed behaviour of the API.
 *
 * Any behaviours documented by this file are subject to change without notice.
 */

var CMD=require("cmd"),
    assert=require("assert"),
    DISPATCHER=CMD.createDispatcher({
		foo : function(cmd) {
		    return {
			subject: this,
			arguments: arguments,
			cmd: cmd
		    };
	        },
		bar : function(cmd) {
		    return {
			subject: this,
			arguments: arguments,
			cmd: cmd
		    };
	        },
		_unhandled : function(cmd) {
		    return {
			subject: this,
			arguments: arguments,
			cmd: cmd
		    };
		},
	});

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

function assertEmptyCommand(cmd) {
    assert.eql(cmd.options, {});
    assert.eql(cmd.unshifted(), []);
    assert.eql(cmd.shifted(), []);
    assert.eql(cmd.shared(), {});
}

function assertExpectedResult(expected, dispatcher, result) {
    assert.isDefined(dispatcher);
    assert.type(dispatcher, "function");
    assertCommandInvariant(result.cmd);
    assert.equal(dispatcher, result.subject.api);
    assert.length(result.arguments, 1);
    assert.equal(result.cmd, result.arguments[0]);
    assert.eql(expected.shifted, result.cmd.shifted());
    assert.eql(expected.unshifted, result.cmd.unshifted());
    assert.eql(expected.options, result.cmd.options);
}

function test(input, expected) {
    var result = DISPATCHER(input);
    assertExpectedResult(expected, DISPATCHER, result);
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
	assertEmptyCommand(aCmd);
    },
    "createDispatcher() yields a function": function() {
	var dispatcher=CMD.createDispatcher({ });
	assert.isDefined(dispatcher);
	assert.type(dispatcher, "function");
    },
    "createDispatcher() yields a function - unhandled": function() {
	var dispatcher=CMD.createDispatcher({
		_unhandled : function(cmd) {
		    return [ this,cmd ];
		}
	    });
	assert.isDefined(dispatcher);
	assert.type(dispatcher, "function");
	var result = dispatcher();
	assertCommandInvariant(result[1]);
	assertEmptyCommand(result[1]);
	assert.equal(dispatcher, result[0].api);
    },
    "test dispatch: <empty>": function() {
	test([], {
		 shifted: [ ],
		 unshifted: [],
		 options: {}
	     });
    },
    "test dispatch: foo": function() {
	test(["foo"], {
		 shifted: [ "foo" ],
		 unshifted: [],
		 options: {}
	     });
    },
    "test dispatch: foo bar": function() {
	test(["foo", "bar"], {
		 shifted: [ "foo" ],
		 unshifted: [ "bar" ],
		 options: {}
	     });
    },
    "test dispatch: baz": function() {
	test(["baz"], {
		 shifted: [ ],
		 unshifted: [ "baz" ],
		 options: {}
	     });
    },
    "test dispatch: -x": function() {
	test(["-x"], {
		 shifted: [ "-x" ],
		 unshifted: [ ],
		 options: { x: true }
	     });
    },
    "test dispatch: -xYz": function() {
	test(["-xYz"], {
		 shifted: [ "-xYz" ],
		 unshifted: [ ],
		 options: { x: true, Y:true, z:true }
	     });
    },
    "test dispatch: --name": function() {
	test(["--name"], {
		 shifted: [ "--name" ],
		 unshifted: [ ],
		 options: { name: "" }
	     });
    },
    "test dispatch: --name=": function() {
	test(["--name="], {
		 shifted: [ "--name=" ],
		 unshifted: [ ],
		 options: { name: "" }
	     });
    },
    "test dispatch: --name=value": function() {
	test(["--name=value"], {
		 shifted: [ "--name=value" ],
		 unshifted: [ ],
		 options: { name: "value" }
	     });
    },
    "test dispatch: --": function() {
	test(["--"], {
		 shifted: [ "--" ],
		 unshifted: [ ],
		 options: { }
	     });
    },
    "test dispatch: -x -- -y": function() {
	test(["-x", "--", "-y"], {
		shifted: [ "-x", "--" ],
		unshifted: [ "-y" ],
		options: { x: true }
	     });
    },
    "test dispatch: --twice=foo --twice=bar": function() {
	test(["--twice=foo", "--twice=bar"], {
		shifted: [ "--twice=foo", "--twice=bar" ],
		unshifted: [ ],
		options: { twice: "bar" }
	     });
    }
}