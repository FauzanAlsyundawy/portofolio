export interface CaseStudy {
  slug: string;
  title: string;
  summary: string;
  problem: string;
  solution: string;
  impact: string;
  techBadges: string[];
  topologyImage?: string;
  cliScreenshots?: string[];
}

export interface ExperienceEntry {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  highlights: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  credentialId: string;
  issueDate: string;
  expiryDate?: string;
  verifyUrl: string;
}

export interface SkillCategory {
  name: string;
  icon: string;
  items: { label: string; icon?: string }[];
}

export interface Metric {
  label: string;
  value: string;
  icon: string;
}
