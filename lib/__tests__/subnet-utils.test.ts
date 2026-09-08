import { describe, it, expect } from "vitest";
import { calculateSubnet } from "@/lib/subnet-utils";

describe("calculateSubnet", () => {
  it("calculates /24 correctly", () => {
    const result = calculateSubnet("192.168.1.0", 24);
    if ("error" in result) throw new Error(result.error);
    expect(result.networkAddress).toBe("192.168.1.0");
    expect(result.broadcastAddress).toBe("192.168.1.255");
    expect(result.subnetMask).toBe("255.255.255.0");
    expect(result.firstHost).toBe("192.168.1.1");
    expect(result.lastHost).toBe("192.168.1.254");
    expect(result.totalHosts).toBe(256);
    expect(result.usableHosts).toBe(254);
  });

  it("calculates /26 correctly", () => {
    const result = calculateSubnet("192.168.1.0", 26);
    if ("error" in result) throw new Error(result.error);
    expect(result.networkAddress).toBe("192.168.1.0");
    expect(result.broadcastAddress).toBe("192.168.1.63");
    expect(result.subnetMask).toBe("255.255.255.192");
    expect(result.firstHost).toBe("192.168.1.1");
    expect(result.lastHost).toBe("192.168.1.62");
    expect(result.totalHosts).toBe(64);
    expect(result.usableHosts).toBe(62);
  });

  it("calculates /30 correctly", () => {
    const result = calculateSubnet("192.168.1.0", 30);
    if ("error" in result) throw new Error(result.error);
    expect(result.networkAddress).toBe("192.168.1.0");
    expect(result.broadcastAddress).toBe("192.168.1.3");
    expect(result.subnetMask).toBe("255.255.255.252");
    expect(result.firstHost).toBe("192.168.1.1");
    expect(result.lastHost).toBe("192.168.1.2");
    expect(result.totalHosts).toBe(4);
    expect(result.usableHosts).toBe(2);
  });

  it("calculates /31 as point-to-point (RFC 3021)", () => {
    const result = calculateSubnet("192.168.1.0", 31);
    if ("error" in result) throw new Error(result.error);
    expect(result.networkAddress).toBe("192.168.1.0");
    expect(result.broadcastAddress).toBeNull();
    expect(result.firstHost).toBe("192.168.1.0");
    expect(result.lastHost).toBe("192.168.1.1");
    expect(result.totalHosts).toBe(2);
    expect(result.usableHosts).toBe(2);
  });

  it("calculates /32 as host route", () => {
    const result = calculateSubnet("192.168.1.5", 32);
    if ("error" in result) throw new Error(result.error);
    expect(result.networkAddress).toBe("192.168.1.5");
    expect(result.broadcastAddress).toBeNull();
    expect(result.firstHost).toBe("192.168.1.5");
    expect(result.lastHost).toBe("192.168.1.5");
    expect(result.totalHosts).toBe(1);
    expect(result.usableHosts).toBe(1);
  });

  it("returns error for invalid IP", () => {
    const result = calculateSubnet("not-an-ip", 24);
    if (!("error" in result)) throw new Error("Expected error");
    expect(result.error).toContain("tidak valid");
  });

  it("returns error for invalid prefix", () => {
    const result = calculateSubnet("192.168.1.0", 33);
    if (!("error" in result)) throw new Error("Expected error");
    expect(result.error).toContain("0 sampai 32");
  });
});
