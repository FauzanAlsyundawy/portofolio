"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// Proficiency score per kategori — sesuaikan dengan keahlian nyata Anda
const radarData = [
  { category: "Routing Protocols", score: 5, fullMark: 5 },
  { category: "IP Management & Policy", score: 4, fullMark: 5 },
  { category: "Hardware & OS Vendor", score: 4, fullMark: 5 },
  { category: "Monitoring & Analysis", score: 3, fullMark: 5 },
  { category: "Lab Env & Automation", score: 3, fullMark: 5 },
];

export default function SkillRadarChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={radarData}>
        <PolarGrid stroke="var(--color-border)" />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fontSize: 10, fill: "var(--color-muted)" }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 5]}
          tick={{ fontSize: 9, fill: "var(--color-muted)" }}
          tickCount={6}
        />
        <Radar
          name="Skill Level"
          dataKey="score"
          stroke="var(--color-signal)"
          fill="var(--color-signal)"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Tooltip
          formatter={(value) => [`${value}/5`, "Proficiency"]}
          contentStyle={{
            backgroundColor: "var(--color-canvas)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
