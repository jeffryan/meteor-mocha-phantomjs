Package.describe({
  name: "dispatch:mocha-phantomjs",
  summary: "Run package or app tests with Mocha+PhantomJS and report all results in the server console",
  git: "https://github.com/dispatch/meteor-mocha-phantomjs.git",
  version: '0.0.5',
  testOnly: true,
});

Npm.depends({
  mocha: '2.4.5',
});

Package.onUse(function (api) {
  api.versionsFrom('1.2.1');

  api.use('ecmascript');

  api.use([
    'practicalmeteor:mocha-core@0.1.4',
    'dispatch:phantomjs-tests@0.0.4',
  ], 'server');

  api.mainModule('client.js', 'client');
  api.mainModule('server.js', 'server');

  api.export('runTests', 'client');
});
