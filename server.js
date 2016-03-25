import Mocha from 'mocha';
import { startPhantom } from 'meteor/dispatch:phantomjs-tests';

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

// Before Meteor calls the `start` function, app tests will be parsed and loaded by Mocha
function start() {
  // Run the server tests
  printHeader('SERVER');

  mainMocha.run((failureCount) => {
    exitIfDone('server', failureCount);
  });

  // Simultaneously start phantom to run the client tests
  // XXX It would be nice to be able to detect whether there are any client
  // tests and skip the whole phantomjs thing if we can.
  startPhantom({
    stdout(data) {
      clientLogBuffer(data.toString());
    },
    stderr(data) {
      clientLogBuffer(data.toString());
    },
    done(failureCount) {
      exitIfDone('client', failureCount);
    },
  });
}

export { start };
