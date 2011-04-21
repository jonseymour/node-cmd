Name
=====
         cmd - a node.js API for building modular command line glue for node.js programs

Synopsis
========
         // import the module
         var cmd=require("cmd"); // import the module

         // create a dispatcher
         var dispatcher=cmd.use( { handler1: function() { ... }, handler2: function () { ... } } );

         // pass a command to the dispatcher as an array
         dispatcher([ "handler1", args ... ]);

         // pass a command to the dispatcher as a list of arguments
         dispatcher("handler1", args ... );

         // pass a command to the dispatcher as a command instance.
         dispatcher(cmd.createCommand("handler1", args ... ));

Description
===========
'cmd' provides an API for constructing modular command dispatchers. The intent is to allow the construction
of command line utilities from collections of node.js modules some of which export a command
dispatcher to the 'cmd' dispatcher framework.

For example, suppose that a utility called "tool" contains two sub-modules "foo" and "bar". Each of "foo" and "bar" expose a set of commands to the command line. The user might invoke functions of "foo" and "bar" like so:

    $ tool foo list
    $ tool bar add file

'cmd' can support this with registrations of the form:

      var cmd=require("cmd");

      // in bar.js
      exports.dispatcher = cmd.use({
        "add": function(aCmd) { ... }
      });

      // in foo.js
      exports.dispatcher = cmd.use({
        "list": function(aCmd) { ... }
      });

      // tool.js

      var foo=require("./foo");
      var bar=require("./bar");

      var toolDispatcher = cmd.use({
          "foo": foo.dispatcher,
          "bar": bar.dispatcher
      });

      // to invoke the dispatcher

      toolDispatcher(process.argv.slice(2));

Commands can be presented to the dispatcher as:

* an instance of cmd.Command created with cmd.createCommand()
* a single array
* a list of arguments

Irrespective of how commands are presented to the dispatcher, commands are always presented to 1-argument
handler functions as an instance of cmd.Command. By convention, dispatchers use the first argument
of Command.unshifted() to select a handler from their dispatch tables.

For example, assume the following declarations...

     var cmd=require("cmd"),
             handler1 = function(aCmd) { ... },
             handler2 = function(aCmd) { ... },
             dispatchTable = {
                   switch1: handler1,
                   switch2: handler2
             },
             dispatcher = cmd.use(dispatchTable),
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

Configuring The Dispatcher
==========================
The configuration object passed to cmd.use() is used to populate the dispatch
table used by the generated dispatcher.

In addition, the configuration object can be used to provide alternative implemntations
of the strategy &/or key tactics used by the dispatcher's default strategy. In particular:

_strategy(arguments) -> Object
------------------------------
_strategy implements the dispatcher's default dispatching strategy.

The default implementation checks to see if the arguments contain exactly one Command. If not,
the _parse function is called to convert the arguments into a Command. The _select function
is then called to create a thunk that will then further handle the command. The thunk is then invoked
and the result of the thunk, if any, is returned to the caller.

_parse(arguments) -> Command
----------------------------
_parse is used to convert the arguments presented to the dispatcher into a Command instance.
The function is not called if the dispatcher is called with a single argument which is already
an instance of Command.

The default implementation creates a new command with cmd.createCommand() which exposes the
positional arguments via its unshifted() function. Any arguments containing option switches or
flags are used to populate the options object and set the shifted() array.

_select(Command cmd) -> aThunk()
--------------------------------
This function returns a thunk which encapsulates a function and the command to be passed to
the function when the thunk is invoked. The default implementation of _select creates a
thunk in which the encapsulated command is the result of calling shift(1) on the specified
command and the encapsulated function is the result of looking up the dispatch table with
unshifted()[0] of the specified command. If lookup fails, the returned thunk will
encapsulate the dispatcher's _unhandled function and the specified command.

_unhandled(Command cmd) -> Object
---------------------------------
This is the function that is called by the thunk created by _select() in the case that
_select is not able to find a more specific handler for the specified command.
The default implementation of _unhandled throws an Error if there are
any unshifted arguments or silently returns the specified Command otherwise.

Handler Functions
=================
Handler functions are invoked by the dispatcher. The first and only argument passed to
a handler function is the command to be processed.

The this reference
------------------
During the execution of a handler function, the this reference refers to the dispatcher that invoked the handler.
The dispatcher has one function member for each entry in its dispatcher table, including the
default _strategy, _parse, _select and _unhandled functions. It also has a function
member, api, which is function that represents the public interface of the dispatcher.

Optional Arguments
------------------
The default parser sets a property in the command's options object for each argument of the form --name[=value].
If a value is not specified, then the value defaults to the empty string (""). Additionally, one property of
the command's option object is set to true for every character in an argument that starts with a single hyphen.
A single argument of -- can be used to suspend interpretation of leading hypens in all following arguments.

Unshifted Positional Arguments
------------------------------
Handler functions may access the unshifted positional arguments of the command by invoking the command's unshifted()
function which returns an array. As a general rule, these arguments have not been used for routing purposes
and are usually viewed as arguments to be parsed by the handler function itself or by functions it delegates to.

Shifted Arguments
-----------------
Handler functions may access an array of optional arguments and all previously shifted positional arguments
using the command's shifted() function which returns an array. As a general rule, shifted arguments
will have already been consumed in the process of routing the command via chain of one or more dispatchers.
In particular, the last element of the shifted() array will usually contain the selector used by the current
dispatcher to look up the current handler function.

The Command.shift(n) operation
------------------------------
Handler functions that themselves act as dispatchers can use the Command.shift() operation on the
specified command to create a new command in which N arguments have been shifted from the unshifted()
array into the shifted() array (with respect to the specified command).

Shared state
------------
Handlers that need to share state may use the command's shared() function to obtain a reference
to the command's shared state object. It is up to handlers to choose an appropriate strategy
to avoid namespace conflicts that might arise between different handlers.

Reserved Members
================
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

The configuration object passed to use should not have members that are prefixed with _
unless the intent is to override default behaviours of the generated dispatcher.

Tests
=====
Tests for this package can be run by using npm to install expresso, then running:
      npm test cmd

API Stability
=============
'cmd' is a work in progress as such, the details of the API may change over time.

Unless otherwise noted, incompatible changes to the API will be marked by changes to the major version number.
Features will generally be introduced with changes to the minor version number. Untagged commits should
be considered unstable and subject to change.

The stable parts of the API will be documented by tests in test/stable.js. The first release of a stable API will be the 0.1.0 release.

Experimental parts of the API will be documented by tests in test/experimental.js.

Changes
=======
<dl>
<dt>v0.0.4</dt>
<dd>
<ul>
<li>deprecated createDispatcher in favour of use</li>
<li>add support for --console-to-stderr, via idiomatic-stdio</li>
</ul>
</dd>
<dt>earlier releases</dt>
<dd>
<ul>
<li>changed name of Command.unparsed to Command.unshifted</li>
<li>changed name of Command.parsed to Command.shifted</li>
</dd>
</dl>

TODO
====
* add support for dispatcher chaining

Author
======
*       Jon Seymour: <https://github.com/jonseymour>

