"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var dgram_1 = require("dgram");
var packets_1 = require("./packets");
var util_1 = require("../util");
exports.Hm = function (_a) {
    var pubPort = _a.pubPort, subPort = _a.subPort;
    return new Promise(function (resolve, reject) {
        var socket = dgram_1.createSocket('udp4');
        var bcastIp = util_1.getIp(true);
        var subs = [];
        var transmit = function (ip, port, data) { return new Promise(function (resolve, reject) {
            socket.send(data, port, ip, function (err, size) {
                return err ? reject(err) : resolve(size);
            });
        }); };
        var emit = function (ctx, data) { return __awaiter(void 0, void 0, void 0, function () {
            var ip, port, packets, size, _i, packets_2, packet, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        ip = ctx.broadcast ? bcastIp : ctx.ip;
                        port = (ctx.port === undefined) ? pubPort : ctx.port;
                        packets = packets_1.build({
                            data: data,
                            id: (ctx.id === undefined) ? 255 : ctx.id,
                            flags: (ctx.flags === undefined) ? 0 : ctx.flags
                        });
                        size = 0;
                        _i = 0, packets_2 = packets;
                        _b.label = 1;
                    case 1:
                        if (!(_i < packets_2.length)) return [3 /*break*/, 4];
                        packet = packets_2[_i];
                        _a = size;
                        return [4 /*yield*/, transmit(ip, port, packet)];
                    case 2:
                        size = _a + _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, size];
                }
            });
        }); };
        var on = function (callback) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, subs.push(callback)];
        }); }); };
        var connector = {
            emit: emit,
            on: on,
            stop: function () { return new Promise(socket.close.bind(socket)); }
        };
        socket.on('error', reject);
        socket.on('message', function (data, info) {
            var ctx = { ip: info.address, port: info.port };
            var message = packets_1.collect(data);
            if (message != null) {
                ctx.id = message.id;
                ctx.flags = message.flags;
                for (var _i = 0, subs_1 = subs; _i < subs_1.length; _i++) {
                    var sub = subs_1[_i];
                    sub(ctx, message.data);
                }
            }
        });
        socket.on('listening', function () { return resolve(connector); });
        socket.bind(subPort, function () { return socket.setBroadcast(true); });
    });
};
