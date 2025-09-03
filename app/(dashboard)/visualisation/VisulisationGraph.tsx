"use client"

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,  Legend, ResponsiveContainer
} from 'recharts';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';


// --- Type definitions ---
interface SoilData {
  start_depth: number;
  end_depth: number;
  shaft_capacity60?: number;
  bearing_capacity60?: number;
  shaft_capacity100?: number;
  bearing_capacity100?: number;
}

interface ProfilePileCombination {
  profileId: string;
  profileName: string;
  pileSize: '60mm' | '100mm';
  soilData: SoilData[];
}

interface VisualizationConfig {
  selectedCombinations: ProfilePileCombination[];
  bearingCapacityEnabled: boolean;
  configuredAt: string;
}

interface LineConfig {
  key: string;
  name: string;
  dataKey: string;
  color: string;
  data: Record<string, number>[];
}

// Colors
const COLORS = [
  "oklch(0.696 0.17 162.48)",
  "oklch(0.62 0.19 260)",
  "oklch(0.75 0.20 30)",
  "oklch(0.65 0.25 330)",
  "oklch(0.70 0.15 120)",
  "oklch(0.60 0.20 200)",
  "oklch(0.80 0.18 60)",
  "oklch(0.55 0.22 300)",
];

export default function MultiProfileSoilChart() {
  const { resolvedTheme } = useTheme();

  const [chartData, setChartData] = useState<Record<string, number>[]>([]);
  const [profileLines, setProfileLines] = useState<LineConfig[]>([]);
  const [config, setConfig] = useState<VisualizationConfig | null>(null);

  const router = useRouter()

  useEffect(() => {
    const loadConfiguration = () => {
    try {
      const configData = localStorage.getItem("visualization_config");
      if (!configData) {
        return;
      }

      const parsedConfig: VisualizationConfig = JSON.parse(configData);
      setConfig(parsedConfig);
      processChartData(parsedConfig);
    } catch (err) {
     
      console.error("Error loading config:", err);
    }
  };
  loadConfiguration();
}, []);

  

  const resetConfiguration = () => {
    localStorage.removeItem("visualization_config");
    setConfig(null);
    setChartData([]);
    setProfileLines([]);
    router.refresh();
  };

  const processChartData = (config: VisualizationConfig) => {
    try {
      const allDepths = new Set<number>();

      config.selectedCombinations.forEach(combination => {
        combination.soilData.forEach(soil => {
          allDepths.add(0);
          allDepths.add(soil.end_depth);
        });
      });

      const sortedDepths = Array.from(allDepths).sort((a, b) => a - b);

      const lineConfigs: LineConfig[] = [];

      config.selectedCombinations.forEach((combination, index) => {
        const shaftCapacityKey =
          combination.pileSize === "60mm" ? "shaft_capacity60" : "shaft_capacity100";
        const bearingCapacityKey =
          combination.pileSize === "60mm" ? "bearing_capacity60" : "bearing_capacity100";

        const combinationData = combination.soilData.reduce<Record<string, number>[]>(
          (accumulator, soil, soilIndex) => {
            const prevShaft =
              soilIndex === 0 ? 0 : accumulator[soilIndex - 1][shaftCapacityKey];
            const cumulativeShaft = prevShaft + (soil[shaftCapacityKey] || 0);

            accumulator.push({
              end_depth: soil.end_depth,
              [shaftCapacityKey]: Math.round(cumulativeShaft * 100) / 100,
            });

            return accumulator;
          },
          []
        );

        if (config.bearingCapacityEnabled && combinationData.length > 0) {
          const lastPoint = combinationData[combinationData.length - 1];
          const lastSoil = combination.soilData[combination.soilData.length - 1];
          const bearingCapacity = lastSoil[bearingCapacityKey] || 0;

          lastPoint[shaftCapacityKey] = Math.round(
            (lastPoint[shaftCapacityKey] + bearingCapacity) * 100
          ) / 100;
        }

        combinationData.unshift({ end_depth: 0, [shaftCapacityKey]: 0 });

        const lineKey = `${combination.profileName}_${combination.pileSize}`;
        lineConfigs.push({
          key: lineKey,
          name: `${combination.profileName} (${combination.pileSize})`,
          dataKey: lineKey,
          color: COLORS[index % COLORS.length],
          data: combinationData,
        });
      });

      const mergedData = sortedDepths.map(depth => {
        const dataPoint: Record<string, number> = { end_depth: depth };

        lineConfigs.forEach(lineConfig => {
          let capacityValue = 0;
          for (let i = lineConfig.data.length - 1; i >= 0; i--) {
            if (lineConfig.data[i].end_depth <= depth) {
              const shaftCapacityKey = lineConfig.key.includes("60mm")
                ? "shaft_capacity60"
                : "shaft_capacity100";
              capacityValue = lineConfig.data[i][shaftCapacityKey] || 0;
              break;
            }
          }
          dataPoint[lineConfig.dataKey] = capacityValue;
        });

        return dataPoint;
      });

      setChartData(mergedData);
      setProfileLines(lineConfigs);
    } catch (err) {
     
      console.error("Error processing chart data:", err);
    }
  };

  


  if (!config || profileLines.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-600 mb-4">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Soil Profile Capacity Comparison</h2>
        <p className="text-sm text-gray-600">
          Comparing {profileLines.length} profile/pile combinations
          {config.bearingCapacityEnabled && " (including bearing capacity)"}
        </p>
      </div>

      <div className="h-96 border-2 rounded-lg">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            layout="vertical"
            margin={{ top: 15, right: 40, left: 60, bottom: 30 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={
                resolvedTheme === "dark"
                  ? "oklch(0.707 0.022 261.325)"
                  : "oklch(0.551 0.027 264.364)"
              }
              strokeOpacity={0.5}
            />

            <Legend
              verticalAlign="top"
              height={Math.ceil(profileLines.length / 2) * 20 + 16}
              layout="vertical"
              wrapperStyle={{ fontSize: "0.875rem" }}
            />

            

            <YAxis
              dataKey="end_depth"
              domain={[0, "dataMax"]}
              type="number"
              label={{
                fill:
                  resolvedTheme === "dark"
                    ? "oklch(0.985 0.002 247.839)"
                    : "oklch(0.13 0.028 261.692)",
                value: "Depth / m",
                angle: -90,
                position: "insideLeft",
                offset: 20,
                fontSize: "0.875rem",
              }}
              tick={{
                fontSize: "0.875rem",
                fill:
                  resolvedTheme === "dark"
                    ? "oklch(0.707 0.022 261.325)"
                    : "oklch(0.551 0.027 264.364)",
              }}
              axisLine={{
                stroke:
                  resolvedTheme === "dark"
                    ? "oklch(0.92 0.00 49)"
                    : "oklch(0.56 0.00 0)",
                strokeWidth: 2,
                strokeOpacity: 0.8,
              }}
              tickLine={{
                stroke:
                  resolvedTheme === "dark"
                    ? "oklch(0.707 0.022 261.325)"
                    : "oklch(0.551 0.027 264.364)",
                strokeWidth: 0.5,
              }}
            />

            <XAxis
              type="number"
              domain={[0, "dataMax"]}
              label={{
                fill:
                  resolvedTheme === "dark"
                    ? "oklch(0.985 0.002 247.839)"
                    : "oklch(0.13 0.028 261.692)",
                value: "Capacity / kN",
                position: "insideBottom",
                offset: -10,
                fontSize: "0.875rem",
              }}
              tick={{
                fontSize: "0.875rem",
                fill:
                  resolvedTheme === "dark"
                    ? "oklch(0.707 0.022 261.325)"
                    : "oklch(0.551 0.027 264.364)",
              }}
              axisLine={{
                stroke:
                  resolvedTheme === "dark"
                    ? "oklch(0.92 0.00 49)"
                    : "oklch(0.56 0.00 0)",
                strokeWidth: 2,
                strokeOpacity: 0.8,
              }}
              tickLine={{
                stroke:
                  resolvedTheme === "dark"
                    ? "oklch(0.707 0.022 261.325)"
                    : "oklch(0.551 0.027 264.364)",
                strokeWidth: 0.5,
              }}
            />

            {profileLines.map((lineConfig) => (
              <Line
                key={lineConfig.key}
                type="monotone"
                dataKey={lineConfig.dataKey}
                stroke={lineConfig.color}
                strokeWidth={2.5}
                animationDuration={1200}
                name={lineConfig.name}
                activeDot={{ r: 4, fill: lineConfig.color }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Configuration loaded: {new Date(config.configuredAt).toLocaleString()}</p>
      </div>

      <div className='mt-2 flex gap-5'>
        <Button>Download Chart</Button>
        <Button onClick={resetConfiguration}>Reset Configuration</Button>
      </div>
    </div>
  );
}
