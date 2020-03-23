"use strict";
exports.__esModule = true;
var buf2bs_1 = require("./buf2bs");
var bs2buf_1 = require("./bs2buf");
exports.Bs = function (initialSchema) {
    if (initialSchema === void 0) { initialSchema = {}; }
    var schema = initialSchema;
    var setSchema = function (newSchema) {
        for (var _i = 0, _a = Object.keys(schema); _i < _a.length; _i++) {
            var k = _a[_i];
            delete schema[k];
        }
        for (var _b = 0, _c = Object.entries(newSchema); _b < _c.length; _b++) {
            var entry = _c[_b];
            var key = entry[0], value = entry[1];
            schema[key] = value;
        }
    };
    return {
        getSchema: function () { return schema; },
        setSchema: setSchema,
        decode: buf2bs_1.buf2bs(schema),
        encode: bs2buf_1.bs2buf(schema)
    };
};
