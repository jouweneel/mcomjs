"use strict";
exports.__esModule = true;
var BMclasses = [
    { byte: 0x00, cls: 'event' },
    { byte: 0x10, cls: 'reqres' }
];
var b2cMap = BMclasses.reduce(function (acc, _a) {
    var byte = _a.byte, cls = _a.cls;
    return acc.set(byte, cls);
}, new Map());
var c2bMap = BMclasses.reduce(function (acc, _a) {
    var byte = _a.byte, cls = _a.cls;
    return acc.set(cls, byte);
}, new Map());
exports.b2c = b2cMap.get.bind(b2cMap);
exports.c2b = c2bMap.get.bind(c2bMap);
