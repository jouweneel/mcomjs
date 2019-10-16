"use strict";
exports.__esModule = true;
var BMclasses = [
    { byte: 0x00, cls: 'sys' },
    { byte: 0x10, cls: 'cmd' },
    { byte: 0x20, cls: 'data' },
    { byte: 0x30, cls: 'state' }
];
var BMtypes = [
    /** Single value types */
    { byte: 0x10, type: 'bool', size: 1 },
    { byte: 0x11, type: 'char', size: 1 },
    { byte: 0x20, type: 'u8', size: 1 },
    { byte: 0x21, type: 'u16', size: 2 },
    { byte: 0x22, type: 'u32', size: 4 },
    { byte: 0x28, type: 'i8', size: 1 },
    { byte: 0x29, type: 'i16', size: 2 },
    { byte: 0x2a, type: 'i32', size: 4 },
    { byte: 0x30, type: 'float', size: 4 },
    { byte: 0x31, type: 'double', size: 8 },
    /** Fixed size array types */
    { byte: 0x50, type: 'hsv', size: 3 },
    { byte: 0x51, type: 'rgb', size: 3 },
    { byte: 0x52, type: 'rgbw', size: 4 },
    { byte: 0x60, type: 'date', size: 4 },
    { byte: 0x61, type: 'time', size: 5 },
    { byte: 0x62, type: 'datetime', size: 9 },
    /** Variable size array types */
    { byte: 0x80, type: 'bool[]', size: -1 },
    { byte: 0x81, type: 'string', size: -1 },
    { byte: 0x82, type: 'json', size: -1 },
    { byte: 0xa0, type: 'u8[]', size: -1 },
    { byte: 0xa1, type: 'u16[]', size: -1 },
    { byte: 0xa2, type: 'u32[]', size: -1 },
    { byte: 0xa8, type: 'i8[]', size: -1 },
    { byte: 0xa9, type: 'i16[]', size: -1 },
    { byte: 0xaa, type: 'i32[]', size: -1 },
    { byte: 0xb0, type: 'float[]', size: -1 },
    { byte: 0xb1, type: 'double[]', size: -1 },
];
var x8Sizes = ['double', 'double[]'];
var x4Sizes = ['u32', 'i32', 'float', 'u32[]', 'i32[]', 'float[]'];
var x2Sizes = ['u16', 'i16', 'u16[]', 'i16[]'];
exports.sizeFactor = function (type) { return (x8Sizes.indexOf(type) >= 0 ? 8 :
    x4Sizes.indexOf(type) >= 0 ? 4 :
        x2Sizes.indexOf(type) >= 0 ? 2 :
            1); };
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
