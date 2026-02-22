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
    
    // Calculate intensity based on distance from 0 (1 = close/intense, 0 = far/subtle)
    const intensity = 1 - Math.min(Math.abs(center) / range, 1);
    
    if (center < 0) {
      // Red gradient for early - intense red near center, subtle at extremes
      const r = Math.round(180 + (75 * intensity)); // 180 -> 255
      const g = Math.round(100 - (40 * intensity));  // 100 -> 60
      const b = Math.round(100 - (40 * intensity));  // 100 -> 60
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Green gradient for late - intense green near center, subtle at extremes
      const r = Math.round(150 - (60 * intensity));  // 150 -> 90
      const g = Math.round(180 + (55 * intensity));  // 180 -> 235
      const b = Math.round(150 - (40 * intensity));  // 150 -> 110
      return `rgb(${r}, ${g}, ${b})`;
    }
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
          <ReferenceLine x={0} stroke="#c9b458" strokeWidth={2} strokeDasharray="3 3" />
          <Bar dataKey="count" radius={[7, 7, 0, 0]}>
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
