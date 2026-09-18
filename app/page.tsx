import { Hero } from "@/components/sections/hero";
import { AboutMe } from "@/components/sections/about-me";
import { TechnicalSkills } from "@/components/sections/technical-skills";
import { SkillsMatrix } from "@/components/sections/skills-matrix";
import { ExperienceTimeline } from "@/components/sections/experience-timeline";
import { Certifications } from "@/components/sections/certifications";
import { LabShowcase } from "@/components/sections/lab-showcase";

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutMe />
      <TechnicalSkills />
      <SkillsMatrix />
      <ExperienceTimeline />
      <Certifications />
      <LabShowcase />
    </>
  );
}
