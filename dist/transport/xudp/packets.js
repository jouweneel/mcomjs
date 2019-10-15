"use strict";
exports.__esModule = true;
var ramda_1 = require("ramda");
var BUF_SIZE = 1500;
var HEADER_SIZE = 4;
var DATA_SIZE = BUF_SIZE - HEADER_SIZE;
var sysId = 0;
var cache = [];
exports.build = function (_a) {
    var flags = _a.flags, data = _a.data, id = _a.id;
    var packetId = (id === 255) ? sysId : id;
    if (id !== 255 && sysId === 254) {
        sysId = 0;
    }
    else {
        sysId++;
    }
    if (!data) {
        return [Buffer.from([flags, packetId, 0, 1])];
    }
    else if (data.length < DATA_SIZE) {
        return [Buffer.concat([Buffer.from([flags, packetId, 0, 1]), data])];
    }
    var total = Math.ceil(data.length / (BUF_SIZE - HEADER_SIZE)) || 1;
    var bufs = [];
    for (var i = 0; i < total; i++) {
        var header = Buffer.from([flags, packetId, i, total]);
        var startIdx = i * DATA_SIZE;
        var buf = Buffer.concat([header, data.slice(startIdx, startIdx + DATA_SIZE)]);
        bufs.push(buf);
    }
    return bufs;
};
exports.collect = function (data) {
    var flags = data.readUInt8(0);
    var id = data.readUInt8(1);
    var index = data.readUInt8(2);
    var total = data.readUInt8(3);
    var packet = { flags: flags, id: id, index: index, total: total, data: data.slice(HEADER_SIZE) };
    if (index === 0) {
        cache[id] = [packet];
    }
    else if (cache[id]) {
        cache[id][index] = packet;
    }
    if ((index === total - 1) && cache[id]) {
        for (var i = 0; i < total; i++) {
            if (!cache[id][i] || !cache[id][i].data) {
                delete cache[id];
                throw new Error("Incomplete packet[" + id + "] " + i + "/" + total);
            }
        }
        var bufs = ramda_1.pluck('data', cache[id]);
        return {
            data: Buffer.concat(bufs),
            flags: flags,
            id: id
        };
    }
    return null;
};
