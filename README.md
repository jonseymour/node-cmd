Name
-----
	 cmd - a node.js API for building modular command line glue for node.js programs

Synopsis
--------
	 // import the module
	 var cmd=require("cmd"); // import the module

	 // create a dispatcher
	 var dispatcher=cmd.createDispatcher( { handler1: function() { ... }, handler2: function () { ... } } ); 

	 // pass a command to the dispatcher as an array
	 dispatcher([ "handler1", args ... ]);

	 // pass a command to the dispatcher as a list of arguments
	 dispatcher("handler1", args ... );

	 // pass a command to the dispatcher as a command instance.
	 dispatcher(cmd.createCommand("handler1", args ... ));

Description
-----------
cmd.createDispatcher() returns a dispatcher function that uses the specified dispatch table to route commands
to configured handler functions.

Commands can be presented to the dispatcher as:

* a list of arguments, where the first argument specifies a route selector 
* a single array, where the first element specifies a route selector
* an instance of cmd.Command created with cmd.createCommand()

Irrespective of how commands are presented to the dispatcher, commands are always presented to 1-argument handler functions as an instance of cmd.Command.

For example, assume the following declarations...

     var cmd=require("cmd"),
	     handler1 = function(aCmd) { ... },
	     handler2 = function(aCmd) { ... },
	     dispatchTable = {
		   switch1: handler1,
		   switch2: handler2
	     },
	     dispatcher = cmd.createDispatcher(dispatchTable),
	     arg1 = 'switch1',
	     arg2 = ...,
	     arg3 = ...;

	 var aCmd1 = cmd.createCommand([ arg1, arg2, arg3, ... ]);
	 var aCmd2 = cmd.createCommand(arg1, arg2, arg3, ...);

	 // The following statements are all equivalent ...

	 var
	     result1 = dispatcher(arg1, arg2, arg3, ... ),
	     result2 = dispatcher([ arg1, arg2, arg3, ...  ]),
	     result3 = dispatcher(aCmd1),
	     result4 = dispatcher(aCmd2);

Positional Arguments
--------------------
Handler functions can access an array of parsed arguments by invoking the command's parsed() function. 
As a general rule, these arguments will have already been consumed in the process of identifying the handler
to be invoked.

Handler functions may access the remaining unparsed arguments by invoking the command's unparsed()
function. As a general rule, these arguments have not been used for routing purposes and are usually
viewed as arguments to be parsed by the handler function itself or by handlers it delegates to.

In the example above, suppose that arg1 has the value 'switch1' so that dispatchTable[arg1] 
evaluates to handler1. handler1 will be invoked with its aCmd argument equal to 
cmd.createCommand([ arg1, arg2, arg3, ... ]).shift(1).

When handler1 is invoked, aCmd.parsed() will be equivalent to [ 'switch1' ] and	aCmd.unparsed() 
will be equivalent to [ arg2, arg3, ... ].

Optional Arguments
------------------
'cmd' does not currently offer any support for parsing optional arguments. However, the options
member variable is reserved for the purpose of passing options along a handler chain, if so required.

	 var aCmd = cmd.createCommand(positionalArgs);
	 cmd.options = {
	 	     // options parsed by some other means.
	 };

Shared state
------------
It is expected that commands may be passed along a chain of handlers. However, it is not
true that every handler along the instance will see exactly the same command instance. For example,
when nested command handlers are used, the handlers at different nesting level will see command
objects that have different implementations of the parsed() and unparsed() functions.

Handlers that need to share state may use the command's shared() function to obtain a reference
to the command's shared state object. It is up to handlers to choose an appropriate strategy
to avoid namespace conflicts that might arise between different handlers.

The Command.shift(n) operation
------------------------------
The shift operation creates a new Command in which the specified number of unparsed arguments
have been shifted from the LHS of result of unparsed() and into the RHS of parsed(). 

Note that the original command is unchanged by a shift operation. It also acts as a prototype
of the shifted command.

	var aCmd = cmd.createCommand("switch1", "switch2", "arg1");
	var shiftedCmd = aCmd.shift(1);

	aCmd.unparsed() == [ "switch1", "switch2", "arg1" ];
	aCmd.parsed() == [ ];

	shiftedCmd.unparsed() == [ "switch2", "arg1" ];
	shiftedCmd.parsed() == [ "switch1" ];

	aCmd !== shiftedCmd

	aCmd.shared() === shiftedCmd.shared();
	aCmd.options === shiftedCmd.options;

Nested Handlers
---------------
Handlers can be nested, thereby allowing the construction of modular command line processors where 
different sub modules of the program are responsible handling different subcommands. For example:

	 // someCmd.js
	 var cmd=require("cmd");

	 var fooDispatcher = cmd.createDispatcher({
	     echo: function(cmd) {
		   console.log("foo hears " + cmd.unparsed())
	     }
	 });
	 var barDispatcher = cmd.createDispatcher({
	     echo: function(cmd) {
		   console.log("bar hears " + cmd.unparsed())
	     }
	 });

	 var top = cmd.createDispatcher() {
	     "foo": fooDispatcher,
	     "bar": barDispatcher
	 };

	 top(process.argv.slice(2));

	 $ node someCmd.js foo echo boo
	 foo hears boo
	 $ node someCmd.js bar echo bah
	 bar hears bah

Other Examples
--------------
This example shows how the parsed() and unparsed() functions of a command can be used.

      // example.js
      var cmd=require("cmd");
      cmd.createDispatcher({
	 help: function() {
	       console.log("display this message");
	 },
	 showargs: function(aCmd) {
	       console.log("parsed: " + aCmd.parsed());
	       console.log("unparsed: " + aCmd.unparsed());
	 },
	 unhandled: function(aCmd) {
	       console.log("unrecognized command: " + aCmd.unparsed());
	 }
	 })(process.argv.slice(2));

	 $ node example.js help
	 display this message
	 $ node example.js showargs foo bar
	 cmd.parsed: showargs
	 cmd.unparsed: foo,bar
	 $ node example.js random foo bar
	 unrecognized command: [ "random", "foo", "bar" ]

Reserved Members
----------------
Unless otherwise specified, all members of Command instances are considered to be reserved for future use.

Clients of the 'cmd' API may alter the 'object' member of Command instances and may modify any member of the
object returned by shared(). Other modifications are not supported even if they may currently "work".

So:
	var aCmd = cmd.createCommand(...);

	aCmd.options.myOpt = ...; // OK - changing a member of .options is allowed
	aCmd.options = {}; // OK - replacing .options is allowed
	aCmd.shared().myShared = ...; // OK - putting something in aCmd.shared() is allowed

	aCmd.shared = new function() { ... }; // WRONG - alters the published API
	aCmd.myFunc = new function() { ... }; // WRONG - alters the reserved name space

Tests
-----
Tests for this package can be run by using npm to install expresso, then running:
      npm test cmd

API Stability
-------------
'cmd' is a work in progress as such, the details of the API may change over time. 

Unless otherwise noted, incompatible changes to the API will be marked by changes to the major version number. 
Features will generally be introduced with changes to the minor version number. Untagged commits should
be considered unstable and subject to change.

The stable parts of the API will be documented by tests in test/stable.js. The first release of a stable API will be the 0.1.0 release.

Experimental parts of the API will be documented by tests in test/experimental.js.

NOTE: I will probably rename parsed(),unparsed() to shifted(),unshifted() shortly.

Author
------
*	Jon Seymour: <https://github.com/jonseymour>

