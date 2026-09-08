import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import CaseStudyDialog from "@/components/interactive/case-study-dialog";

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return notFound();

  return (
    <div className="min-h-dvh pt-24 pb-16">
      <div className="container-section">
        <CaseStudyDialog project={project}>
          <span className="text-signal underline underline-offset-2 cursor-pointer">
            Back to case studies
          </span>
        </CaseStudyDialog>

        <h1 className="text-3xl font-bold text-ink mt-6 mb-4">{project.title}</h1>
        <p className="text-muted mb-8">{project.summary}</p>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-ink mb-2">Masalah</h3>
              <p className="text-muted">{project.problem}</p>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Solusi Teknis</h3>
              <p className="text-muted">{project.solution}</p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-ink mb-2">Dampak / Hasil</h3>
              <p className="text-signal font-medium">{project.impact}</p>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Teknologi</h3>
              <div className="flex flex-wrap gap-2">
                {project.techBadges.map((badge) => (
                  <span key={badge} className="inline-flex items-center rounded-md border border-border px-2.5 py-1 text-xs font-medium text-ink">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
