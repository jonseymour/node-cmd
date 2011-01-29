var CMD=require("cmd");

var dispatcher=CMD.createDispatcher({
	foo: function(cmd) {
	    var opt;
	    for (opt in cmd.options) {
		console.log("option " + opt + " = " + cmd.options[opt]);
	    }
	    console.log("shifted "+cmd.shifted().join(" "));
	    console.log("unshifted "+cmd.unshifted().join(" "));
	},
	_unhandled: function(cmd) {
	    console.log("unrecognized command: "+cmd.shifted().concat(cmd.unshifted()).join(" "));
	}
    });

dispatcher(process.argv.slice(2));