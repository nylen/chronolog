# chronolog [![Build status](https://img.shields.io/travis/nylen/chronolog.svg?style=flat)](https://travis-ci.org/nylen/chronolog) [![npm package](http://img.shields.io/npm/v/chronolog.svg?style=flat)](https://www.npmjs.org/package/chronolog)

This simple Node.js module provides an easy way to write logging messages
prefixed with the current date.

## Usage

First, require the module:

```js
var chronolog = require('chronolog');
```

It can format strings - `console.log(chronolog('test message'))` will print
something like:

```
[2014-11-03 Mon pm 10:50:58] test message
```

It can wrap the `console` object:

```js
var log = chronolog(console);

// These will all be prefixed with the current date
log('default message'); // same as log.log
log.log('log message');
log.info('info message');
log.error('error message');
log.warn('warn message');

// These will not be prefixed with the current date
console.log('this is not prefixed');
log.dir('this is not prefixed either');
```

It can wrap stream objects:

```js
chronolog(process.stdout);

// Now you can do this to write a message prefixed with the current date:
process.stdout.writeLine('test message');
```

The default date format is designed to be human-readable yet still sort well.
You can change the message or the date format (the date format uses
[Moment.js formatting placeholders](http://momentjs.com/docs/#/displaying/format/)
and the message format is passed to
[`util.format`](http://nodejs.org/api/util.html#util_util_format_format)):

```js
chronolog('test message', 'HH:mm:ss');
// returns '[22:50:58] test message'

var log = chronolog(console, 'HH:mm:ss');
// returns an object that writes messages with the given format

chronolog('test message', {
    date : 'HH:mm:ss',
    str  : '%s: %s'
});
// returns '22:50:58: test message'
```
