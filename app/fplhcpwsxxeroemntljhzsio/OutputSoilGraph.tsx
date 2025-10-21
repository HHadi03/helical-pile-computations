import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { roundToTwoDecimals } from "@/lib/utils"
import { TexportSoilSchema } from "@/schemas/soilSchemas"

export function OutputSoilGraph ({ soilsData, effectivePileLength, pileDiameter }: { soilsData: TexportSoilSchema[], effectivePileLength: number, pileDiameter: string }) {

  const filteredSoils = soilsData.filter(soil => soil.start_depth < effectivePileLength)

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
	lastBaseChartEntry[shaftCapacityKey] += bearingCapacity

  if (lastBaseChartEntry.end_depth > effectivePileLength) {lastBaseChartEntry.end_depth = effectivePileLength}

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
    <div className="mt-12 break-inside-avoid max-w-[700px] h-100 border">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} layout="vertical" margin={{ top: 15, right: 40, left: 0, bottom: 30 }}>
          
          <CartesianGrid 
            strokeDasharray="3 3"
            stroke={"oklch(0.551 0.027 264.364)"}
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
            itemStyle={{ color: "oklch(0.13 0.028 261.692)" }}
            labelStyle={{ color: "oklch(0.13 0.028 261.692)" }}
            contentStyle={{ backgroundColor: "oklch(0.967 0.003 264.542)", borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.15)',}}
            labelFormatter={(label) => `Depth: ${label} m`}
            formatter={(value) => [`${Number(value).toFixed(2)} kN`, 'Total Capacity']}
          />

          <YAxis
            dataKey="end_depth" 
            domain={['dataMin', 'dataMax']}
            type="number"
            label={{ fill: "oklch(0.13 0.028 261.692)", value: 'Depth (m)', angle: -91, position: 'insideLeft', offset: 20, fontSize: '0.875rem' }}
            tick={{ fontSize: '0.875rem', fill: "oklch(0.551 0.027 264.364)" }}
            axisLine={{ stroke: "oklch(0.56 0.00 0)", strokeWidth: 2, strokeOpacity: 0.8}}
            tickLine={{ stroke: "oklch(0.551 0.027 264.364)", strokeWidth: 0.5}}
          />

          <XAxis 
            dataKey={shaftCapacityKey}
            type="number"
            domain={['dataMin', 'dataMax']}
            label={{ fill: "oklch(0.13 0.028 261.692)", value: 'Capacity (kN)', position: 'insideBottom', offset: -10, fontSize: '0.875rem' }}
            tick={{ fontSize: '0.875rem', fill: "oklch(0.551 0.027 264.364)" }}
            axisLine={{ stroke: "oklch(0.56 0.00 0)", strokeWidth: 2, strokeOpacity: 0.8}}
            tickLine={{ stroke: "oklch(0.551 0.027 264.364)", strokeWidth: 0.5}}
          />
          
          <Line 
            type={"linear"}
            dataKey={shaftCapacityKey}
            stroke={"oklch(0.696 0.17 162.48)"}
            strokeWidth={2.5}
            isAnimationActive={false}
            name="Total Capacity"
            activeDot={{ r: 6 }}
            dot={false} 
          />
          
        </LineChart>
      </ResponsiveContainer>
    </div>
	)
}