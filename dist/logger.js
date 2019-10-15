"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var colors_1 = __importDefault(require("colors"));
var fs_1 = require("fs");
var moment_1 = __importDefault(require("moment"));
var path_1 = require("path");
var file = process.env.LOGFILE && fs_1.openSync(path_1.join(process.cwd(), process.env.LOGFILE), 'w');
var dbg = process.env.NODE_ENV === 'development';
var prefix = function (tag) { return moment_1["default"]().format('YYYY-MM-DD HH:mm:ss:SSS') + " [" + tag + "]"; };
var filelog = function (prefix, args) {
    file && fs_1.writeSync(file, prefix + " ");
    args.map(function (arg) { return file && fs_1.writeSync(file, typeof arg === 'string' ? arg + " " : JSON.stringify(arg, null, '  ')); });
    file && fs_1.writeSync(file, '\n');
};
var debug = function (tag) { return function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    dbg && console.log.apply(console, __spreadArrays([colors_1["default"].magenta(prefix(tag))], args));
    filelog(prefix(tag) + " (debug)", args);
}; };
var error = function (tag) { return function (err, fatal) {
    console.log(colors_1["default"].red(prefix(tag)), err.message, colors_1["default"].red(err.stack));
    filelog(prefix(tag) + " (error)", [err.message, err.stack.split('\n')[1].trim()]);
    fatal && process.exit(0);
}; };
var log = function (tag) { return function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    console.log.apply(console, __spreadArrays([colors_1["default"].green(prefix(tag))], args));
    filelog(prefix(tag) + " (log)", args);
}; };
exports.taglogger = function (tag) { return ({
    debug: debug(tag),
    error: error(tag),
    log: log(tag)
}); };
