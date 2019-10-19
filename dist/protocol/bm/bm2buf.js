"use strict";
exports.__esModule = true;
var bytecodes_1 = require("./bytecodes");
var buildHeader = function (cls, key, type, size, data) {
    if (cls === void 0) { cls = 0; }
    var _a = bytecodes_1.t2bs(type), byte = _a.byte, typeSize = _a.size;
    var keySize = key.length + 1;
    var dataSize = (typeSize >= 0) ? typeSize : size;
    if (keySize > 255) {
        throw new Error("Max key size is 255 (" + key + ")");
    }
    ;
    if (dataSize === null || dataSize === undefined) {
        try {
            dataSize = (type === 'json')
                ? JSON.stringify(data).length
                : data.length;
        }
        catch (e) {
            throw new Error("Type " + type + " needs a specified size");
        }
    }
    if (typeSize < 0) {
        dataSize = dataSize * bytecodes_1.sizeFactor(type);
    }
    if (type === 'string') {
        dataSize++;
    }
    var headerSize = 2 + keySize + (typeSize >= 0 ? 1 : 5);
    var header = Buffer.alloc(headerSize, 0).fill(0);
    header.writeUInt8(cls, 0);
    header.writeUInt8(keySize, 1);
    header.write(key, 2);
    header.writeUInt8(byte, keySize + 2);
    if (typeSize === -1) {
        header.writeUInt32LE(dataSize, keySize + 3);
    }
    return { dataSize: dataSize, header: header };
};
var writeNr = function (buf, type, data, offset) {
    if (offset === void 0) { offset = 0; }
    switch (type) {
        case 'u8':
            buf.writeUInt8(data, offset);
            break;
        case 'u16':
            buf.writeUInt16LE(data, offset);
            break;
        case 'u32':
            buf.writeUInt32LE(data, offset);
            break;
        case 'i8':
            buf.writeInt8(data, offset);
            break;
        case 'i16':
            buf.writeInt16LE(data, offset);
            break;
        case 'i32':
            buf.writeInt32LE(data, offset);
            break;
        case 'float':
            buf.writeFloatLE(data, offset);
            break;
        case 'double':
            buf.writeDoubleLE(data, offset);
            break;
        default: throw new Error("\"" + type + "\" is not a numeric type");
    }
};
var writeNrArray = function (buf, type, data) {
    var elmType = type.slice(0, -2);
    for (var i = 0; i < data.length; i++) {
        writeNr(buf, elmType, data[i], i * bytecodes_1.sizeFactor(type));
    }
};
var writeDateTime = function (buf, type, data) {
    var i = (type === 'datetime') ? 4 : 0;
    var dt_time = '';
    switch (type) {
        case 'date':
        case 'datetime':
            var _a = data.split('-'), year = _a[0], month = _a[1], rest = _a[2];
            buf.writeUInt16LE(parseInt(year, 10), 0);
            buf.writeUInt8(parseInt(month, 10), 2);
            if (type === 'date') {
                buf.writeUInt8(parseInt(rest, 10), 3);
                break;
            }
            else {
                var _b = rest.split(' '), day = _b[0], t = _b[1];
                buf.writeUInt8(parseInt(day, 10), 3);
                dt_time = t;
            }
        case 'time':
            var time = dt_time || data;
            var _c = time.split(':'), hours = _c[0], mins = _c[1], s_ms = _c[2];
            var _d = s_ms.split('.'), secs = _d[0], ms = _d[1];
            buf.writeUInt8(parseInt(hours, 10), i);
            buf.writeUInt8(parseInt(mins), i + 1);
            buf.writeUInt8(parseInt(secs, 10), i + 2);
            buf.writeUInt16LE(parseInt(ms, 10), i + 3);
            break;
        default: throw new Error("\"" + type + "\" is not a date/time format");
    }
};
exports.bm2buf = function (_a) {
    var cls = _a.cls, key = _a.key, type = _a.type, size = _a.size, data = _a.data;
    var _b = buildHeader(cls, key, type, size, data), dataSize = _b.dataSize, header = _b.header;
    var buf = Buffer.alloc(dataSize);
    switch (type) {
        case 'bool':
            buf.writeUInt8(data ? 1 : 0, 0);
            break;
        case 'char':
            buf.writeUInt8(data.charCodeAt(0), 0);
            break;
        case 'u8':
        case 'u16':
        case 'u32':
        case 'i8':
        case 'i16':
        case 'i32':
        case 'float':
        case 'double':
            writeNr(buf, type, data);
            break;
        case 'hsv':
        case 'rgb':
        case 'rgbw':
            writeNrArray(buf, 'u8[]', data);
            break;
        case 'date':
        case 'time':
        case 'datetime':
            writeDateTime(buf, type, data);
            break;
        case 'string':
            buf.write(data + "\0");
            break;
        case 'json':
            buf.write(JSON.stringify(data));
            break;
        case 'bool[]':
        case 'u8[]':
        case 'u16[]':
        case 'u32[]':
        case 'i8[]':
        case 'i16[]':
        case 'i32[]':
        case 'float[]':
        case 'double[]':
            writeNrArray(buf, type, data);
            break;
        default: throw new Error("bm2buf: Unknown BMtype " + type);
    }
    return Buffer.concat([header, buf]);
};
exports.bms2buf = function (bms) {
    return Buffer.concat(bms.map(exports.bm2buf));
};
