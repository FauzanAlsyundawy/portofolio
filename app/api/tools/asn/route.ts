import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isIPv4Address } from "@/lib/network-security";

export const dynamic = "force-dynamic";

interface AsnResult {
  asn: string;
  org: string;
  country: string;
  isp: string;
}

export async function GET(req: NextRequest): Promise<Response> {
  const ip = getClientIp(req);
  // ASN lookup: 60 requests per minute (per hop enrichment)
  const limit = rateLimit(`asn_${ip}`, 60, 60_000);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Rate limit ASN lookup tercapai." },
      { status: 429 }
    );
  }

  const query = req.nextUrl.searchParams.get("ip")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Parameter ip wajib diisi." }, { status: 400 });
  }

  // Only allow valid IPv4 for ASN lookup
  if (!isIPv4Address(query)) {
    return NextResponse.json({ error: "Format IP tidak valid." }, { status: 400 });
  }

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(query)}?fields=status,as,org,country,isp`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "ip-api.com tidak tersedia." }, { status: 502 });
    }

    const data = await res.json();

    if (data.status !== "success" || !data.as) {
      return NextResponse.json({ asn: null, org: null, country: null, isp: null });
    }

    const result: AsnResult = {
      asn: data.as.split(" ")[0] ?? "",
      org: data.org || data.isp || "",
      country: data.country || "",
      isp: data.isp || "",
    };

    return NextResponse.json(result, {
      headers: {
        // Cache ASN lookups for 5 minutes — ASN data changes rarely
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (e) {
    console.error("[ASN] ip-api.com lookup failed:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Gagal melakukan ASN lookup." }, { status: 500 });
  }
}
