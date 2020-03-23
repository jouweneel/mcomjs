"use strict";
exports.__esModule = true;
var ramda_1 = require("ramda");
var bytecodes_1 = require("./bytecodes");
var bufWrite = function (data, method, bytes) {
    var buf = Buffer.alloc(bytes);
    buf[method](data);
    return buf;
};
var bufWriteArray = function (data, method, bytes) {
    var buf = Buffer.alloc(bytes * data.length);
    for (var i = 0; i < data.length; i++) {
        buf[method](data[i]);
    }
    return buf;
};
var data2buf = function (data, type, typeCode) {
    /** No data */
    if (!data) {
        return Buffer.from([]);
    }
    switch (type) {
        case 'u8':
        case 'bool':
        case 'char': return Buffer.from([data]);
        case 'string':
        case 'u8[]':
        case 'bool[]':
        case 'rgb':
        case 'rgbw':
        case 'hsv':
            return Buffer.from(data);
        case 'u16': return bufWrite(data, 'writeUInt16LE', 2);
        case 'u32': return bufWrite(data, 'writeUInt32LE', 4);
        case 'u64':
        case 'timestamp': return bufWrite(data, 'writeBigUInt64LE', 8);
        case 'i8': return bufWrite(data, 'writeInt8', 1);
        case 'i16': return bufWrite(data, 'writeInt16LE', 2);
        case 'i32': return bufWrite(data, 'writeInt32LE', 4);
        case 'i64': return bufWrite(data, 'writeBigInt64LE', 8);
        case 'float': return bufWrite(data, 'writeFloatLE', 4);
        case 'double': return bufWrite(data, 'writeDoubleLE', 8);
        case 'u16[]': return bufWriteArray(data, 'writeUInt16LE', 2);
        case 'u32[]': return bufWriteArray(data, 'writeUInt32LE', 4);
        case 'u64[]':
        case 'timestamp[]': return bufWriteArray(data, 'writeBigUInt64LE', 8);
        case 'i8[]': return bufWriteArray(data, 'writeInt8', 1);
        case 'i16[]': return bufWriteArray(data, 'writeInt16LE', 2);
        case 'i32[]': return bufWriteArray(data, 'writeInt32LE', 4);
        case 'i64[]': return bufWriteArray(data, 'writeBigInt64LE', 8);
        case 'float[]': return bufWriteArray(data, 'writeFloatLE', 4);
        case 'double[]': return bufWriteArray(data, 'writeDoubleLE', 8);
        case 'rgb[]':
        case 'hsv[]':
        case 'rgbw[]': {
            var buf = Buffer.alloc(data[0].length * data.length);
            for (var idx = 0; idx < data.length; idx++) {
                var elm = data[idx];
                for (var i = 0; i < elm.length; i++) {
                    buf.writeUInt8(elm[i], (elm.length * idx) + i);
                }
            }
            return buf;
        }
        case 'json': return Buffer.from(JSON.stringify(data));
        default: {
            if (typeCode >= 0x10) {
                console.log("Type \"" + type + "\" not implemented, defaulting to Buffer.from!");
            }
            return Buffer.from(data);
        }
    }
};
/**
 * | TYPE | CLS | (optional) LENGTH | [...PATH] | DATA |
*/
exports.bs2buf = function (schema) { return function (msg) {
    var node = ramda_1.path(msg.path, schema);
    if (!node) {
        return null;
    }
    var bsType = bytecodes_1.bs2t(node._type);
    var isArray = (bsType & 0x08) == 0x08;
    var dataLength = isArray ? msg.data.length : 1;
    var headerSize = 2 + msg.path.length + (isArray ? 2 : 0);
    var header = Buffer.alloc(headerSize);
    var ptr = 0;
    header.writeUInt8(bsType, ptr);
    ptr++;
    header.writeUInt8(node._cls, ptr);
    ptr++;
    if (isArray) {
        header.writeUInt16LE(dataLength, ptr);
        ptr += 2;
    }
    for (var i = 0; i < msg.path.length; i++) {
        var _node = ramda_1.path(msg.path.slice(0, i + 1), schema);
        header.writeUInt8(_node._id, ptr + i);
    }
    return Buffer.concat([header, data2buf(msg.data, node._type, bsType)]);
}; };
