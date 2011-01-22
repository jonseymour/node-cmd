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
	 dispatcher(new cmd.Command("handler1", args ... ));

 Description
 -----------
 cmd.createDispatcher() returns a dispatcher function that uses the specified dispatch table to route commands
 to configured handler functions.

 Commands can be presented to the dispatcher as:
	  * a list of arguments, where the first argument specifies a route selector 
	  * a single array, where the first element specifies a route selector
	  * an instance of cmd.Command created with new cmd.Command()

 Irrespective of how commands are presented to the dispatcher, commands are always presented to 1-argument handler functions as an instance of cmd.Command.

 Handler functions may access the remaining unparsed arguments by invoking the command's unparsed()
 function. This function returns the arguments that have not been used for routing purposes. 
 As a general rule, these arguments have not been used for routing purposes.

 Handler functions can access an array of parsed arguments by invoking the command's parsed() function. 
 As a general rule, these arguments will have been used for routing purposes.

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

	 var aCmd1 = new cmd.Command([ arg1, arg2, arg3, ... ]);
	 var aCmd2 = new cmd.Command(arg1, arg2, arg3, ...);

	 // The following statements are all equivalent ...

	 var
	     result1 = dispatcher(arg1, arg2, arg3, ... ),
	     result2 = dispatcher([ arg1, arg2, arg3, ...  ]),
	     result3 = dispatcher(aCmd1),
	     result4 = dispatcher(aCmd2);

 Suppose that arg1 has the value 'switch1' so that dispatchTable[arg1] evaluates to handler1. handler1
 will be invoked with aCmd equal to new cmd.Command([ arg1, arg2, arg3, ... ]).shift(1).

 When handler1 is invoked, aCmd.parsed() will be equivalent to [ 'switch1' ] and	aCmd.unparsed() 
 will be equivalent to [ arg2, arg3, ... ].

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
	 foo hears [ "boo" ]
	 $ node someCmd.js bar echo bah
	 bar hears [ "bah" ]

 Shared state
 ------------
 It is expected that commands may be passed a long a chain of handlers. However, it is not
 true that every handler along the instance will see exactly the same command instance. For example,
 when nested command handlers are used, the handlers at different nesting level will see command
 objects that have different implementations of the parsed() and unparsed() functions.

 Handlers that need to share state may use the command's shared() function to obtain a reference
 to the command's shared state object. It is up to handlers to choose an appropriate strategy
 to avoid namespace conflicts that might arise between different handlers.

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
	 cmd.parsed: [ "showargs" ]
	 cmd.unparsed: [ "foo", "bar" ]
	 $ node example.js random foo bar
	 unrecognized command: [ "random", "foo", "bar" ]

Author
------
*	Jon Seymour: <https://github.com/jonseymour>

