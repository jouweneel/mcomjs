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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var serialport_1 = __importDefault(require("serialport"));
var logger_1 = require("../../logger");
var logger = logger_1.taglogger('transport-Rs232');
exports.Rs232 = function (_a) {
    var port = _a.port, options = __rest(_a, ["port"]);
    return new Promise(function (resolve, reject) {
        var iv = null;
        var subs = [];
        options.autoOpen = false;
        var serial = new serialport_1["default"](port, options);
        var transmit = function (data) { return new Promise(function (res, rej) {
            serial.write(data, function (e, size) { return e ? rej(e) : res(size); });
        }); };
        var emit = function (data) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    return [2 /*return*/, transmit(data)];
                }
                catch (e) {
                    logger.error(e);
                }
                return [2 /*return*/];
            });
        }); };
        var on = function (callback) { return subs.push(callback); };
        var transport = {
            emit: emit,
            on: on,
            stop: function () { return new Promise(serial.close.bind(serial)); }
        };
        serial.on('data', function (data) {
            for (var _i = 0, subs_1 = subs; _i < subs_1.length; _i++) {
                var sub = subs_1[_i];
                sub(data);
            }
        });
        serial.on('open', function () {
            if (iv) {
                clearInterval(iv);
                iv = null;
            }
            logger.log("Connected to " + port);
            resolve(transport);
        });
        serial.on('close', function () {
            iv = setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    serial.open(function (e) {
                        e && logger.debug("Connection attempt to " + port + " failed");
                    });
                    return [2 /*return*/];
                });
            }); }, 1000);
        });
        serial.open(function (err) { return err && reject(err); });
    });
};