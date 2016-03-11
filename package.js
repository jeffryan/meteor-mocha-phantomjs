Package.describe({
  name: "dispatch:mocha-phantomjs",
  summary: "Run package or app tests with Mocha+PhantomJS and report all results in the server console",
  git: "https://github.com/dispatch/meteor-mocha-phantomjs.git",
  version: '0.0.1',
  testOnly: true,
});

Package.onUse(function (api) {
  api.versionsFrom('1.2.1');

  api.use('ecmascript');

  api.use([
    'tmeasday:check-npm-versions@0.1.1',
    'practicalmeteor:mocha-core@0.1.4'
  ], 'server');

  api.mainModule('client.js', 'client');
  api.mainModule('server.js', 'server');

  api.export('runTests', 'client');
});
