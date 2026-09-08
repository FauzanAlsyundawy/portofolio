"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/projects";
import { ExternalLink } from "lucide-react";
import CaseStudyDialog from "@/components/interactive/case-study-dialog";

const allTags = Array.from(new Set(projects.flatMap((p) => p.techBadges)));

export function CaseStudies() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filtered = useMemo(() => {
    if (selectedTags.length === 0) return projects;
    return projects.filter((p) => selectedTags.every((tag) => p.techBadges.includes(tag)));
  }, [selectedTags]);

  return (
    <section id="case-studies" className="py-20 bg-surface">
      <div className="container-section">
        <h2 className="text-2xl font-semibold tracking-tight text-ink mb-2">
          Case Studies
        </h2>
        <p className="text-muted mb-6">Filter berdasarkan teknologi:</p>

        <div className="flex flex-wrap gap-2 mb-8">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`
                inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-colors
                ${
                  selectedTags.includes(tag)
                    ? "bg-signal text-white border-signal"
                    : "bg-canvas text-muted border-border hover:text-ink"
                }
              `}
            >
              {tag}
            </button>
          ))}
          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
              className="text-xs text-signal underline underline-offset-2 ml-2"
            >
              Reset
            </button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <Card key={project.slug} className="flex flex-col h-full">
              <div className="px-6 pt-6 pb-4 flex-1">
                <h3 className="font-semibold text-ink mb-2">{project.title}</h3>
                <p className="text-sm text-muted mb-4">{project.summary}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.techBadges.slice(0, 4).map((badge) => (
                    <Badge key={badge} variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                  {project.techBadges.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{project.techBadges.length - 4}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="px-6 pb-6">
                <CaseStudyDialog project={project}>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Lihat Detail
                  </Button>
                </CaseStudyDialog>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted py-12">Tidak ada studi kasus yang cocok dengan filter ini.</p>
        )}
      </div>
    </section>
  );
}
