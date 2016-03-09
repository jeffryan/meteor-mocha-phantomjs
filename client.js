// XXX The npm module isn't working correctly on client so
// we copy in mocha directly for now.
import './mocha';

import browserConsoleReporter from './browserConsoleReporter';

// This defines "describe", "it", etc.
mocha.setup({
  ui: 'bdd',
  reporter: browserConsoleReporter,
});

// Run the client tests. Meteor calls the `runTests` function exported by
// the driver package on the client.
function runTests() {
  // These `window` properties are all used by the phantomjs script to
  // know what is happening.
  window.mochaIsRunning = true;
  mocha.run((failures) => {
    window.mochaIsRunning = false;
    window.mochaTestFailures = failures;
    window.mochaTestsDone = true;
  });
}

export { runTests };
