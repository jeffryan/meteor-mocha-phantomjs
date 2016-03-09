import path from 'path';
import fs from 'fs';
import childProcess from 'child_process';
import phantomjs from 'phantomjs-prebuilt';

// We let the package user install whatever mocha version they want
// on the server. This will throw an error if they haven't done so.
import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';
checkNpmVersions({
  'mocha': '2.x.x'
});

const PHANTOMJS_SCRIPT_FILE_NAME = 'phantomjsScript.js';

// We can't use `import` here because it will be hoisted to before the `checkNpmVersions` call
const Mocha = require('mocha');

// Initialize a new `Mocha` test runner instance
const mainMocha = new Mocha();

// Use practicalmeteor:mocha-core to bind the Meteor environment and support
// synchronous server code.
Package['practicalmeteor:mocha-core'].setupGlobals(mainMocha);

// Since intermingling client and server log lines would be confusing,
// the idea here is to buffer all client logs until server tests have
// finished running and then dump the buffer to the screen and continue
// logging in real time after that if client tests are still running.
let serverTestsDone = false;
let clientLines = [];
function clientLogBuffer(line) {
  if (serverTestsDone) {
    console.log(line);
  } else {
    clientLines.push(line);
  }
}

function printHeader(type) {
  console.log('\n--------------------------------');
  console.log(`----- RUNNING ${type} TESTS -----`);
  console.log('--------------------------------\n');
}

let callCount = 0;
let clientFailures = 0;
let serverFailures = 0;
function exitIfDone(type, failures) {
  callCount++;
  if (type === 'client') {
    clientFailures = failures;
  } else {
    serverFailures = failures;
    serverTestsDone = true;
    printHeader('CLIENT');
    clientLines.forEach((line) => {
      console.log(line);
    });
  }

  if (callCount === 2) {
    console.log('All client and server tests finished!\n');
    console.log('--------------------------------');
    console.log(`SERVER FAILURES: ${serverFailures}`);
    console.log(`CLIENT FAILURES: ${clientFailures}`);
    console.log('--------------------------------');
    if (clientFailures + serverFailures > 0) {
      process.exit(2); // exit with non-zero status if there were failures
    } else {
      process.exit(0);
    }
  }
}

function startPhantom() {
  var scriptPath = Assets.absoluteFilePath(PHANTOMJS_SCRIPT_FILE_NAME);

  var phantomProcess = childProcess.execFile(phantomjs.path, [scriptPath], {
    env: {
      ROOT_URL: process.env.ROOT_URL,
    }
  });

  phantomProcess.on('error', function (error) {
    throw error;
  });

  phantomProcess.on('exit', function (code) {
    exitIfDone('client', code);
  });

  phantomProcess.stdout.on('data', function(data) {
    clientLogBuffer(data.toString());
  });

  phantomProcess.stderr.on('data', function(data) {
    clientLogBuffer(data.toString());
  });
}

// Prior to "startup", app tests will be parsed and loaded by Mocha
Meteor.startup(() => {
  Meteor.defer(() => {
    // Run the server tests
    printHeader('SERVER');

    mainMocha.run((failures) => {
      exitIfDone('server', failures);
    });

    // Simultaneously start phantom to run the client tests
    // XXX It would be nice to be able to detect whether there are any client
    // tests and skip the whole phantomjs thing if we can.
    startPhantom();
  });
});
