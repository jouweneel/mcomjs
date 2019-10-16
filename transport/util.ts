import { exec } from 'child_process'
import { networkInterfaces, NetworkInterfaceInfo } from 'os'
import { path } from 'ramda'

export const getInterface = (ifaceStrings: string[] = []): NetworkInterfaceInfo => {
  const strings = ['eth0', 'en0', 'enp5s0', ...ifaceStrings];
  const ifaces = networkInterfaces();

  for (let i = 0; i < strings.length; i++) {
    const iface = path<NetworkInterfaceInfo>([strings[i], 0], ifaces);
    if (iface) {
      return iface;
    }
  }
  throw new Error(`getInterfaces: no interface found in ${JSON.stringify(strings)}`);
}

export const getIp = (
  broadcast: boolean = false,
  ifaceStrings?: string[]
) => {
  const iface = getInterface(ifaceStrings);
  const ip = iface.address;
  if (broadcast) {
    const parts = ip.split('.');
    parts[3] = '255';
    return parts.join('.');
  } else {
    return ip;
  }
}

export const getMac = (ifaceStrings?: string[]) => {
  const iface = getInterface(ifaceStrings);
  return iface.mac;
}

export const matchRoute = (match: string, route: string) => {
  const matchParts = match.split('/');
  const routeParts = route.split('/');
  if (matchParts.length !== routeParts.length) {
    return false;
  }

  const params = {};
  for (let i = 0; i < routeParts.length; i++) {
    if (matchParts[i].indexOf(':') === 0) {
      const key = matchParts[i].slice(1);
      params[key] = routeParts[i];
    } else if (matchParts[i] !== routeParts[i]) {
      return false;
    }
  }
  return params;
}

export const arping = (
  iface: string, ip: string
): Promise<boolean> => new Promise(resolve => {
  let tries = 3;
  let interval = setInterval(() => {
    exec(`arping -c 5 -w 2000000 -C 1 -I ${iface} ${ip}`, (err, stdout) => {
      const online = stdout.toString().indexOf('1 packets received') > 0;
      if (online || (tries <= 0)) {
        clearInterval(interval);
        resolve(online);
      } else {
        tries--;
      }
    });
  }, 1000);
});
