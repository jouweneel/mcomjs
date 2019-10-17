"use strict";
exports.__esModule = true;
var http_1 = require("http");
var logger_1 = require("../../logger");
var logger = logger_1.taglogger('transport-http');
exports.Http = function (_a) {
    var host = _a.host, port = _a.port;
    return new Promise(function (resolve, reject) {
        var responder = null;
        var respond = function (callback) {
            if (responder) {
                logger.error(new Error("Responder already set"));
            }
            responder = callback;
        };
        var server = http_1.createServer(function (req, res) {
            var data = [];
            req.on('data', function (chunk) { return data.push(chunk); });
            req.on('end', function () {
                var buf = Buffer.concat(data);
                var responseData = responder(Buffer.from(buf), req);
                res.write(responseData, function (e) {
                    e && logger.error(e);
                    res.end();
                });
            });
        });
        var request = function (data, ctx) {
            if (ctx === void 0) { ctx = {}; }
            return new Promise(function (rresolve) {
                ctx.method = 'POST';
                ctx.port = ctx.port || port;
                var req = http_1.request(ctx, function (res) {
                    var data = [];
                    res.on('error', logger.error);
                    res.on('data', function (chunk) { return data.push(chunk); });
                    res.on('end', function () { return rresolve(Buffer.concat(data)); });
                });
                req.on('error', logger.error);
                req.write(data, function () { return req.end(); });
            });
        };
        var transport = {
            request: request,
            respond: respond,
            stop: function () { return new Promise(server.close.bind(server)); }
        };
        server.on('error', function (e) { return logger.error(e); });
        server.listen(port, host, function () {
            logger.log("Listening on " + (host ? host + ":" : '') + port);
            resolve(transport);
        });
    });
};
