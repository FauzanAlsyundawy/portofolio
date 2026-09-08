"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type CaseStudy } from "@/data/types";

interface CaseStudyDialogProps {
  project: CaseStudy;
  children: React.ReactNode;
}

export default function CaseStudyDialog({ project, children }: CaseStudyDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{project.title}</DialogTitle>
            <DialogDescription>{project.summary}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-ink mb-2">Masalah</h4>
              <p className="text-sm text-muted">{project.problem}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-ink mb-2">Solusi Teknis</h4>
              <p className="text-sm text-muted">{project.solution}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-ink mb-2">Dampak / Hasil</h4>
              <p className="text-sm text-signal font-medium">{project.impact}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-ink mb-2">Teknologi</h4>
              <div className="flex flex-wrap gap-2">
                {project.techBadges.map((badge) => (
                  <Badge key={badge} variant="default">{badge}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-ink mb-2">Topologi</h4>
              <div className="rounded-lg border border-border bg-surface p-4 h-48 flex items-center justify-center">
                <p className="text-xs text-muted">Diagram topologi interaktif dapat ditampilkan di sini pada iterasi berikutnya.</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-ink mb-2">CLI Screenshot</h4>
              <div className="rounded-lg border border-border bg-ink p-4 font-mono text-xs text-green-400">
                <p>{`admin@core-router-01:~$ show ip bgp summary`}</p>
                <p className="mt-2 text-green-300">BGP router identifier 192.0.2.1, local AS number 64512</p>
                <p className="text-green-300">Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down State/PrefRcvd</p>
                <p className="text-green-300">198.51.100.1    4  64512  284192  284192  450001    0    0 4w2d           4500</p>
                <p className="text-green-300">203.0.113.1     4  64513  192403  192403  450001    0    0 4w2d           3200</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
