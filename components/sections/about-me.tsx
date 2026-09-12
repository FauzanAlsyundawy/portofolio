"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import {
  GraduationCap,
  Wrench,
  Building2,
  Network,
  BookOpen,
  Target,
} from "lucide-react";

export function AboutMe() {
  return (
    <section id="about" className="py-20 bg-surface relative">
      {/* Target anchor to maintain scroll compatibility */}
      <div id="metrics" className="sr-only" aria-hidden="true" />
      <div className="container-section">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Tentang Saya
          </h2>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Kolom Kiri: Latar Belakang Pendidikan, Praktik Lapangan, & Lingkungan Operasional */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="p-6 sm:p-8 h-full flex flex-col gap-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-signal/10 text-signal">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <p className="text-sm sm:text-base text-muted leading-relaxed">
                  Saya merupakan fresh graduate SMK Budhi Warman 1 Jakarta jurusan Teknik Komputer dan Jaringan (TKJ) yang memiliki ketertarikan pada bidang networking, server, IT infrastructure, dan field operations.
                </p>
              </div>

              <div className="h-px w-full bg-border" />

              <div className="flex items-start gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-signal/10 text-signal">
                  <Wrench className="h-5 w-5" />
                </span>
                <p className="text-sm sm:text-base text-muted leading-relaxed">
                  Selama masa pendidikan dan praktik kerja lapangan, saya mendapatkan pengalaman dalam melakukan konfigurasi, monitoring, troubleshooting, dan maintenance jaringan, serta bekerja dengan berbagai perangkat dan teknologi seperti MikroTik, Cisco, Juniper, Linux Server, Proxmox, dan virtualization. Saya juga memiliki sertifikasi MTCNA (MikroTik Certified Network Associate) dan MTCRE (MikroTik Certified Routing Engineer).
                </p>
              </div>

              <div className="h-px w-full bg-border" />

              <div className="flex items-start gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-signal/10 text-signal">
                  <Building2 className="h-5 w-5" />
                </span>
                <p className="text-sm sm:text-base text-muted leading-relaxed">
                  Saya memiliki ketertarikan khusus pada field operations, terutama dalam lingkungan Data Center dan Internet Exchange Point (IXP). Saya memiliki pengalaman terlibat dalam aktivitas operasional dan teknis di lingkungan seperti OpenIXP, IDC, IIX/APJII, Cyber NEX, dan Equinix, termasuk aktivitas terkait perangkat jaringan, server, rack, konektivitas, serta troubleshooting infrastructure.
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Kolom Kanan: Network Lab, Pendidikan Lanjutan, & Arah Karier */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="p-6 sm:p-8 h-full flex flex-col gap-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-signal/10 text-signal">
                  <Network className="h-5 w-5" />
                </span>
                <p className="text-sm sm:text-base text-muted leading-relaxed">
                  Untuk memperdalam kemampuan networking, saya aktif menggunakan virtual lab seperti PNETLab dan Cisco Packet Tracer untuk mempelajari dan melakukan simulasi static &amp; dynamic routing, VLAN, wireless networking, serta berbagai skenario jaringan lainnya. Saya juga senang merancang dan memvisualisasikan topologi jaringan menggunakan Draw.io sebelum melakukan implementasi maupun simulasi.
                </p>
              </div>

              <div className="h-px w-full bg-border" />

              <div className="flex items-start gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-signal/10 text-signal">
                  <BookOpen className="h-5 w-5" />
                </span>
                <p className="text-sm sm:text-base text-muted leading-relaxed">
                  Saat ini, saya sedang melanjutkan pendidikan di STTI NIIT I-Tech pada program studi Teknik Informatika, sembari terus mengembangkan kemampuan melalui hands-on project, network lab, dan pengalaman langsung di bidang network infrastructure dan data center operations.
                </p>
              </div>

              <div className="h-px w-full bg-border" />

              <div className="flex items-start gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-signal/10 text-signal">
                  <Target className="h-5 w-5" />
                </span>
                <p className="text-sm sm:text-base text-muted leading-relaxed">
                  Ke depannya, saya ingin membangun karier sebagai Network Engineer, Infrastructure Engineer, maupun Field Engineer, dengan terus mengembangkan kemampuan teknis dan mendapatkan pengalaman dalam menangani infrastruktur jaringan di lingkungan enterprise dan data center.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
