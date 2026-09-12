import { type CaseStudy } from "./types";

export const projects: CaseStudy[] = [
  {
    slug: "bgp-multihoming-2-upstream",
    title: "Implementasi BGP Multihoming 2 Upstream",
    summary:
      "Mengurangi risiko single-point-of-failure dengan dual upstream transit dan route policy yang ketat.",
    problem:
      "Perusahaan bergantung pada satu upstream transit. Ketika terjadi gangguan di sisi ISP, trafik macet total selama 3+ jam.",
    solution:
      "Menambahkan upstream kedua, mengonfigurasi eBGP multihoming dengan MED/Local-Preference, AS-Path prepending, dan prefix-filter berdasarkan RFC 6890.",
    impact:
      "Downtime turun dari rata-rata 3,2 jam/bulan menjadi < 5 menit/bulan. Latency rata-rata ke POP tujuan turun 35 ms.",
    techBadges: ["BGP", "eBGP", "Cisco IOS-XE", "Prefix-List", "Route-Map", "BFD"],
    topologyImage: undefined,
    cliScreenshots: [],
  },
  {
    slug: "ipv4-engineering-address-plan",
    title: "IPv4 Engineering & Address Plan Terstruktur",
    summary:
      "Merancang skema alamat CIDR yang scalable untuk 12.000+ endpoint across multiple locations.",
    problem:
      "Address plan diwariskan dari era klasik dengan subnet acak, menghambat troubleshooting dan alokasi VLAN baru.",
    solution:
      "Mendesain hierarchical addressing scheme menggunakan VLSM, allocating block per site/function, dan mendokumentasikan dalam RIR-style registry.",
    impact:
      "Efisiensi penggunaan blok IP naik dari 42% menjadi 78%. Waktu provisioning subnet baru turun dari 2 hari menjadi < 4 jam.",
    techBadges: ["IPv4 Subnetting", "CIDR", "VLSM", "Route Summarization", "NAT"],
    topologyImage: undefined,
    cliScreenshots: [],
  },
];
