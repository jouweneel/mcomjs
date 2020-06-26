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
var net_1 = require("net");
var ramda_1 = require("ramda");
var logger_1 = require("../../logger");
var logger = logger_1.taglogger('transport-tcp');
var write = function (socket, data) { return new Promise(function (resolve, reject) {
    socket.write(data, function (e) {
        if (e) {
            return reject(e);
        }
        return resolve(data.length);
    });
}); };
var TcpClient = function (_a) {
    var ip = _a.ip, port = _a.port;
    return new Promise(function (resolve, reject) {
        var socket = net_1.connect(port, ip);
        var ctx = { ip: ip, port: port, socket: socket };
        var iv = null;
        var emit = function (data, _a) { return __awaiter(void 0, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, write(socket, data)];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        e_1 = _b.sent();
                        logger.error(e_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        var on = function (callback) {
            socket.on('data', function (data) { return callback(data, ctx); });
        };
        socket.on('error', reject);
        socket.on('end', function () {
            if (iv === null) {
                setInterval(function () {
                    socket.connect(port, ip);
                }, 10000);
            }
        });
        socket.on('connect', function () {
            if (iv) {
                clearInterval(iv);
                iv = null;
            }
            logger.log("Connected to " + ip + ":" + port);
            resolve({
                emit: emit,
                on: on
            });
        });
    });
};
var TcpServer = function (_a) {
    var ip = _a.ip, port = _a.port;
    return new Promise(function (resolve, reject) {
        var connections = [];
        var subs = [];
        var getConnection = function (_a) {
            var ip = _a.ip, port = _a.port;
            return ramda_1.find(function (connection) { return (connection.ip === ip && connection.port === port); }, connections);
        };
        var emit = function (data, ctx) { return __awaiter(void 0, void 0, void 0, function () {
            var connection;
            return __generator(this, function (_a) {
                connection = getConnection(ctx);
                if (!connection) {
                    logger.error(new Error("Socket " + ctx.ip + ":" + ctx.port + " not found"));
                    return [2 /*return*/, 0];
                }
                return [2 /*return*/, write(connection.socket, data)];
            });
        }); };
        var on = function (cb) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, subs.push(cb)];
        }); }); };
        var server = net_1.createServer(function (socket) {
            var existing = getConnection({ ip: socket.remoteAddress, port: socket.remotePort });
            var ctx = existing ? existing : { ip: socket.remoteAddress, port: socket.remotePort, socket: socket };
            if (!existing) {
                connections.push(ctx);
            }
            socket.on('data', function (data) {
                for (var _i = 0, subs_1 = subs; _i < subs_1.length; _i++) {
                    var sub = subs_1[_i];
                    sub(data, ctx);
                }
            });
            socket.on('close', function () {
                connections.splice(connections.indexOf(existing || ctx), 1);
            });
        });
        server.on('error', reject);
        server.on('connect', function () { return resolve({
            emit: emit,
            on: on
        }); });
        server.listen(port, ip);
    });
};
exports.Tcp = function (cfg) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, cfg.type === 'server' ? TcpServer(cfg) : TcpClient(cfg)];
        }
        catch (e) {
            logger.error(e);
        }
        return [2 /*return*/];
    });
}); };
