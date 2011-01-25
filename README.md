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
'cmd' provides an API for constructing modular command dispatchers. The intent is to allow the construction 
of command line utilities from collections of node.js modules some of which export a command
dispatcher to the 'cmd' dispatcher framework. 

For example, suppose that a utility called "tool" contains two sub-modules "foo" and "bar". Each of "foo" and "bar" expose a set of commands to the command line. The user might invoke functions of "foo" and "bar" like so:

    $ tool foo list
    $ tool bar add file

'cmd' can support this with registrations of the form:

      var cmd=require("cmd");

      // in bar.js
      export.dispatcher = cmd.createDispatcher({ 
      	"add": function(aCmd) { ... } 
      });

      // in foo.js
      export.dispatcher = cmd.createDispatcher({ 
      	"list": function(aCmd) { ... } 
      });

      // tool.js

      var foo=require("./foo");
      var bar=require("./bar");

      var toolDispatcher = cmd.createDispatcher({
      	  "foo": foo.dispatcher,
      	  "bar": bar.dispatcher
      });

      // to invoke the dispatcher

      toolDispatcher(process.argv.slice(2)); 

Commands can be presented to the dispatcher as:

* an instance of cmd.Command created with cmd.createCommand() 
* a single array
* a list of arguments

Irrespective of how commands are presented to the dispatcher, commands are always presented to 1-argument handler functions as an instance of cmd.Command. By convention, dispatchers use the first argument of Command.unshifted() to
select a handler from their dispatch tables.

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
Handler functions can access an array of parsed arguments by invoking the command's shifted() function. 
As a general rule, shifted arguments will have already been consumed in the process of identifying 
the handler to be invoked.

Handler functions may access the remaining unparsed arguments by invoking the command's unshifted()
function. As a general rule, these arguments have not been used for routing purposes and are usually
viewed as arguments to be parsed by the handler function itself or by handlers it delegates to.

In the example above, suppose that arg1 has the value 'switch1' so that dispatchTable[arg1] 
evaluates to handler1. handler1 will be invoked with its aCmd argument equal to 
cmd.createCommand([ arg1, arg2, arg3, ... ]).shift(1).

When handler1 is invoked, aCmd.shifted() will be equivalent to [ 'switch1' ] and	aCmd.unshifted() 
will be equivalent to [ arg2, arg3, ... ].

Optional Arguments
------------------
'cmd' does not currently offer any support for parsing optional arguments. However, the options
member variable of a Command is reserved for the purpose of passing options along a 
handler chain, if so required.

	 var aCmd = cmd.createCommand(positionalArgs);
	 aCmd.options = {
	 	     // options parsed by some other means.
	 };

Shared state
------------
Handlers that need to share state may use the command's shared() function to obtain a reference
to the command's shared state object. It is up to handlers to choose an appropriate strategy
to avoid namespace conflicts that might arise between different handlers.

The Command.shift(n) operation
------------------------------
The shift operation creates a new Command in which the specified number of unparsed arguments
have been shifted from the LHS of result of unshifted() and into the RHS of shifted(). 

Note that the original command is unchanged by a shift operation. It also acts as a prototype
of the shifted command.

	var aCmd = cmd.createCommand("switch1", "switch2", "arg1");
	var shiftedCmd = aCmd.shift(1);

	aCmd.unshifted() == [ "switch1", "switch2", "arg1" ];
	aCmd.shifted() == [ ];

	shiftedCmd.unshifted() == [ "switch2", "arg1" ];
	shiftedCmd.shifted() == [ "switch1" ];

	aCmd !== shiftedCmd

	aCmd.shared() === shiftedCmd.shared();
	aCmd.options === shiftedCmd.options;

Configuring The Dispatcher
--------------------------
The configuration object passed to cmd.createDispatcher() is used to populate the dispatch,
or lookup, table used by the generated dispatcher.

In addition, the configuration object can be used to provide alternative implemntations 
of key tactics used by the dispatcher's dispatching strategy. In particular:

_parse(arguments) -> Command
----------------------------
_parse is used to convert the arguments presented to the dispatcher into a Command.
The function is not called if the dispatcher is called with a single argument which is already
an instance of Command.

The default implementation creates a new command with cmd.createCommand() which exposes the 
position arguments via the result of its unshifted() function.

TODO: add support for parsing option switches of the form -fLaGs or --word.

_select(Command cmd) -> aThunk()
----------------------------
This function creates a thunk which will call a function to handle the specified command.
The default implementation will call the handler function looked up using the first unshifted
argument and the result of cmd.shift(1), if there is one or _unhandled with the specified
command otherwise.

_unhandled(Command cmd) -> Object
---------------------------------
This is the function that is called by the thunk created by _select() in the case that
_select is not able to find a more specific handler for the specified command. 
The default implementation of _unhandled throws an Error if there are 
any unshifted arguments or silently returns the specified Command otherwise.

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

The configuration object passed to createDispatcher should not have members that are prefixed with _ 
unless the intent is to override default behaviours of the generated dispatcher.

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

Changes
-------
* changed name of Command.unparsed to Command.unshifted
* changed name of Command.parsed to Command.shifted

TODO
----
* add configurable support for parsing an options array.
* document required semantics for handler implementations
* document special purpose of the unhandled handler
* change dispatcher implementation so the table is its own artifact.
* add support for dispatcher chaining

Author
------
*	Jon Seymour: <https://github.com/jonseymour>

