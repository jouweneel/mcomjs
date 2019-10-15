"use strict";
exports.__esModule = true;
var BMclasses = [
    { byte: 0x00, cls: 'sys' },
    { byte: 0x10, cls: 'cmd' },
    { byte: 0x20, cls: 'data' },
    { byte: 0x30, cls: 'state' }
];
var BMtypes = [
    { byte: 0x10, type: 'bool', size: 1 },
    { byte: 0x11, type: 'char', size: 1 },
    { byte: 0x20, type: 'u8', size: 1 },
    { byte: 0x21, type: 'i8', size: 1 },
    { byte: 0x22, type: 'u16', size: 2 },
    { byte: 0x23, type: 'i16', size: 2 },
    { byte: 0x24, type: 'u32', size: 4 },
    { byte: 0x25, type: 'i32', size: 4 },
    { byte: 0x30, type: 'u8a', size: -1 },
    { byte: 0x31, type: 'i8a', size: -1 },
    { byte: 0x32, type: 'u16a', size: -1 },
    { byte: 0x33, type: 'i16a', size: -1 },
    { byte: 0x34, type: 'u32a', size: -1 },
    { byte: 0x35, type: 'i32a', size: -1 },
    { byte: 0x40, type: 'hsv', size: 3 },
    { byte: 0x41, type: 'rgb', size: 3 },
    { byte: 0x42, type: 'rgbw', size: 4 },
    { byte: 0x50, type: 'string', size: -1 },
    { byte: 0x51, type: 'date', size: 10 },
    { byte: 0x52, type: 'time', size: 9 },
    { byte: 0x53, type: 'datetime', size: 20 },
    { byte: 0x61, type: 'json', size: -1 }
];
var b2cMap = BMclasses.reduce(function (acc, _a) {
    var byte = _a.byte, cls = _a.cls;
    return acc.set(byte, cls);
}, new Map());
var c2bMap = BMclasses.reduce(function (acc, _a) {
    var byte = _a.byte, cls = _a.cls;
    return acc.set(cls, byte);
}, new Map());
var b2tMap = BMtypes.reduce(function (acc, _a) {
    var byte = _a.byte, type = _a.type;
    return acc.set(byte, type);
}, new Map());
var b2tsMap = BMtypes.reduce(function (acc, _a) {
    var byte = _a.byte, type = _a.type, size = _a.size;
    return acc.set(byte, { type: type, size: size });
}, new Map());
var t2bMap = BMtypes.reduce(function (acc, _a) {
    var type = _a.type, byte = _a.byte;
    return acc.set(type, byte);
}, new Map());
var t2bsMap = BMtypes.reduce(function (acc, _a) {
    var byte = _a.byte, type = _a.type, size = _a.size;
    return acc.set(type, { byte: byte, size: size });
}, new Map());
exports.b2c = b2cMap.get.bind(b2cMap);
exports.c2b = c2bMap.get.bind(c2bMap);
exports.b2t = b2tMap.get.bind(b2tMap);
exports.b2ts = b2tsMap.get.bind(b2tsMap);
exports.t2b = t2bMap.get.bind(t2bMap);
exports.t2bs = t2bsMap.get.bind(t2bsMap);
