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
import { skills } from "@/data/skills";

// Radar data otomatis mengikuti data kategori dan score dari data/skills.ts
const radarData = skills.map((s) => ({
  category: s.name,
  score: s.score,
  fullMark: 5,
}));

export default function SkillRadarChart() {
  return (
    <div className="w-full h-80 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="60%">
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis
            dataKey="category"
            tick={{
              fontSize: 10,
              fill: "var(--color-muted)",
              fontWeight: 500,
            }}
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
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Tooltip
            formatter={(value) => [`${value} / 5`, "Kompetensi"]}
            contentStyle={{
              backgroundColor: "var(--color-canvas)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "var(--color-ink)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
