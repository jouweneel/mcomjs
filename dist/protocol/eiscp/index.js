"use strict";
exports.__esModule = true;
var num2str = function (nr) { return nr.toString(16).toUpperCase().padStart(2, "0"); };
var decode = function (buf) {
    var length = buf[11];
    var cmd = buf.slice(18, 21).toString();
    var str = buf.slice(21, 13 + length).toString();
    if (length === 2) {
        try {
            var val = parseInt(str, 10);
            if (!isNaN(val)) {
                return { cmd: cmd, data: val };
            }
        }
        catch (e) { }
    }
    return { cmd: cmd, data: Buffer.from(str) };
};
var encode = function (_a) {
    var cmd = _a.cmd, data = _a.data;
    var val = (typeof data === 'number') ? num2str(data) : data && data.length ? data.toString() : '';
    var len = cmd.length + val.length + 3;
    var buf = Buffer.alloc(len + 16);
    console.log("Encoded " + cmd + ": " + val);
    buf.write("ISCP", 0, 4, "ascii");
    buf[7] = 0x10;
    buf.writeInt32BE(len, 8);
    buf[12] = 0x01;
    buf[16] = 0x21;
    buf[17] = 0x31;
    buf.write(cmd, 18, cmd.length, "ascii");
    buf.write(val, 18 + cmd.length, val.length, "ascii");
    buf[18 + val.length + cmd.length] = 0x0d;
    return buf;
};
exports.EISCP = { decode: decode, encode: encode };
