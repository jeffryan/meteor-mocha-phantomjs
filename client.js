// It is safe to import from mocha here because we've already verified that
// it is installed in server.js. We need to import the "mocha.js" file specifically,
// though, because that is the browser entry point.
import 'mocha/mocha.js';

import browserConsoleReporter from './browserConsoleReporter';

let reporter;
if (process.env.CLIENT_TEST_REPORTER) {
  reporter = require(process.env.CLIENT_TEST_REPORTER);
} else {
  reporter = browserConsoleReporter;
}

// This defines "describe", "it", etc.
mocha.setup({
  ui: 'bdd',
  reporter,
});

// Run the client tests. Meteor calls the `runTests` function exported by
// the driver package on the client.
function runTests() {
  // These `window` properties are all used by the phantomjs script to
  // know what is happening.
  window.testsAreRunning = true;
  mocha.run((failures) => {
    window.testsAreRunning = false;
    window.testFailures = failures;
    window.testsDone = true;
  });
}

export { runTests };
