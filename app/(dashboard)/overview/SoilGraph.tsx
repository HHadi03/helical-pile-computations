'use client'
import { ToverviewSoilSchema } from "@/schemas/soilSchemas"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useTheme } from "next-themes"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export function SoilGraph({profileSoils, pileLength, pileDiameter, profileIndex, profileName, windowWidth}: { profileSoils: ToverviewSoilSchema[], pileLength: number, pileDiameter: 60 | 100, profileIndex: number, profileName?: string, windowWidth?: number }) {
  const { theme } = useTheme()

  const filteredSoils = profileSoils.filter(soil => soil.start_depth < pileLength)

  const shaftCapacity = pileDiameter === 60 ? "shaft_capacity60" : "shaft_capacity100"
  const bearingCapacity = pileDiameter === 60 ? "bearing_capacity60" : "bearing_capacity100"
  
  const needsHorizontalScroll = windowWidth != undefined && windowWidth < 490

  const chartData = filteredSoils.reduce((acc, soil, index) => {
    const prevShaft = index === 0 ? 0 : acc[index - 1][shaftCapacity];
    const prevBearing = index === 0 ? 0 : acc[index - 1][bearingCapacity];

    const cumulativeShaft = prevShaft + soil[shaftCapacity];
    const cumulativeBearing = prevBearing + soil[bearingCapacity];

    acc.push({
      end_depth: soil.end_depth,
      [shaftCapacity]: cumulativeShaft,
      [bearingCapacity]: cumulativeBearing
    });

    return acc;
  }, [] as { end_depth: number; [key: string]: number }[]);
  chartData.unshift({ end_depth: 0, [shaftCapacity]: 0, [bearingCapacity]: 0 });

  if (profileSoils.length === 0) {
    return (
      <ScrollArea className="overflow-auto grid grid-cols-1 border-2">
        <div className="p-2 bg-sky-50 dark:bg-sky-900/50 whitespace-nowrap"> 
          <h1 className="text-xl font-semibold mb-2">{profileName || `Soil Profile ${profileIndex + 1}`}</h1>
          <p className="text-sm text-muted-foreground">No soil layers detected, add soil layers in configuration to begin analysis.</p>
        </div>
        <ScrollBar orientation="horizontal" className="h-2"/>
      </ScrollArea>
    )
  }
  
  return (
    <ScrollArea className={`overflow-auto grid grid-cols-1 ${needsHorizontalScroll ? 'border' : ''}`}>
      <div className="min-w-[432px]">
        
        <div className={`p-2 bg-sky-50 dark:bg-sky-900/50 whitespace-nowrap ${needsHorizontalScroll ? '' : 'border-2'}`}> 
          <div className="flex justify-between">

            <div className="flex flex-col">
              <h1 className="text-xl font-semibold">{profileName || `Soil Profile ${profileIndex + 1}`}</h1>
              <p className="text-sm mt-auto text-muted-foreground">Pile Diameter: {pileDiameter} mm</p>
            </div>

            <div className="text-right text-sm">
              <p><span className="font-semibold">Maximum Depth:</span> {Math.max(...filteredSoils.map(s => s.end_depth))} m</p>
              <p><span className="font-semibold">Maximum Shaft Capacity:</span> {Math.max(...filteredSoils.map(s => s[shaftCapacity]))} kN</p>
              <p><span className="font-semibold">Maximum Bearing Capacity:</span> {Math.max(...filteredSoils.map(s => s[bearingCapacity]))} kN</p>
            </div>

          </div>
        </div>

        <div className={`h-110 ${needsHorizontalScroll ? 'border-t' : 'border-b border-x'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} layout="vertical" margin={{ top: 15, right: 40, left: 0, bottom: 30 }}>
              
              <CartesianGrid strokeDasharray="3 3"/>

              <Legend 
                verticalAlign="top" 
                height={36} 
                wrapperStyle={{ fontSize: '14px' }}
              />

              <Tooltip
                wrapperStyle={{ fontSize: '14px' }}
                labelFormatter={(value: number) => `Depth: ${value.toFixed(1)} m`}
                formatter={(value: number, name: string | number) => {
                  const nameStr = String(name);
                  if (
                    nameStr.includes("Shaft") ||
                    nameStr.includes("Bearing") ||
                    nameStr.includes("Total")
                  ) {
                    return [`${value.toFixed(2)} kN`, nameStr];
                  }
                  return [value, nameStr];
                }}
              />

              <YAxis
                dataKey="end_depth" 
                domain={[0, 'dataMax']}
                type="number"
                label={{ value: 'Depth / m', angle: -90, position: 'insideLeft', offset: 20, style: {fontSize: 14} }}
                tick={{ fontSize: 14 }}
              />

              <XAxis 
                dataKey={shaftCapacity}
                type="number"
                domain={[0, 'dataMax']}
                label={{ value: 'Capacity / kN', position: 'insideBottom', offset: -10, style: {fontSize: 14} }}
                tick={{ fontSize: 14 }}
              />
              
              <Line 
                type="monotone"
                dataKey={shaftCapacity}
                {...theme === 'dark' ? { stroke: "oklch(0.696 0.17 162.48)" } : { stroke: "oklch(0.6 0.118 184.704)" }}
                strokeWidth={2}
                name="Shaft Capacity"
                activeDot={{ r: 6 }}
              />
              
              
              <Line 
                type="monotone" 
                dataKey={bearingCapacity}
                {...theme === 'dark' ? { stroke: "oklch(0.488 0.243 264.376)" } : { stroke: "oklch(0.646 0.222 41.116)" }}
                strokeWidth={2} name="Bearing Capacity"
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