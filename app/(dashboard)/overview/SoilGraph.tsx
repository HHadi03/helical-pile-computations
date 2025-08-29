'use client'
import { ToverviewSoilSchema } from "@/schemas/soilSchemas"
import { ToverviewSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useTheme } from "next-themes"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export function SoilGraph ({ profileSoils, profile, profileIndex, pileDiameter, hideBearingCapacity, needsHorizontalScroll}: { profileSoils: ToverviewSoilSchema[], profile: ToverviewSoilProfileSchema, profileIndex: number, pileDiameter: number, hideBearingCapacity: boolean, needsHorizontalScroll?: boolean }) {
  
  const { resolvedTheme } = useTheme()
  
  if (profileSoils.length === 0) {
    return (
      <ScrollArea className="overflow-auto grid grid-cols-1 border-2">
        <div className="p-2 bg-sky-50 dark:bg-sky-900/50 whitespace-nowrap"> 
          <h1 className="text-base font-semibold mb-2">{profile.profile_name || `Soil Profile ${profileIndex + 1}`}</h1>
          <p className="text-sm text-muted-foreground">No soil layers detected, add soil layers in configuration to begin analysis.</p>
        </div>
        <ScrollBar orientation="horizontal" className="h-2"/>
      </ScrollArea>
    )
  }

  const filteredSoils = profileSoils.filter(soil => soil.start_depth < profile.effective_pile_length)
  
  const lastLayer = filteredSoils[filteredSoils.length - 1]

  const shaftCapacityKey = pileDiameter === 60 ? "shaft_capacity60" : "shaft_capacity100"
  const bearingCapacity = pileDiameter === 60 ? lastLayer.bearing_capacity60 : lastLayer.bearing_capacity100

  const chartData = filteredSoils.reduce((accumulator, soil, index) => {
    const prevShaft = index === 0 ? 0 : accumulator[index - 1][shaftCapacityKey]

    const cumulativeShaft = prevShaft + soil[shaftCapacityKey]

    accumulator.push({ end_depth: soil.end_depth, [shaftCapacityKey]: Math.round(cumulativeShaft * 100) / 100})

    return accumulator;
  }, [] as { end_depth: number; [key: string]: number }[])
  
  chartData[chartData.length - 1].end_depth = profile.effective_pile_length
  if (!hideBearingCapacity) {chartData[chartData.length - 1][shaftCapacityKey] += bearingCapacity}
  chartData[chartData.length - 1][shaftCapacityKey] = Math.round(chartData[chartData.length - 1][shaftCapacityKey] * 100) / 100
  chartData.unshift({ end_depth: 0, [shaftCapacityKey]: 0 })
  
  return (
    <ScrollArea className={`overflow-auto grid grid-cols-1 ${needsHorizontalScroll ? 'border' : ''}`}>
      <div className="min-w-[634px]">
        
        <div className={`p-2 bg-sky-50 dark:bg-sky-900/50 whitespace-nowrap ${needsHorizontalScroll ? '' : 'border-2'}`}> 
          <div className="flex justify-between">

            <div className="flex flex-col">
              <h1 className="text-base font-semibold">{profile.profile_name|| `Soil Profile ${profileIndex + 1}`}</h1>
              <p className="text-sm mt-auto text-muted-foreground">Pile Diameter: {pileDiameter} mm</p>
            </div>

            <div className="text-right text-sm">
              <p><span className="font-semibold">Maximum Depth:</span> {profile.effective_pile_length} m</p>
              <p><span className="font-semibold">Maximum Total Capacity:</span> {chartData[chartData.length - 1][shaftCapacityKey]} kN</p>
              {!hideBearingCapacity && (
                <p><span className="font-semibold">Bearing Capacity Contribution:</span> {bearingCapacity} kN</p>
              )}
            </div>

          </div>
        </div>

        <div className={`h-110 ${needsHorizontalScroll ? 'border-t' : 'border-b border-x'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} layout="vertical" margin={{ top: 15, right: 40, left: 0, bottom: 30 }}>
              
              <CartesianGrid 
                strokeDasharray="3 3" stroke={resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)"} strokeOpacity={0.5}
              />
              
              <Legend 
                verticalAlign="top"
                height={36}
                layout="vertical"
                wrapperStyle={{ fontSize: '0.875rem' }}
              />

              <Tooltip
                wrapperStyle={{ fontSize: '0.875rem' }}
                cursor={{ stroke: "oklch(0.55 0.04 257)", strokeWidth: 1 }}
                itemStyle={{ color: resolvedTheme === 'dark' ? "oklch(0.985 0.002 247.839)" : "oklch(0.13 0.028 261.692)" }}
                labelStyle={{ color: resolvedTheme === 'dark' ? "oklch(0.985 0.002 247.839)" : "oklch(0.13 0.028 261.692)" }}
                contentStyle={{ backgroundColor: resolvedTheme === 'dark' ? "oklch(0.278 0.033 256.848)" : "oklch(0.967 0.003 264.542)", borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.15)',}}
                labelFormatter={(label) => `Depth: ${label} m`}
                formatter={(value) => [`${Number(value).toFixed(2)} kN`, 'Total Capacity']}
              />

              <YAxis
                dataKey="end_depth" 
                domain={[0, 'dataMax']}
                type="number"
                label={{ fill: resolvedTheme === 'dark' ? "oklch(0.985 0.002 247.839)" : "oklch(0.13 0.028 261.692)", value: 'Depth / m', angle: -90, position: 'insideLeft', offset: 20, fontSize: '0.875rem' }}
                tick={{ fontSize: '0.875rem', fill: resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)" }}
                axisLine={{ stroke: resolvedTheme === 'dark' ? "oklch(0.92 0.00 49)" : "oklch(0.56 0.00 0)", strokeWidth: 2, strokeOpacity: 0.8}}
                tickLine={{ stroke: resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)", strokeWidth: 0.5}}
              />

              <XAxis 
                dataKey={shaftCapacityKey}
                type="number"
                domain={[0, 'dataMax']}
                label={{ fill: resolvedTheme === 'dark' ? "oklch(0.985 0.002 247.839)" : "oklch(0.13 0.028 261.692)", value: 'Capacity / kN', position: 'insideBottom', offset: -10, fontSize: '0.875rem' }}
                tick={{ fontSize: '0.875rem', fill: resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)" }}
                axisLine={{ stroke: resolvedTheme === 'dark' ? "oklch(0.92 0.00 49)" : "oklch(0.56 0.00 0)", strokeWidth: 2, strokeOpacity: 0.8}}
                tickLine={{ stroke: resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)", strokeWidth: 0.5}}
              />
              
              <Line 
                type={"monotone"}
                dataKey={shaftCapacityKey}
                {...resolvedTheme === 'dark' ? { stroke: "oklch(0.62 0.19 260)" } : { stroke: "oklch(0.696 0.17 162.48)" } }
                strokeWidth={2.5}
                animationDuration={1200}
                name="Total Capacity"
                activeDot={{ r: 6 }}
              />
              
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
      <ScrollBar orientation="horizontal" className="h-2"/>
    </ScrollArea>
  )
}