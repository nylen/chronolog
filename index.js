var moment = require('moment'),
    util   = require('util');

module.exports = exports = function(obj, formats) {
    if (formats) {
        if (typeof formats == 'string') {
            formats = { date : formats };
        }
        for (var k in exports.formats) {
            if (!formats[k]) {
                formats[k] = exports.formats[k];
            }
        }
    } else {
        formats = exports.formats;
    }

    if (typeof obj == 'string') {
        // Just format the message
        return exports.format(obj, formats);

    } else if (typeof obj.Console == 'function' || obj === console) {
        // This is probably a console-like object; extend log/info/error/warn methods
        // Node v0.8 doesn't have console.Console
        var newObj = function() {
            return newObj.log.apply(newObj, arguments);
        };
        Object.keys(obj).forEach(function(k) {
            switch (k) {
                case 'log':
                case 'info':
                case 'error':
                case 'warn':
                    if (typeof obj[k] == 'function') {
                        newObj[k] = function() {
                            return obj[k](exports.format(
                                util.format.apply(null, arguments),
                                formats));
                        };
                        return;
                    }
            }

            // If we get here, we haven't assigned this key yet
            newObj[k] = obj[k];
        });
        return newObj;

    } else if (typeof obj.write == 'function') {
        // Assume we were passed a stream, and add a writeLine() method to it
        obj.writeLine = function() {
            obj.write(exports.format(
                util.format.apply(null, arguments) + '\n',
                formats));
        };
        return obj;

    } else {
        throw new Error(
            "I don't know what to do with this: " + util.format(obj));
    }
};

exports.formats = {
    date : 'YYYY-MM-DD ddd a hh:mm:ss',
    msg  : '[%s] %s'
};

exports.format = function(msg, formats) {
    if (!formats) formats = exports.formats;

    return util.format(
        formats.msg,
        moment().format(formats.date),
        msg);
};
