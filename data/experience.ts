import { type ExperienceEntry } from "./types";

export const experience: ExperienceEntry[] = [
  {
    company: "PT. Nusantara Broadband",
    role: "Senior Network Engineer",
    startDate: "2022-03",
    highlights: [
      "Merancang dan mengoperasikan infrastruktur routing untuk 150+ router di 28 site.",
      "Memimpin migrasi dari OSPF single-area ke multi-area, mengurangi konvergensi dari 28 detik ke 7 detik.",
      "Mengelola 4 transit upstream dan 2 peering di IXP Jakarta, menjaga SLA uptime 99,97%.",
      "Membangun pipeline konfigurasi otomatis menggunakan Ansible + Netmiko, mengurangi human error 80%.",
    ],
  },
  {
    company: "PT. Sentral Data Solusi",
    role: "Network Engineer",
    startDate: "2019-08",
    endDate: "2022-02",
    highlights: [
      "Menangani 200+ tiket insiden jaringan per bulan dengan MTTR rata-rata < 12 menit.",
      "Mengimplementasikan BGP multihoming 2 upstream untuk reducing downtime dari 4 jam/bulan ke < 30 menit/bulan.",
      "Mendesain address plan IPv4 terstruktur untuk 8.000+ endpoint, meningkatkan efisiensi alokasi blok dari 35% menjadi 72%.",
      "Mengoperasikan monitoring Zabbix + Grafana untuk 60+ perangkat jaringan.",
    ],
  },
  {
    company: "PT. Teknologi Mandiri",
    role: "Junior Network Administrator",
    startDate: "2017-01",
    endDate: "2019-07",
    highlights: [
      "Mengelola infrastruktur LAN/WAN untuk kantor cabang 5 kota.",
      "Mengonfigurasi dan memelihara router Cisco dan MikroTik.",
      "Mendokumentasikan konfigurasi dan prosedur operasi harian untuk tim support.",
    ],
  },
];
