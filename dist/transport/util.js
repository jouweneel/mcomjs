"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var child_process_1 = require("child_process");
var os_1 = require("os");
var ramda_1 = require("ramda");
exports.getInterface = function (ifaceStrings) {
    if (ifaceStrings === void 0) { ifaceStrings = []; }
    var strings = __spreadArrays(['eth0', 'en0', 'enp5s0'], ifaceStrings);
    var ifaces = os_1.networkInterfaces();
    for (var i = 0; i < strings.length; i++) {
        var iface = ramda_1.path([strings[i], 0], ifaces);
        if (iface) {
            return iface;
        }
    }
    throw new Error("getInterfaces: no interface found in " + JSON.stringify(strings));
};
exports.getIp = function (broadcast, ifaceStrings) {
    if (broadcast === void 0) { broadcast = false; }
    var iface = exports.getInterface(ifaceStrings);
    var ip = iface.address;
    if (broadcast) {
        var parts = ip.split('.');
        parts[3] = '255';
        return parts.join('.');
    }
    else {
        return ip;
    }
};
exports.getMac = function (ifaceStrings) {
    var iface = exports.getInterface(ifaceStrings);
    return iface.mac;
};
exports.matchRoute = function (match, route) {
    var matchParts = match.split('/');
    var routeParts = route.split('/');
    if (matchParts.length !== routeParts.length) {
        return false;
    }
    var params = {};
    for (var i = 0; i < routeParts.length; i++) {
        if (matchParts[i].indexOf(':') === 0) {
            var key = matchParts[i].slice(1);
            params[key] = routeParts[i];
        }
        else if (matchParts[i] !== routeParts[i]) {
            return false;
        }
    }
    return params;
};
exports.arping = function (iface, ip) { return new Promise(function (resolve) {
    var tries = 3;
    var interval = setInterval(function () {
        child_process_1.exec("arping -c 5 -w 2000000 -C 1 -I " + iface + " " + ip, function (err, stdout) {
            var online = stdout.toString().indexOf('1 packets received') > 0;
            if (online || (tries <= 0)) {
                clearInterval(interval);
                resolve(online);
            }
            else {
                tries--;
            }
        });
    }, 1000);
}); };
