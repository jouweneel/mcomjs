"use strict";
exports.__esModule = true;
exports.emitter = function () {
    var callbacks = {};
    var emit = function (event, data) {
        for (var _i = 0, _a = callbacks[event]; _i < _a.length; _i++) {
            var cb = _a[_i];
            cb(data);
        }
    };
    var on = function (event, cb) {
        callbacks[event] = callbacks[event] || [];
        callbacks[event].push(cb);
    };
    var off = function (event, cb) {
        var idx = callbacks[event].indexOf(cb);
        callbacks[event].splice(idx, 1);
    };
    var stop = function (event) {
        delete callbacks[event];
    };
    return {
        emit: emit,
        on: on,
        off: off,
        stop: stop
    };
};
