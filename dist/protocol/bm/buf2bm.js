"use strict";
exports.__esModule = true;
var types_1 = require("./types");
var div = function (type) { return ((type === 'u32' || type === 'i32' || type === 'u32a' || type === 'i32a') ? 4 :
    (type === 'u16' || type === 'i16' || type === 'u16a' || type === 'i16a') ? 2 :
        1); };
var parseHeader = function (buf) {
    var keySize = buf.readUInt8(1);
    var key = buf.slice(2, 2 + keySize).toString();
    var byte = buf.readUInt8(2 + keySize);
    var _a = types_1.b2ts(byte), type = _a.type, typeSize = _a.size;
    var dataSize = (typeSize >= 0) ? typeSize : buf.readUInt32LE(2 + keySize + 1);
    return {
        key: key,
        type: type,
        size: dataSize,
        offset: (typeSize >= 0) ? keySize + 3 : keySize + 7
    };
};
var readInt = function (buf, type, offset) {
    if (offset === void 0) { offset = 0; }
    switch (type) {
        case 'u8': return buf.readUInt8(offset);
        case 'u16': return buf.readUInt16LE(offset);
        case 'u32': return buf.readUInt32LE(offset);
        case 'i8': return buf.readInt8(offset);
        case 'i16': return buf.readInt16LE(offset);
        case 'i32': return buf.readInt32LE(offset);
    }
};
var readIntA = function (buf, type) {
    var elmType = type.slice(0, -1);
    var result = [];
    for (var i = 0; i < buf.length; i += div(elmType)) {
        result.push(readInt(buf, elmType, i));
    }
    switch (type) {
        case 'u8a': return Uint8Array.from(result);
        case 'u16a': return Uint16Array.from(result);
        case 'u32a': return Uint32Array.from(result);
        case 'i8a': return Int8Array.from(result);
        case 'i16a': return Int16Array.from(result);
        case 'i32a': return Int32Array.from(result);
        default: throw new Error("Type " + type + " is not an integer array type");
    }
};
var decodeBm = function (buffer, bufOffset) {
    if (bufOffset === void 0) { bufOffset = 0; }
    var bmbuf = buffer.slice(bufOffset);
    var _a = parseHeader(bmbuf), key = _a.key, type = _a.type, size = _a.size, offset = _a.offset;
    var buf = bmbuf.slice(offset, offset + size);
    var data = null;
    switch (type) {
        case 'bool':
            data = Boolean(buf.readUInt8(0));
            break;
        case 'char':
            data = buf.toString();
            break;
        case 'u8':
        case 'u16':
        case 'u32':
        case 'i8':
        case 'i16':
        case 'i32':
            data = readInt(buf, type);
            break;
        case 'u8a':
        case 'u16a':
        case 'u32a':
        case 'i8a':
        case 'i16a':
        case 'i32a':
            data = readIntA(buf, type);
            break;
        case 'hsv':
        case 'rgb':
        case 'rgbw':
            data = readIntA(buf, 'u8a');
            break;
        case 'string':
        case 'date':
        case 'time':
        case 'datetime':
            data = buf.toString();
            break;
        case 'json':
            data = JSON.parse(buf.toString());
            break;
        default: throw new Error("buf2bm: Uknown BMtype " + type);
    }
    return {
        key: key,
        type: type,
        data: data,
        size: offset + size
    };
};
exports.buf2bm = function (buf) {
    var _a = decodeBm(buf, 0), key = _a.key, type = _a.type, data = _a.data;
    return { key: key, type: type, data: data };
};
exports.buf2bms = function (buf) {
    var result = [];
    var offset = 0;
    while (offset < buf.length) {
        var _a = decodeBm(buf, offset), key = _a.key, type = _a.type, data = _a.data, size = _a.size;
        result.push({ key: key, type: type, data: data });
        offset += size;
    }
    return result;
};
