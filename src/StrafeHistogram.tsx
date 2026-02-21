import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

interface StrafeHistogramProps {
  timings: number[];
  binSize?: number;
  range?: number;
}

interface BinData {
  center: number;
  count: number;
}

export default function StrafeHistogram({
  timings,
  binSize = 20,
  range = 200,
}: StrafeHistogramProps) {

  const bins: BinData[] = useMemo(() => {
    const binMap = new Map<number, number>();

    // Create bins from -range to +range
    for (let center = -range; center <= range; center += binSize) {
      binMap.set(center, 0);
    }

    // Count timings into bins
    for (const t of timings) {
      const center = Math.round(t / binSize) * binSize;
      if (center >= -range && center <= range) {
        binMap.set(center, (binMap.get(center) ?? 0) + 1);
      }
    }

    // Convert to array and sort
    return Array.from(binMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([center, count]) => ({ center, count }));
  }, [timings, binSize, range]);

  const getBarColor = (center: number) => {
    if (center === 0) return "#c9b458"; // Golden/yellow for perfect
    if (center < 0) return "#e74c3c"; // Red for early
    return "#7ea889"; // Green for late
  };

  if (timings.length === 0) {
    return (
      <div className="histogram-empty">
        <p>No data yet — start strafing!</p>
      </div>
    );
  }

  return (
    <div className="histogram-wrapper">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={bins} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="center" 
            label={{ value: "Timing (ms)", position: "insideBottom", offset: -5 }}
          />
          <YAxis 
            label={{ value: "Count", angle: -90, position: "insideLeft" }}
          />
          <Tooltip 
            contentStyle={{ background: "#1a1a1a", border: "1px solid #444", color: "#fff" }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#fff" }}
          />
          <ReferenceLine x={0} stroke="#c9b458" strokeWidth={2} />
          <Bar dataKey="count">
            {bins.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.center)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="histogram-labels">
        <span>← Early</span>
        <span>Late →</span>
      </div>
    </div>
  );
}
