export default class browserConsoleReporter {
  constructor(runner) {
    const stats = {
      total: runner.total,
      suites: 0,
      tests: 0,
      passes: 0,
      pending: 0,
      failures: 0,
    };

    runner.stats = stats;

    runner.on('start', () => {
      stats.start = new Date();
    });

    runner.on('suite', (suite) => {
      if (!suite.root) stats.suites++;
      console.log(suite.fullTitle());
    });

    runner.on('test', (test) => {
      console.log('RUNNING', test.title);
    });

    runner.on('pass', () => {
      stats.passes++;
    });

    runner.on('fail', (test, error) => {
      stats.failures++;
      test.err = error;
    });

    runner.on('pending', () => {
      stats.pending++;
    });

    runner.on('test end', (test) => {
      stats.tests++;
      let state = test.state;
      if (test.pending) state = 'pending';
      console.log(`    RESULT: ${state}`);
      if (state === 'failed' && test.err) {
        console.log(`      ${test.err.message}`);
      }
      console.log('');
    });

    runner.on('end', () => {
      stats.end = new Date();
      stats.duration = stats.end - stats.start;
      console.log(`Passed: ${runner.stats.passes || 0}  Failed: ${runner.stats.failures || 0}  Total: ${runner.total || 0}`);
    });
  }
}
