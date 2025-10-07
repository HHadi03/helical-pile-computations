import { ToverviewSoilSchema } from "@/schemas/soilSchemas"
import { ToverviewSoilProfileSchema } from "@/schemas/soilProfileSchemas"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useTheme } from "next-themes"
import { roundToTwoDecimals } from "@/lib/utils"

export function SoilGraph ({ profileSoils, profile, profileIndex, pileDiameter, hideBearingCapacity}: { profileSoils: ToverviewSoilSchema[], profile: ToverviewSoilProfileSchema, profileIndex: number, pileDiameter: string, hideBearingCapacity: boolean }) {
  const { resolvedTheme } = useTheme()
  
  const filteredSoils = profileSoils.filter(soil => soil.start_depth < profile.effective_pile_length)

  const shaftCapacityKey = pileDiameter === "60" ? "shaft_capacity60" : "shaft_capacity100"
  const bearingCapacity = pileDiameter === "60" ? filteredSoils[filteredSoils.length - 1].bearing_capacity60 : filteredSoils[filteredSoils.length - 1].bearing_capacity100

  const baseChartData = filteredSoils.reduce((accumulator, soil, index) => {
    const prevShaft = index === 0 ? 0 : accumulator[index - 1][shaftCapacityKey]
    const cumulativeShaft = prevShaft + soil[shaftCapacityKey]

    accumulator.push({ 
      end_depth: soil.end_depth,
      [shaftCapacityKey]: cumulativeShaft,
    })

    return accumulator
  }, [] as { end_depth: number; [key: string]: number }[])

  const lastBaseChartEntry = baseChartData[baseChartData.length - 1]

  if (!hideBearingCapacity) {lastBaseChartEntry[shaftCapacityKey] += bearingCapacity}
  lastBaseChartEntry[shaftCapacityKey] = roundToTwoDecimals(lastBaseChartEntry[shaftCapacityKey])
  if (lastBaseChartEntry.end_depth > profile.effective_pile_length) {lastBaseChartEntry.end_depth = profile.effective_pile_length}
  
  const interpolateCapacity = (targetDepth: number): number => {
    for (let i = 0; i < baseChartData.length; i++) {
      const currentLayer = baseChartData[i]
      
      const prevDepth = i === 0 ? 0 : baseChartData[i - 1].end_depth
      const prevCapacity = i === 0 ? 0 : baseChartData[i - 1][shaftCapacityKey]
      
      if (targetDepth <= currentLayer.end_depth) {
        const depthRange = currentLayer.end_depth - prevDepth
        const capacityRange = currentLayer[shaftCapacityKey] - prevCapacity
        const progress = (targetDepth - prevDepth) / depthRange
        
        return prevCapacity + (capacityRange * progress)
      }
    }
    
    return lastBaseChartEntry[shaftCapacityKey]
  }

  const createDenseChartData = () => {
    const denseData = []
    const step = 0.1 
    
    denseData.push({ end_depth: 0, [shaftCapacityKey]: 0 })

    const maxDepth = lastBaseChartEntry.end_depth

    let i = 1
    while (i * step < maxDepth) {
      const depth = roundToTwoDecimals(i * step)
      denseData.push({ end_depth: depth, [shaftCapacityKey]: roundToTwoDecimals(interpolateCapacity(depth)) })
      i++
    }

    denseData.push({ end_depth: roundToTwoDecimals(maxDepth), [shaftCapacityKey]: roundToTwoDecimals(interpolateCapacity(maxDepth)) })

    return denseData
  }
  
  const chartData = createDenseChartData()
  return (
    <div className="border">
      <div className="p-2 bg-sky-50 dark:bg-sky-900/50 border"> 
        <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-y-0">

          <div className="flex flex-col">
            <h2 className="font-semibold line-clamp-1" title={profile.profile_name || `Soil Profile ${profileIndex + 1}`}>{profile.profile_name || `Soil Profile ${profileIndex + 1}`}</h2>
            <p className="text-sm mt-auto text-muted-foreground">Pile Diameter: {pileDiameter} mm</p>
          </div>

          <div className="sm:text-right text-sm sm:whitespace-nowrap">
            <p><span className="font-semibold">Maximum Depth:</span> {lastBaseChartEntry.end_depth} m</p>
            <p><span className="font-semibold">Maximum Total Capacity:</span> {lastBaseChartEntry[shaftCapacityKey].toFixed(2)} kN</p>
            {!hideBearingCapacity && (<p><span className="font-semibold">Bearing Capacity Contribution:</span> {bearingCapacity.toFixed(2)} kN</p>)}
          </div>

        </div>
      </div>

      <div className={`h-110 border-t`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} layout="vertical" margin={{ top: 15, right: 40, left: 0, bottom: 30 }}>
            
            <CartesianGrid 
              strokeDasharray="3 3"
              stroke={resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)"}
              strokeOpacity={0.5}
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
              domain={['dataMin', 'dataMax']}
              type="number"
              label={{ fill: resolvedTheme === 'dark' ? "oklch(0.985 0.002 247.839)" : "oklch(0.13 0.028 261.692)", value: 'Depth (m)', angle: -91, position: 'insideLeft', offset: 20, fontSize: '0.875rem' }}
              tick={{ fontSize: '0.875rem', fill: resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)" }}
              axisLine={{ stroke: resolvedTheme === 'dark' ? "oklch(0.92 0.00 49)" : "oklch(0.56 0.00 0)", strokeWidth: 2, strokeOpacity: 0.8}}
              tickLine={{ stroke: resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)", strokeWidth: 0.5}}
            />

            <XAxis 
              dataKey={shaftCapacityKey}
              type="number"
              domain={['dataMin', 'dataMax']}
              label={{ fill: resolvedTheme === 'dark' ? "oklch(0.985 0.002 247.839)" : "oklch(0.13 0.028 261.692)", value: 'Capacity (kN)', position: 'insideBottom', offset: -10, fontSize: '0.875rem' }}
              tick={{ fontSize: '0.875rem', fill: resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)" }}
              axisLine={{ stroke: resolvedTheme === 'dark' ? "oklch(0.92 0.00 49)" : "oklch(0.56 0.00 0)", strokeWidth: 2, strokeOpacity: 0.8}}
              tickLine={{ stroke: resolvedTheme === 'dark' ? "oklch(0.707 0.022 261.325)" : "oklch(0.551 0.027 264.364)", strokeWidth: 0.5}}
            />
            
            <Line 
              type={"linear"}
              dataKey={shaftCapacityKey}
              {...resolvedTheme === 'dark' ? { stroke: "oklch(0.62 0.19 260)" } : { stroke: "oklch(0.696 0.17 162.48)" } }
              strokeWidth={2.5}
              animationDuration={1200}
              name="Total Capacity"
              activeDot={{ r: 6 }}
              dot={false} 
            />
            
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}