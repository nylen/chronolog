var mocha  = require('mocha'),
    moment = require('moment'),
    must   = require('must'),
    rewire = require('rewire'),
    util   = require('util');

var chronolog = rewire('../index');

chronolog.__set__('moment', function() {
    return moment(1415055058209).utc();
});

function prefixWithDateStr(msg, dateStr) {
    return util.format(
        '[%s] %s',
        dateStr || '2014-11-03 Mon pm 10:50:58',
        msg);
}

function wrapProcessStreams(test) {
    var streams = ['stdout', 'stderr'];

    function before() {
        streams.forEach(function(s) {
            process[s]._origWrite = process[s].write;
            process[s]._output = [];
            process[s].write = function(msg) {
                process[s]._output.push(msg);
            };
        });
    }

    function after() {
        streams.forEach(function(s) {
            process[s].write = process[s]._origWrite;
        });
    }

    var err = null;

    before();
    try {
        test();
    } catch (e) {
        err = e;
    }
    after();
    if (err) throw err;
}

describe('chronolog', function() {
    it('formats strings', function() {
        wrapProcessStreams(function() {
            chronolog('test message').must.equal(
                prefixWithDateStr('test message'));
        });
    });

    it('mangles console objects', function() {
        wrapProcessStreams(function() {
            var log = chronolog(console);
            log('default message');
            log.log('log message');
            log.info('info message');
            log.error('error message');
            log.warn('warn message');
            console.log('this is not prefixed');
            log.dir('this is not prefixed either');
        });
        process.stdout._output.must.eql([
            prefixWithDateStr('default message\n'),
            prefixWithDateStr('log message\n'),
            prefixWithDateStr('info message\n'),
            "this is not prefixed\n",
            "'this is not prefixed either'\n"
        ]);
        process.stderr._output.must.eql([
            prefixWithDateStr('error message\n'),
            prefixWithDateStr('warn message\n')
        ]);
    });

    it('mangles stream objects', function() {
        wrapProcessStreams(function() {
            var stdout = chronolog(process.stdout);
            stdout.writeLine('test');
        });
    });

    it('accepts custom formats', function() {
        chronolog('test message', 'YYYY').must.equal(
            prefixWithDateStr('test message', '2014'));
        wrapProcessStreams(function() {
            var stdout = chronolog(process.stdout, { date : 'YYYY-MM', msg : '%s: %s' });
            stdout.writeLine('test');
        });
        process.stdout._output.must.eql([
            '2014-11: test\n'
        ]);
    });

    it('throws for other objects', function() {
        (function() {
            var log = chronolog({});
        }).must.throw("I don't know what to do with this: {}");
    });
});
