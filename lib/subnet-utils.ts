export interface SubnetResult {
  networkAddress: string;
  broadcastAddress: string | null;
  subnetMask: string;
  wildcardMask: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  binaryOctets: string[];
}

export interface SubnetError {
  error: string;
}

function ipToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const octets = parts.map((p) => Number.parseInt(p, 10));
  if (octets.some((o) => Number.isNaN(o) || o < 0 || o > 255)) return null;
  return (octets[0] << 24) + (octets[1] << 16) + (octets[2] << 8) + octets[3];
}

function intToIp(int: number): string {
  return [
    (int >>> 24) & 0xff,
    (int >>> 16) & 0xff,
    (int >>> 8) & 0xff,
    int & 0xff,
  ].join(".");
}

function intToBinary(int: number): string {
  return int.toString(2).padStart(8, "0");
}

export function calculateSubnet(
  ip: string,
  prefix: number
): SubnetResult | SubnetError {
  const ipInt = ipToInt(ip);
  if (ipInt === null) {
    return { error: "Format IP tidak valid. Gunakan format A.B.C.D (misal 192.168.1.0)." };
  }
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    return { error: "Prefix CIDR harus angka antara 0 sampai 32." };
  }

  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const wildcard = (~mask) >>> 0;
  const network = (ipInt & mask) >>> 0;

  if (prefix === 32) {
    const binary = [
      intToBinary((network >>> 24) & 0xff),
      intToBinary((network >>> 16) & 0xff),
      intToBinary((network >>> 8) & 0xff),
      intToBinary(network & 0xff),
    ];
    return {
      networkAddress: intToIp(network),
      broadcastAddress: null,
      subnetMask: intToIp(mask),
      wildcardMask: intToIp(wildcard),
      firstHost: intToIp(network),
      lastHost: intToIp(network),
      totalHosts: 1,
      usableHosts: 1,
      binaryOctets: binary,
    };
  }

  if (prefix === 31) {
    const first = network;
    const second = network + 1;
    const binary = [
      intToBinary((network >>> 24) & 0xff),
      intToBinary((network >>> 16) & 0xff),
      intToBinary((network >>> 8) & 0xff),
      intToBinary(network & 0xff),
    ];
    return {
      networkAddress: intToIp(first),
      broadcastAddress: null,
      subnetMask: intToIp(mask),
      wildcardMask: intToIp(wildcard),
      firstHost: intToIp(first),
      lastHost: intToIp(second),
      totalHosts: 2,
      usableHosts: 2,
      binaryOctets: binary,
    };
  }

  const broadcast = (network | wildcard) >>> 0;
  const firstHost = network + 1;
  const lastHost = broadcast - 1;
  const totalHosts = broadcast - network + 1;
  const usableHosts = totalHosts - 2;

  const binary = [
    intToBinary((network >>> 24) & 0xff),
    intToBinary((network >>> 16) & 0xff),
    intToBinary((network >>> 8) & 0xff),
    intToBinary(network & 0xff),
  ];

  return {
    networkAddress: intToIp(network),
    broadcastAddress: intToIp(broadcast),
    subnetMask: intToIp(mask),
    wildcardMask: intToIp(wildcard),
    firstHost: intToIp(firstHost),
    lastHost: intToIp(lastHost),
    totalHosts,
    usableHosts: Math.max(usableHosts, 0),
    binaryOctets: binary,
  };
}
