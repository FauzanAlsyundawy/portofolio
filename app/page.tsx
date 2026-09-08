import { Hero } from "@/components/sections/hero";
import { Metrics } from "@/components/sections/metrics";
import { SkillsMatrix } from "@/components/sections/skills-matrix";
import { CaseStudies } from "@/components/sections/case-studies";
import { ExperienceTimeline } from "@/components/sections/experience-timeline";
import { Certifications } from "@/components/sections/certifications";
import { LabShowcase } from "@/components/sections/lab-showcase";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Metrics />
      <SkillsMatrix />
      <CaseStudies />
      <ExperienceTimeline />
      <Certifications />
      <LabShowcase />
    </>
  );
}
