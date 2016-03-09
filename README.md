# dispatch:mocha

A Mocha test driver package for Meteor 1.3. This package reports server and client results in the server console and can be used for running tests on a CI server. This achieves what `spacejam` does but without the need for a separate Node package.

## Installation

In a Meteor 1.3+ app directory:

```bash
npm i --save-dev mocha
meteor add dispatch:mocha
```

## Run app tests

```bash
meteor test --once --driver-package dispatch:mocha
```
