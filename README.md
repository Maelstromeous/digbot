If you need help ask in the dev channel in the DIG discord. Please note this readme requires updating and information may be outdated.

# Installing Docker

See the [Docker readme](docker/README.md) file for setting up your local development environment.

# Using local installs of Node

We **HIGHLY** recommend the use of Docker in order to run DIGBot. This will ensure that we **all** have the correct versions of Node.

# Your local config files

You need a file at config/envConfig.js, this should be git Ignored

Example file:
```
(function() {
    module.exports = {
        environment: 'development', // development is your local environment
        apiKey: 'Your API key',
        showPerfStats: true,
        token: 'Your primary bot\'s token',
        youtubeKey: 'Your youtube API key',
        subBots: {
            bot2: {
                booted: false,
                busy: false, // booted and busy always false in your env file
                id: 'your sub bot\'s discord user id',
                token: 'Your first sub bot\'s token'
            },
            bot3: {
                etc...
            },
        }
    }
}());
```

You will also need to copy either the staging or production folder under the config folder to craete a development folder. Alter the files in your config/development folder to suit your local discord test server.

# Code style Guide

### Control structures

```
// Functions
function {
    ...
}

// IF statements
if (! <expression>) {
    ...
} else if (<expression>) {
    ...
} else {
    ...
}

// For loops
for (let count = 0; count > <something>; count++) {
    ...
}

// While loops
while (something !== something) {
    ...
}

```
### Module variables declarations

```
"use strict";

const someVar = something;
let someGlobalVar = something;

modules.exports = {
    someFunction: function () {
        ...
    },
    someOtherFunction: someNonModularFunction // Pointing to a normal function
}

function someNonModularFunction {
    ...
}

```
### Module organization

- Comply with Atom JSLinter and JSCS plugins. Added the .jscsrc file to master so it can be consistent across all developers.
- Leave a summary comment at the top of each module explaining its purpose
- Sort functions alphabetically unless using getter and setter functions, example:
```
getSomething()
setSomething()

getSomethingElse()
setSomethingElse()
```
- If the purpose of a function is not immediately apparent leave a short comment
- Ensure promise resolutions/rejections are handled
- Embed promise structures, see code for examples

### Module testing

For testing this codebase uses Chai and Sinon with Mocha as runner. Mocha
allows organisation of tests by means of describing testable code blocks and
tests that needs passing. Most tests use the `should` variant of Chai, with
`expect` in case the returned value is a null variant (null, undefined).

Sinon stubs certain classes in order to perform full integration tests. For
example `bot.js` uses stubs of the `discord.js` framework to tap into results
of messages outputted by the bot.

The main strategy of testing is unit tests for all classes, simply validating
properties exist and functions return expected outputs for a given set of
inputs. For example, `server.js` is independent of any other code and is fully
testable using Chai. To test code interacting with `discord.js` a full test is
defined in `bot.js`. This method injects messages to excitate code paths.

`bot.js` is also the only file creating dummy messages for testing. Other
modules should not test by means of creating discord calls.

#### Test structures

The following example illustrates what a testing module may look like, and validates
methods by checking the availability and execution results.

Try to test all possible situations the module may encounter. And break up these situations into
several different tests.

```
// File path: test/src/commands/commands.js (mirror the project directory, test folder = project folder)
// Example module to test commands.js

/* Define the styles the test is using (most of the time this will only be 'should'),
in most instances these requirements aren't technically needed but it's useful to
see what tests are actually being used*/
const assert = require('chai').assert;
const expect = require('chai').expect;
const should = require('chai').should();
const sinon = require('sinon');

// File under inspection (tested unit) and dependencies
const commands = require('../../src/commands/commands.js');

// Defined use case for command calls, all tests in this block
describe('commands/commands.js', function() {
    /* If global variables need to be declared, declare them outside of the 'it' tests, but inside of the
    'describe' block, all code outside of 'it' tests regardless of positioning in the module will run before
    mocha starts to execute the tests*/

    // Individual tests, split tests up to provide a better check for where problems lie
    it('should have function gif', function() {
        cats.should.have.property('gif');
        cats.gif.should.be.a('function');
    });

    it('GIF should be a promise', function() {
        gifPromise.should.be.a('promise');
    });

    it('GIF should return promise', function(done) {
        this.timeout(10000);
        gifPromise.then(
            function(result) {
                console.log('Cats GIF Result:', result);
                result.should.be.fulfilled;
                done();
            }
        );
    });

    // Test as many cases as possible, here we're iterating through all possibilities
    it('check should identify commands', function() {
        // Control input
        commands.check('!ping').should.be.true;
        // Test all on file
        for (var x in commands.all) {
            commands.check(commands.all[x]).should.be.true;
        }
        commands.check('!thisisnotarealcommand!').should.be.false;
    });

    // Asynchronous test example taken from cats.js (test ended by the callback: done)
    it('GIF should return promise', function(done) {
        this.timeout(10000);
        gifPromise.then(
            function(result) {
                console.log('Cats GIF Result:', result);
                result.should.be.fulfilled;
                done();
            }
        );
    });
});

```

### Resources on JS conventions

http://javascript.crockford.com/code.html

# Development flow

## Environments

There are 3 types of environments used in this project:
1. Development - This is your local environment, it will run on your personal discord test server.
2. Staging - This is the project's test environment, all changes to live will flow through this branch. This branch will be run by the project server on a test discord server.
3. Production - This is the live environment. It is ran by the project server on our live discord server.

## Branches

The project utilizes 4 types of branches:
1. Feature Branches (names will vary) - These are the branches you will use when working on issues. Once you are happy you have completed your issue you can PR it into the project development branch.

2. Project Development Branch (named: develop) - This branch is for testing new versions of the project locally, it may host many different changes at once. Major changes such as features and refactors should be PR'd to this branch, however hotfixes on these features may be directly pushed.

3. Project Staging Branch (named: staging) - This branch will be used to run versions of the project on our project's test server. Once a new version of the project is completed on the project development branch it will be PR'd to this branch. Direct commits to this branch are permitted however it should only be for hotfixes that need to be pushed to production

4. Project Production Branch (named: master) - This is the live branch that will be ran on our live discord server, any changes should be PR'd from staging. All major changes should go through the development process. Direct pushes are not permitted to this branch, however if hotfixes are required they can be pushed directly to staging then PR'd in.
