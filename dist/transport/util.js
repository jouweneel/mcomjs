"use strict";
exports.__esModule = true;
var child_process_1 = require("child_process");
var os_1 = require("os");
var ramda_1 = require("ramda");
exports.getIp = function (broadcast, ifaceStrings) {
    if (broadcast === void 0) { broadcast = false; }
    if (ifaceStrings === void 0) { ifaceStrings = ['eth0', 'en0', 'enp5s0']; }
    var ifaces = os_1.networkInterfaces();
    for (var i = 0; i < ifaceStrings.length; i++) {
        var ip = ramda_1.path([ifaceStrings[i], 0, 'address'], ifaces);
        if (ip) {
            if (broadcast) {
                var parts = ip.split('.');
                parts[3] = '255';
                return parts.join('.');
            }
            else {
                return ip;
            }
        }
    }
    throw new Error("util.getIp: no ip found");
};
exports.getMac = function () {
    var ifaces = os_1.networkInterfaces();
    return ramda_1.pathOr(ramda_1.path(['en0', 0, 'mac'], ifaces), ['eth0', 0, 'mac'], ifaces);
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
