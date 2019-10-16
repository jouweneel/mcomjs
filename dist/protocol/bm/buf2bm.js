"use strict";
exports.__esModule = true;
var bytecodes_1 = require("./bytecodes");
var parseHeader = function (buf) {
    var cls = bytecodes_1.b2c(buf.readUInt8(0));
    var keySize = buf.readUInt8(1);
    var key = buf.slice(2, 1 + keySize).toString();
    var byte = buf.readUInt8(2 + keySize);
    var _a = bytecodes_1.b2ts(byte), type = _a.type, typeSize = _a.size;
    var dataSize = (typeSize >= 0) ? typeSize : buf.readUInt32LE(3 + keySize);
    return {
        cls: cls,
        key: key,
        type: type,
        size: dataSize,
        offset: (typeSize >= 0) ? keySize + 3 : keySize + 7
    };
};
var readNumber = function (buf, type, offset) {
    if (offset === void 0) { offset = 0; }
    switch (type) {
        case 'u8': return buf.readUInt8(offset);
        case 'u16': return buf.readUInt16LE(offset);
        case 'u32': return buf.readUInt32LE(offset);
        case 'i8': return buf.readInt8(offset);
        case 'i16': return buf.readInt16LE(offset);
        case 'i32': return buf.readInt32LE(offset);
        case 'float': return buf.readFloatLE(offset);
        case 'double': return buf.readDoubleLE(offset);
    }
};
var readNumberArray = function (buf, type) {
    var elmType = type.slice(0, -2);
    var result = [];
    for (var i = 0; i < buf.length; i += bytecodes_1.sizeFactor(elmType)) {
        result.push(readNumber(buf, elmType, i));
    }
    switch (type) {
        case 'u8[]': return Uint8Array.from(result);
        case 'u16[]': return Uint16Array.from(result);
        case 'u32[]': return Uint32Array.from(result);
        case 'i8[]': return Int8Array.from(result);
        case 'i16[]': return Int16Array.from(result);
        case 'i32[]': return Int32Array.from(result);
        case 'float[]': return Float32Array.from(result);
        case 'double[]': return Float64Array.from(result);
        default: throw new Error("Type " + type + " is not an integer array type");
    }
};
var readDateTime = function (buf, type) {
    var i = (type === 'datetime') ? 4 : 0;
    var output = '';
    switch (type) {
        case 'date':
        case 'datetime':
            var year = buf.readUInt16LE(0);
            var month = buf.readUInt8(2);
            var day = buf.readUInt8(2);
            output = year + "-" + month + "-" + day;
            if (type === 'date') {
                break;
            }
            else {
                output += ' ';
            }
        case 'time':
            var hours = buf.readUInt8(i);
            var mins = buf.readUInt8(i + 1);
            var secs = buf.readUInt8(i + 2);
            var ms = buf.readUInt16LE(i + 3);
            output += hours + ":" + mins + ":" + secs + "." + ms;
    }
    return output;
};
var decodeBm = function (buffer, bufOffset) {
    if (bufOffset === void 0) { bufOffset = 0; }
    var bmbuf = buffer.slice(bufOffset);
    var _a = parseHeader(bmbuf), cls = _a.cls, key = _a.key, type = _a.type, size = _a.size, offset = _a.offset;
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
        case 'float':
        case 'double':
            data = readNumber(buf, type);
            break;
        case 'hsv':
        case 'rgb':
        case 'rgbw':
            data = readNumberArray(buf, 'u8[]');
            break;
        case 'u8[]':
        case 'u16[]':
        case 'u32[]':
        case 'i8[]':
        case 'i16[]':
        case 'i32[]':
        case 'float[]':
        case 'double[]':
            data = readNumberArray(buf, type);
            break;
        case 'date':
        case 'time':
        case 'datetime':
            data = readDateTime(buf, type);
            break;
        case 'string':
            data = buf.toString();
            break;
        case 'json':
            data = JSON.parse(buf.toString());
            break;
        default: throw new Error("buf2bm: Uknown BMtype " + type);
    }
    return {
        cls: cls,
        key: key,
        type: type,
        data: data,
        size: offset + size
    };
};
exports.buf2bm = function (buf) {
    var _a = decodeBm(buf, 0), cls = _a.cls, key = _a.key, type = _a.type, data = _a.data;
    return { cls: cls, key: key, type: type, data: data };
};
exports.buf2bms = function (buf) {
    var result = [];
    var offset = 0;
    while (offset < buf.length) {
        var _a = decodeBm(buf, offset), cls = _a.cls, key = _a.key, type = _a.type, data = _a.data, size = _a.size;
        result.push({ cls: cls, key: key, type: type, data: data });
        offset += size;
    }
    return result;
};
