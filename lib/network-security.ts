// Network security & target sanitization utilities

export const SAFE_TARGET_REGEX = /^[a-zA-Z0-9.\-:]{1,253}$/;

export function isValidTargetFormat(target: string): boolean {
  if (!target || target.length > 253) return false;
  return SAFE_TARGET_REGEX.test(target);
}

export function isPrivateOrBlockedTarget(target: string): boolean {
  const cleanTarget = target.trim().toLowerCase();

  // RFC1918 and loopback/link-local patterns
  const BLOCKED_PATTERNS = [
    /^10\./,                           // 10.0.0.0/8 (RFC1918)
    /^172\.(1[6-9]|2\d|3[01])\./,      // 172.16.0.0/12 (RFC1918)
    /^192\.168\./,                     // 192.168.0.0/16 (RFC1918)
    /^127\./,                          // 127.0.0.0/8 (Loopback)
    /^169\.254\./,                     // 169.254.0.0/16 (Link-local / AWS metadata)
    /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,  // 100.64.0.0/10 (CGNAT RFC6598)
    /^0\./,                            // Current network
    /^224\./,                          // Multicast
    /^240\./,                          // Reserved
    /^255\.255\.255\.255$/,            // Broadcast
    /^localhost$/,                     // Localhost hostname
    /^.*\.local$/,                     // mDNS / local domain
    /^.*\.internal$/,                  // Internal domain
    /^::1$/,                           // IPv6 loopback
    /^fc00:/,                          // IPv6 unique local (ULA)
    /^fe80:/,                          // IPv6 link-local
    /^::ffff:/i,                       // IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1)
    /^64:ff9b:/i,                      // IPv4-translated IPv6 (RFC6052)
    /^2001:db8:/i,                     // IPv6 documentation prefix
  ];

  return BLOCKED_PATTERNS.some((pattern) => pattern.test(cleanTarget));
}

export function isIPv4Address(str: string): boolean {
  const parts = str.trim().split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const num = Number(p);
    return !isNaN(num) && num >= 0 && num <= 255 && String(num) === p;
  });
}

export function isCIDR(str: string): boolean {
  const parts = str.trim().split("/");
  if (parts.length !== 2) return false;
  const [ip, mask] = parts;
  const maskNum = Number(mask);
  return isIPv4Address(ip) && !isNaN(maskNum) && maskNum >= 0 && maskNum <= 32;
}
