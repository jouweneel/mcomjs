"use strict";
exports.__esModule = true;
var ramda_1 = require("ramda");
var bytecodes_1 = require("./bytecodes");
exports.Bs = function (initialSchema) {
    if (initialSchema === void 0) { initialSchema = {}; }
    var schema = initialSchema;
    var bs2buf = function (msg) {
        var node = ramda_1.path(msg.node, schema);
        if (!node) {
            return null;
        }
        var bsType = bytecodes_1.bs2t(node._type);
        var unitSize = (bsType & 0xf0) >> 4;
        var isArray = (bsType & 0x80) == 0x80;
        var dataLength = isArray ? msg.data.length : 1;
        var dataSize = dataLength * unitSize;
        var headerSize = 2 + msg.node.length;
        var buf = Buffer.alloc(headerSize);
        var ptr = 0;
        buf.writeUInt8(bsType, ptr);
        ptr++;
        buf.writeUInt8(msg.cls || 0, ptr);
        ptr++;
        if (isArray) {
            buf.writeUInt16LE(dataLength, ptr);
            ptr += 2;
        }
        for (var i = 0; i < msg.node.length; i++) {
            var _node = ramda_1.path(msg.node.slice(0, i + 1), schema);
            buf.writeUInt8(_node._id, ptr + i);
        }
        return msg.data ? Buffer.concat([buf, Buffer.from(msg.data)]) : buf;
    };
    var buf2bs = function (buf) {
        var unitSize = (buf[0] & 0xf0) >> 4;
        var isArray = (buf[0] & 0x80) == 0x80;
        var bsType = bytecodes_1.t2bs(buf[0]);
        var dataLength = isArray ? buf.readUInt16LE(2) : 1;
        var dataSize = dataLength * unitSize;
        var nodeBytes = buf.slice(isArray ? 4 : 2, -dataSize);
        var ref = schema;
        var node = [];
        var _loop_1 = function (i) {
            ramda_1.mapObjIndexed(function (entry, key) {
                if (entry._id == nodeBytes[i]) {
                    ref = entry;
                    node.push(key);
                }
            }, ref);
        };
        for (var i = 0; i < nodeBytes.length; i++) {
            _loop_1(i);
        }
        return {
            node: node,
            data: buf.slice(-dataSize),
            length: dataLength,
            cls: buf[1]
        };
    };
    return {
        getSchema: function () { return schema; },
        setSchema: function (newSchema) { return schema = newSchema; },
        decode: buf2bs,
        encode: bs2buf
    };
};
var schema = {
    strip: {
        _id: 0x00, _type: 'custom', _cls: 0xa0,
        power: { _id: 0x00, _type: 'bool', _cls: 0x10 },
        brightness: { _id: 0x01, _type: 'u8', _cls: 0x10 },
        color: { _id: 0x02, _type: 'hsv', _cls: 0x10 }
    },
    strip_2: {
        _id: 0x01, _type: 'custom', _cls: 0xa0,
        power: { _id: 0x00, _type: 'bool', _cls: 0x10 },
        brightness: { _id: 0x01, _type: 'u8', _cls: 0x10 },
        color: { _id: 0x02, _type: 'hsv', _cls: 0x10 }
    }
};
var msg = {
    node: ['strip_2', 'color'],
    data: [32, 64, 128],
    cls: 15
};
var bs = exports.Bs(schema);
var buf = bs.encode(msg);
console.log(buf, bs.decode(buf));
