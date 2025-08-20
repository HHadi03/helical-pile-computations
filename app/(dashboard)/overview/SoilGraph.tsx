'use client'
import { ToverviewSoilSchema } from "@/schemas/soilSchemas"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useTheme } from "next-themes"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export function SoilGraph({profileSoils, pileLength, pileDiameter, hideBearingCapacity, profileIndex, profileName, windowWidth}: { profileSoils: ToverviewSoilSchema[], pileLength: number, pileDiameter: 60 | 100, hideBearingCapacity: boolean, profileIndex: number, profileName?: string, windowWidth?: number }) {
  
  const { resolvedTheme } = useTheme()
  
  const needsHorizontalScroll = windowWidth != undefined && windowWidth < 720

  if (profileSoils.length === 0) {
    return (
      <ScrollArea className="overflow-x-auto overflow-y-clip grid grid-cols-1 border-2">
        <div className="p-2 bg-sky-50 dark:bg-sky-900/50 whitespace-nowrap"> 
          <h1 className="text-base font-semibold mb-2">{profileName || `Soil Profile ${profileIndex + 1}`}</h1>
          <p className="text-sm text-muted-foreground">No soil layers detected, add soil layers in configuration to begin analysis.</p>
        </div>
        <ScrollBar orientation="horizontal" className="h-2"/>
      </ScrollArea>
    )
  }

  const filteredSoils = profileSoils.filter(soil => soil.start_depth < pileLength)
  
  const lastLayer = filteredSoils[filteredSoils.length - 1]

  const shaftCapacityKey = pileDiameter === 60 ? "shaft_capacity60" : "shaft_capacity100"
  const bearingCapacity = pileDiameter === 60 ? lastLayer.bearing_capacity60 : lastLayer.bearing_capacity100

  const chartData = filteredSoils.reduce((accumulator, soil, index) => {
    const prevShaft = index === 0 ? 0 : accumulator[index - 1][shaftCapacityKey]

    const cumulativeShaft = prevShaft + soil[shaftCapacityKey]

    accumulator.push({ end_depth: soil.end_depth, [shaftCapacityKey]: Math.round(cumulativeShaft * 100) / 100})

    return accumulator;
  }, [] as { end_depth: number; [key: string]: number }[])
  
  chartData[chartData.length - 1].end_depth = pileLength
  if (!hideBearingCapacity) {chartData[chartData.length - 1][shaftCapacityKey] += bearingCapacity}
  chartData[chartData.length - 1][shaftCapacityKey] = Math.round(chartData[chartData.length - 1][shaftCapacityKey] * 100) / 100
  chartData.unshift({ end_depth: 0, [shaftCapacityKey]: 0 })
  
  return (
    <ScrollArea className={`overflow-x-auto overflow-y-clip grid grid-cols-1 ${needsHorizontalScroll ? 'border' : ''}`}>
      <div className="min-w-[592px]">
        
        <div className={`p-2 bg-sky-50 dark:bg-sky-900/50 whitespace-nowrap ${needsHorizontalScroll ? '' : 'border-2'}`}> 
          <div className="flex justify-between">

            <div className="flex flex-col">
              <h1 className="text-base font-semibold">{profileName || `Soil Profile ${profileIndex + 1}`}</h1>
              <p className="text-sm mt-auto text-muted-foreground">Pile Diameter: {pileDiameter} mm</p>
            </div>

            <div className="text-right text-sm">
              <p><span className="font-semibold">Maximum Depth:</span> {pileLength} m</p>
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
              
              <CartesianGrid vertical={false} stroke="#f5f5f5"/>

              <Legend 
                verticalAlign="top"
                height={36}
                layout="vertical"
                wrapperStyle={{ fontSize: '14px' }}
              />

              <Tooltip
                wrapperStyle={{ fontSize: '14px' }}
              />

              <YAxis
                dataKey="end_depth" 
                domain={[0, 'dataMax']}
                type="number"
                label={{ value: 'Depth / m', angle: -90, position: 'insideLeft', offset: 20, style: {fontSize: 14} }}
                tick={{ fontSize: 14 }}
              />

              <XAxis 
                dataKey={shaftCapacityKey}
                type="number"
                domain={[0, 'dataMax']}
                label={{ value: 'Capacity / kN', position: 'insideBottom', offset: -10, style: {fontSize: 14} }}
                tick={{ fontSize: 14 }}
              />
              
              <Line 
                type={"monotone"}
                dataKey={shaftCapacityKey}
                {...resolvedTheme === 'dark' ? { stroke: "oklch(0.6 0.118 184.704)" } : { stroke: "oklch(0.696 0.17 162.48)" } }
                strokeWidth={2}
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