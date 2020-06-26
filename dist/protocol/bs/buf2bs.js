"use strict";
exports.__esModule = true;
var ramda_1 = require("ramda");
var bytecodes_1 = require("./bytecodes");
var bufReadArray = function (buf, method, bytes) {
    var result = [];
    for (var i = 0; i < (buf.length / bytes); i++) {
        result[i] = buf[method](bytes * i);
    }
    return result;
};
var buf2data = function (buf, node) {
    if (!buf.length) {
        return null;
    }
    var type = node.type;
    var typeCode = bytecodes_1.bs2t(type);
    if (typeCode < 0x10) {
        return buf;
    }
    switch (type) {
        case 'u8':
        case 'bool':
        case 'char': return buf.readUInt8(0);
        case 'u16': return buf.readUInt16LE(0);
        case 'u32': return buf.readUInt32LE(0);
        case 'u64': return buf.readBigUInt64LE(0);
        case 'i8': return buf.readInt8(0);
        case 'u16': return buf.readInt16LE(0);
        case 'u32': return buf.readInt32LE(0);
        case 'u64':
        case 'timestamp': return buf.readBigInt64LE(0);
        case 'float': return buf.readFloatLE(0);
        case 'double': return buf.readDoubleLE(0);
        case 'u8[]':
        case 'bool[]':
        case 'rgb':
        case 'hsv':
        case 'rgbw':
            return bufReadArray(buf, 'readUInt8', 1);
        case 'u16[]': return bufReadArray(buf, 'readUInt16', 2);
        case 'u32[]': return bufReadArray(buf, 'readUInt32', 4);
        case 'u64[]':
        case 'timestamp[]': return bufReadArray(buf, 'readBigUInt64', 8);
        case 'i8[]': return bufReadArray(buf, 'readInt8', 1);
        case 'i16[]': return bufReadArray(buf, 'readInt16', 2);
        case 'i32[]': return bufReadArray(buf, 'readInt32', 4);
        case 'i64[]': return bufReadArray(buf, 'readBigInt64', 8);
        case 'float[]': return bufReadArray(buf, 'readFloatLE', 4);
        case 'double[]': return bufReadArray(buf, 'readDoubleLE', 8);
        case 'rgb[]':
        case 'hsv[]':
        case 'rgbw[]': {
            var data = [];
            var mul = (type === 'rgbw[]') ? 4 : 3;
            for (var i = 0; i < (buf.length / mul); i++) {
                data[i] = [];
                for (var j = 0; j < mul; j++) {
                    data[i][j] = buf.readUInt8(i * mul + j);
                }
            }
            return data;
        }
        case 'string': return buf.toString();
        case 'json': return JSON.parse(buf.toString());
    }
};
exports.buf2bs = function (schema) { return function (buf) {
    var unitSize = (buf[0] & 0xf0) >> 4;
    var isArray = (buf[0] & 0x08) == 0x08;
    var dataLength = isArray ? buf.readUInt16LE(2) : 1;
    var dataSize = dataLength * unitSize;
    var nodeBytes = buf.slice(isArray ? 4 : 2, -dataSize);
    var node = schema;
    var nodePath = [];
    var _loop_1 = function (i) {
        ramda_1.mapObjIndexed(function (entry, key) {
            if (entry.id == nodeBytes[i]) {
                node = entry;
                nodePath.push(key);
            }
        }, node);
    };
    for (var i = 0; i < nodeBytes.length; i++) {
        _loop_1(i);
    }
    return {
        path: nodePath,
        node: node,
        data: buf2data(buf.slice(-dataSize), node)
    };
}; };
