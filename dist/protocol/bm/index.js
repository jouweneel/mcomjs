"use strict";
exports.__esModule = true;
var bm2buf_1 = require("./bm2buf");
var buf2bm_1 = require("./buf2bm");
var logger_1 = require("../../logger");
var logger = logger_1.taglogger('protocol-bm');
exports.Bm = {
    decode: function (data) {
        try {
            return buf2bm_1.buf2bms(data);
        }
        catch (e) {
            logger.error(e);
        }
    },
    encode: function (bms) {
        try {
            return bm2buf_1.bms2buf(bms);
        }
        catch (e) {
            logger.error(e);
        }
    }
};
