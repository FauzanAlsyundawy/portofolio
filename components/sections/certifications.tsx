"use client";

import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { certifications } from "@/data/certifications";
import { Shield, ExternalLink, Copy, Check, Search } from "lucide-react";
import { toast } from "sonner";

function isExpiringSoon(expiryDate?: string) {
  if (!expiryDate) return false;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365);
  return diff > 0 && diff < 1;
}

export function Certifications() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success(`ID Kredensial ${id} disalin!`, {
      description: "Tempel pada kolom pencarian di portal Certificate Search MikroTik.",
    });
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <section id="certifications" className="py-20 bg-surface">
      <div className="container-section">
        <div className="max-w-4xl mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-ink mb-2">
            Sertifikasi &amp; Kredensial
          </h2>
          <p className="text-sm text-muted">
            Verifikasi keaslian sertifikat resmi MikroTik di portal pencarian kredensial (Certificate Search) resmi MikroTik.
          </p>
        </div>

        <div ref={ref} className="grid gap-6 grid-cols-1 md:grid-cols-2 max-w-4xl">
          {certifications.map((cert, idx) => {
            const expiring = isExpiringSoon(cert.expiryDate);
            const isCopied = copiedId === cert.credentialId;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.1, 0.3) }}
              >
                <Card className="h-full flex flex-col justify-between hover:shadow-md hover:border-signal/40 transition-all border border-border bg-canvas">
                  <div className="px-6 pt-6 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-signal shrink-0" />
                      <h3 className="font-semibold text-base sm:text-lg text-ink tracking-tight">{cert.name}</h3>
                    </div>
                    <p className="text-sm font-medium text-signal mb-3">{cert.issuer}</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-mono text-muted bg-surface px-2.5 py-1.5 rounded border border-border flex items-center gap-1.5">
                        No. Sertifikat: <strong className="text-ink font-semibold">{cert.credentialId}</strong>
                      </span>
                      {cert.credentialId && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(cert.credentialId!)}
                          className="h-8 px-2.5 text-xs text-muted hover:text-ink flex items-center gap-1 border border-border/70 hover:border-signal"
                          title="Salin Nomor Sertifikat"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-signal" />
                              <span className="text-signal font-medium">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Salin ID</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Issued: {cert.issueDate}
                      </Badge>
                      {cert.expiryDate && (
                        <Badge
                          variant={expiring ? "destructive" : "outline"}
                          className="text-xs"
                        >
                          Exp: {cert.expiryDate}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-4 border-t border-border/60 mt-4 space-y-2">
                    <Button variant="outline" size="sm" asChild className="w-full gap-1.5 hover:text-signal hover:border-signal">
                      <a href={cert.verifyUrl} target="_blank" rel="noopener noreferrer">
                        <Search className="h-3.5 w-3.5 text-signal" />
                        Buka Certificate Search MikroTik
                        <ExternalLink className="h-3 w-3 ml-auto opacity-60" />
                      </a>
                    </Button>
                    <p className="text-[11px] text-muted text-center leading-relaxed">
                      Salin nomor ID di atas, lalu tempel di kolom pencarian MikroTik untuk memverifikasi nama penerima &amp; data training.
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
