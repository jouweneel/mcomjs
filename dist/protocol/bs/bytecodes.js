"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.BsDataTypes = [];
exports.BsDataTypes[0x00] = 'void';
/** 1-byte types */
exports.BsDataTypes[0x10] = 'u8';
exports.BsDataTypes[0x11] = 'i8';
exports.BsDataTypes[0x12] = 'bool';
exports.BsDataTypes[0x13] = 'char';
/** 1-byte array types */
exports.BsDataTypes[0x18] = 'u8[]';
exports.BsDataTypes[0x19] = 'i8[]';
exports.BsDataTypes[0x1a] = 'bool[]';
exports.BsDataTypes[0x1b] = 'string';
exports.BsDataTypes[0x1c] = 'json';
/** 2-byte types */
exports.BsDataTypes[0x20] = 'u16';
exports.BsDataTypes[0x21] = 'i16';
/** 2-byte array types */
exports.BsDataTypes[0x28] = 'u16[]';
exports.BsDataTypes[0x29] = 'i16[]';
/** 3-byte types */
exports.BsDataTypes[0x30] = 'rgb';
exports.BsDataTypes[0x31] = 'hsv';
/** 3-byte array types */
exports.BsDataTypes[0x38] = 'rgb[]';
exports.BsDataTypes[0x39] = 'hsv[]';
/** 4-byte types */
exports.BsDataTypes[0x40] = 'u32';
exports.BsDataTypes[0x41] = 'i32';
exports.BsDataTypes[0x42] = 'float';
exports.BsDataTypes[0x43] = 'date';
exports.BsDataTypes[0x44] = 'time';
exports.BsDataTypes[0x45] = 'rgbw';
/** 4-byte array types */
exports.BsDataTypes[0x48] = 'u32[]';
exports.BsDataTypes[0x49] = 'i32[]';
exports.BsDataTypes[0x4a] = 'float[]';
exports.BsDataTypes[0x4b] = 'date[]';
exports.BsDataTypes[0x44] = 'time[]';
exports.BsDataTypes[0x4d] = 'rgbw[]';
/** 8-byte types */
exports.BsDataTypes[0x80] = 'u64';
exports.BsDataTypes[0x81] = 'i64';
exports.BsDataTypes[0x82] = 'double';
exports.BsDataTypes[0x83] = 'datetime';
/** 8-byte array types */
exports.BsDataTypes[0x88] = 'u64[]';
exports.BsDataTypes[0x89] = 'i64[]';
exports.BsDataTypes[0x8a] = 'double[]';
exports.BsDataTypes[0x8b] = 'datetime[]';
var bs2tMap = exports.BsDataTypes.reduce(function (acc, v, k) {
    var _a;
    return (__assign(__assign({}, acc), (_a = {}, _a[v] = k, _a)));
}, {});
exports.t2bs = function (type) { return exports.BsDataTypes[type]; };
exports.bs2t = function (bs) { return bs2tMap[bs]; };
