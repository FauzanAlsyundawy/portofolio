import { Hero } from "@/components/sections/hero";
import { AboutMe } from "@/components/sections/about-me";
import { SkillsMatrix } from "@/components/sections/skills-matrix";
import { CaseStudies } from "@/components/sections/case-studies";
import { ExperienceTimeline } from "@/components/sections/experience-timeline";
import { Certifications } from "@/components/sections/certifications";
import { LabShowcase } from "@/components/sections/lab-showcase";

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutMe />
      <SkillsMatrix />
      <CaseStudies />
      <ExperienceTimeline />
      <Certifications />
      <LabShowcase />
    </>
  );
}
