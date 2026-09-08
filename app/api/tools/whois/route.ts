import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isIPv4Address, isCIDR } from "@/lib/network-security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = rateLimit(ip, 10, 60_000);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "Terlalu banyak permintaan (Rate limit tercapai). Silakan tunggu 1 menit.",
        resetIn: limit.resetInSeconds,
      },
      { status: 429 }
    );
  }

  const query = req.nextUrl.searchParams.get("query")?.trim();
  const requestedType = req.nextUrl.searchParams.get("type"); // 'ip' | 'domain' | undefined

  if (!query) {
    return NextResponse.json({ error: "Parameter query wajib diisi." }, { status: 400 });
  }

  // Sanitasi query
  const SAFE_QUERY = /^[a-zA-Z0-9.\-:\/]{1,253}$/;
  if (!SAFE_QUERY.test(query)) {
    return NextResponse.json({ error: "Format query tidak valid." }, { status: 400 });
  }

  const isIpQuery =
    requestedType === "ip" ||
    isIPv4Address(query) ||
    isCIDR(query) ||
    /^[0-9a-fA-F:]+$/.test(query);

  try {
    if (isIpQuery) {
      // Lookup IP via RDAP (ARIN redirects to proper RIR: APNIC, RIPE, LACNIC, AFRINIC)
      let data: any = null;
      let rirSource = "ARIN";

      try {
        const arinRes = await fetch(`https://rdap.arin.net/registry/ip/${encodeURIComponent(query)}`, {
          headers: { Accept: "application/rdap+json" },
          signal: AbortSignal.timeout(8000),
        });
        if (arinRes.ok) {
          data = await arinRes.json();
          rirSource = "ARIN (RIR Bootstrap)";
        }
      } catch (e) { console.error("[WHOIS] ARIN RDAP lookup failed:", e instanceof Error ? e.message : e); }

      if (!data) {
        // Fallback RIPE
        try {
          const ripeRes = await fetch(`https://rdap.db.ripe.net/ip/${encodeURIComponent(query)}`, {
            headers: { Accept: "application/rdap+json" },
            signal: AbortSignal.timeout(8000),
          });
          if (ripeRes.ok) {
            data = await ripeRes.json();
            rirSource = "RIPE NCC";
          }
        } catch (e) { console.error("[WHOIS] RIPE RDAP lookup failed:", e instanceof Error ? e.message : e); }
      }

      if (!data) {
        // Fallback APNIC
        try {
          const apnicRes = await fetch(`https://rdap.apnic.net/ip/${encodeURIComponent(query)}`, {
            headers: { Accept: "application/rdap+json" },
            signal: AbortSignal.timeout(8000),
          });
          if (apnicRes.ok) {
            data = await apnicRes.json();
            rirSource = "APNIC";
          }
        } catch (e) { console.error("[WHOIS] APNIC RDAP lookup failed:", e instanceof Error ? e.message : e); }
      }

      if (!data) {
        // Fallback IP-API enrichment if all RDAP endpoints time out
        const ipApiRes = await fetch(`https://ip-api.com/json/${encodeURIComponent(query)}?fields=status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,as,query`, {
          signal: AbortSignal.timeout(6000),
        });
        const ipApiData = await ipApiRes.json();
        if (ipApiData.status === "success") {
          return NextResponse.json({
            type: "ip",
            source: "IP-API Directory Fallback",
            structured: {
              networkName: ipApiData.isp || "N/A",
              ipRange: query,
              prefix: query,
              type: "Assigned IP",
              country: ipApiData.country || "N/A",
              rir: "Global ASN Directory",
              orgName: ipApiData.org || ipApiData.isp || "N/A",
              orgHandle: ipApiData.as ? ipApiData.as.split(" ")[0] : "N/A",
              email: "N/A",
              registration: "N/A",
              lastChanged: "N/A",
            },
            raw: ipApiData,
          });
        }
        throw new Error("Gagal mengambil data RDAP dari RIR (ARIN, RIPE, APNIC).");
      }

      // Parse structured IP fields
      const vcards = data.entities?.[0]?.vcardArray?.[1] || [];
      const orgName = vcards.find((v: any) => v[0] === "fn")?.[3] || data.name || "N/A";
      const email = vcards.find((v: any) => v[0] === "email")?.[3] || "N/A (RDAP privacy)";

      const events = data.events || [];
      const regEvent = events.find((e: any) => e.eventAction === "registration");
      const lastChangedEvent = events.find((e: any) => e.eventAction === "last changed");

      return NextResponse.json({
        type: "ip",
        source: rirSource,
        structured: {
          networkName: data.name || "N/A",
          ipRange: `${data.startAddress || ""} - ${data.endAddress || ""}`.trim() || query,
          prefix: data.handle || query,
          type: data.type || "ASSIGNED PORTABLE",
          country: data.country || "N/A",
          rir: rirSource,
          orgName: orgName,
          orgHandle: data.entities?.[0]?.handle || data.handle || "N/A",
          email: email,
          registration: regEvent?.eventDate ? new Date(regEvent.eventDate).toISOString().split("T")[0] : "N/A",
          lastChanged: lastChangedEvent?.eventDate ? new Date(lastChangedEvent.eventDate).toISOString().split("T")[0] : "N/A",
        },
        raw: data,
      });
    } else {
      // Domain lookup
      const tld = query.split(".").pop()?.toLowerCase();
      let rdapBase: string | null = null;

      try {
        const bootstrapRes = await fetch("https://data.iana.org/rdap/dns.json", {
          signal: AbortSignal.timeout(6000),
        });
        if (bootstrapRes.ok) {
          const bootstrap = await bootstrapRes.json();
          for (const [tlds, urls] of bootstrap.services) {
            if ((tlds as string[]).includes(tld ?? "")) {
              rdapBase = (urls as string[])[0];
              break;
            }
          }
        }
      } catch (e) { console.error("[WHOIS] IANA DNS bootstrap failed:", e instanceof Error ? e.message : e); }

      if (!rdapBase) {
        rdapBase = "https://rdap.org/domain/";
      }

      let domainUrl: string;
      if (rdapBase.includes("/domain/")) {
        domainUrl = `${rdapBase.replace(/\/+$/, "")}/${encodeURIComponent(query)}`;
      } else {
        const cleanBase = rdapBase.replace(/\/+$/, "");
        domainUrl = `${cleanBase}/domain/${encodeURIComponent(query)}`;
      }

      let domainRes = await fetch(domainUrl, {
        headers: { Accept: "application/rdap+json" },
        signal: AbortSignal.timeout(8000),
      });

      if (!domainRes.ok) {
        // Fallback to rdap.org
        const fallbackUrl = `https://rdap.org/domain/${encodeURIComponent(query)}`;
        const fallbackRes = await fetch(fallbackUrl, {
          headers: { Accept: "application/rdap+json" },
          signal: AbortSignal.timeout(8000),
        });
        if (fallbackRes.ok) {
          domainRes = fallbackRes;
        } else {
          throw new Error(`RDAP lookup domain gagal dengan status ${domainRes.status}.`);
        }
      }

      const data = await domainRes.json();

      const events = data.events || [];
      const regEvent = events.find((e: any) => e.eventAction === "registration");
      const expEvent = events.find((e: any) => e.eventAction === "expiration");
      const lastChangedEvent = events.find((e: any) => e.eventAction === "last changed");

      const registrar = data.entities?.find((e: any) =>
        e.roles?.includes("registrar")
      );
      const registrarVcard = registrar?.vcardArray?.[1] || [];
      const registrarName = registrarVcard.find((v: any) => v[0] === "fn")?.[3] || registrar?.handle || "N/A";

      const nameservers = (data.nameservers || []).map((ns: any) => ns.ldhName).filter(Boolean);

      return NextResponse.json({
        type: "domain",
        source: "IANA RDAP Directory",
        structured: {
          domainName: data.ldhName || query,
          status: Array.isArray(data.status) ? data.status.join(", ") : "Active",
          registrar: registrarName,
          registration: regEvent?.eventDate ? new Date(regEvent.eventDate).toISOString().split("T")[0] : "N/A",
          expiration: expEvent?.eventDate ? new Date(expEvent.eventDate).toISOString().split("T")[0] : "N/A",
          lastChanged: lastChangedEvent?.eventDate ? new Date(lastChangedEvent.eventDate).toISOString().split("T")[0] : "N/A",
          nameservers: nameservers.length > 0 ? nameservers.join(", ") : "N/A",
        },
        raw: data,
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal melakukan lookup RDAP.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
